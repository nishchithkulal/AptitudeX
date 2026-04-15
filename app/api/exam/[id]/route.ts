import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = await props.params;
  const assessmentId = params.id;

  const db = await getDb();
  const assessment = await db.get('SELECT id, title, duration, randomize_questions, randomize_options FROM assessments WHERE id = ?', [assessmentId]);
  
  if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

  // Verify attendance: student must have 'started' status to access questions
  const attendance = await db.get('SELECT status FROM attendance WHERE studentId = ? AND examId = ?', [session.userId, assessmentId]);
  if (!attendance || attendance.status === 'completed') {
    return NextResponse.json({ error: 'Exam already submitted or not started correctly' }, { status: 403 });
  }

  // Get questions (excluding correctAnswer and explanation)
  const questions = await db.all(`
    SELECT q.id, q.questionText, q.options 
    FROM questions q
    JOIN assessment_questions aq ON q.id = aq.question_id
    WHERE aq.assessment_id = ?
  `, [assessmentId]);

  // Parse options and randomize if required
  questions.forEach(q => {
    q.options = JSON.parse(q.options);
    if (assessment.randomize_options) {
      q.options.sort(() => Math.random() - 0.5);
    }
  });

  if (assessment.randomize_questions) {
    questions.sort(() => Math.random() - 0.5);
  }

  return NextResponse.json({ assessment, questions });
}
