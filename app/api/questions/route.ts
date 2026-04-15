import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const questions = await db.all('SELECT * FROM questions ORDER BY id DESC');
  
  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { questionText, category, topic, difficulty, options, correctAnswer, explanation } = body;

    if (!questionText || !category || !options || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO questions (questionText, category, topic, difficulty, options, correctAnswer, explanation, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [questionText, category, topic || 'General', difficulty || 'Medium', JSON.stringify(options), correctAnswer, explanation || '', session.userId]
    );

    return NextResponse.json({ message: 'Question created successfully', id: result.lastID }, { status: 201 });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
