import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { examId, violationType, timestamp } = await request.json();

    if (!examId || !violationType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    // Prevent duplicate rapid violations (within 2 seconds)
    const lastViolation = await db.get(
      `SELECT timestamp FROM violations WHERE studentId = ? AND examId = ? AND violation_type = ? ORDER BY id DESC LIMIT 1`,
      [session.userId, examId, violationType]
    );

    if (lastViolation) {
      const lastTime = new Date(lastViolation.timestamp).getTime();
      const currentTime = new Date(timestamp || Date.now()).getTime();
      
      if (currentTime - lastTime <= 2000) {
        return NextResponse.json({ message: 'Duplicate violation ignored' }, { status: 200 });
      }
    }

    // Store the violation in the database
    await db.run(
      `INSERT INTO violations (studentId, examId, violation_type, timestamp) VALUES (?, ?, ?, ?)`,
      [session.userId, examId, violationType, new Date(timestamp || Date.now()).toISOString()]
    );

    return NextResponse.json({ message: 'Violation recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Record violation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
