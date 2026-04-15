import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateExamCode } from '@/lib/utils';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, duration, num_questions, category, randomize_questions, randomize_options } = await request.json();

    const db = await getDb();

    // Check if enough questions exist
    const availableQuestions = await db.all('SELECT id FROM questions WHERE category = ?', [category]);
    if (availableQuestions.length < num_questions) {
      return NextResponse.json({ error: `Not enough questions in bank for ${category}. Available: ${availableQuestions.length}` }, { status: 400 });
    }

    const exam_code = generateExamCode();

    const result = await db.run(
      `INSERT INTO assessments (title, duration, num_questions, category, randomize_questions, randomize_options, exam_code, createdBy, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [title, duration, num_questions, category, randomize_questions ? 1 : 0, randomize_options ? 1 : 0, exam_code, session.userId]
    );

    const assessmentId = result.lastID;

    // Randomly assign questions
    const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, num_questions);

    for (const q of selected) {
      await db.run('INSERT INTO assessment_questions (assessment_id, question_id) VALUES (?, ?)', [assessmentId, q.id]);
    }

    return NextResponse.json({ message: 'Assessment created successfully', exam_code, id: assessmentId }, { status: 201 });
  } catch (error) {
    console.error('Create assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const assessments = await db.all('SELECT * FROM assessments ORDER BY id DESC');
  return NextResponse.json(assessments);
}
