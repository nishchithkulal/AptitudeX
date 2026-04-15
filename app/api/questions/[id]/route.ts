import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { questionText, category, topic, difficulty, options, correctAnswer, explanation } = body;

    if (!questionText || !category || !options || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.run(
      `UPDATE questions 
       SET questionText = ?, category = ?, topic = ?, difficulty = ?, options = ?, correctAnswer = ?, explanation = ?
       WHERE id = ?`,
      [questionText, category, topic || 'General', difficulty || 'Medium', JSON.stringify(options), correctAnswer, explanation || '', id]
    );
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = await getDb();
    
    // First remove references in assessment_questions to avoid constraint errors
    await db.run('DELETE FROM assessment_questions WHERE question_id = ?', [id]);
    
    const result = await db.run('DELETE FROM questions WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
