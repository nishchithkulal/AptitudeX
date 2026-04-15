import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized access. Only students can take exams.' }, { status: 401 });
  }

  try {
    const { examCode } = await request.json();

    if (!examCode) {
      return NextResponse.json({ error: 'Exam code is required' }, { status: 400 });
    }

    const db = await getDb();
    const assessment = await db.get('SELECT id, duration FROM assessments WHERE exam_code = ?', [examCode]);

    if (!assessment) {
      return NextResponse.json({ error: 'Invalid exam code. Please check and try again.' }, { status: 404 });
    }

    // Check existing attendance / responses
    const existingAttendance = await db.get('SELECT id, status FROM attendance WHERE studentId = ? AND examId = ?', [session.userId, assessment.id]);

    if (existingAttendance && existingAttendance.status === 'completed') {
      return NextResponse.json({ error: 'You have already completed this exam.' }, { status: 403 });
    }

    if (!existingAttendance) {
      // Mark attendance as starting
      await db.run('INSERT INTO attendance (studentId, examId, status) VALUES (?, ?, ?)', [session.userId, assessment.id, 'started']);
    }

    return NextResponse.json({ message: 'Exam validated successfully', assessmentId: assessment.id }, { status: 200 });

  } catch (error) {
    console.error('Exam validation error:', error);
    return NextResponse.json({ error: 'Internal server error while validating exam code' }, { status: 500 });
  }
}
