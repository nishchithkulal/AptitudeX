import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const params = await props.params;
    const assessmentId = params.id;
    const { answers, time_taken } = await request.json(); // violations are stored by /api/exam/violation in real-time, no need to destructure here if unused

    const db = await getDb();
    
    // Validate submission isn't already done
    const existing = await db.get('SELECT id FROM responses WHERE studentId = ? AND examId = ?', [session.userId, assessmentId]);
    if (existing) {
       return NextResponse.json({ message: 'Exam already submitted (Idempotent)', existing: true }, { status: 200 });
    }

    // Mark attendance as completed
    await db.run('UPDATE attendance SET status = "completed" WHERE studentId = ? AND examId = ?', [session.userId, assessmentId]);

    // Note: Violations loop deleted. The frontend already transmits violations seamlessly in real-time to the /api/exam/violation endpoint. Re-inserting them here from the payload array causes pure duplication.

    // Grade Exam
    const questionsAndAnswers = await db.all(`
      SELECT q.id, q.correctAnswer
      FROM questions q
      JOIN assessment_questions aq ON q.id = aq.question_id
      WHERE aq.assessment_id = ?
    `, [assessmentId]);

    let correct_answers = 0;
    const total_questions = questionsAndAnswers.length;

    for (const qa of questionsAndAnswers) {
      if (answers[qa.id.toString()] === qa.correctAnswer) {
        correct_answers++;
      }
    }

    // Calculate score (simple point per question)
    const score = correct_answers;

    // Store response
    await db.run(
      'INSERT INTO responses (studentId, examId, score, total_questions, correct_answers, time_taken, answers_payload) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [session.userId, assessmentId, score, total_questions, correct_answers, time_taken, JSON.stringify(answers)]
    );

    return NextResponse.json({ message: 'Exam submitted successfully' });
  } catch(error) {
     console.error('Submission error:', error);
     return NextResponse.json({ error: 'Internal server error during submission' }, { status: 500 });
  }
}
