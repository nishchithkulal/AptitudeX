import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  
  const records = await db.all(`
    SELECT
      a.id as attendance_id,
      a.examId,
      ass.title as exam_title,
      ass.exam_code,
      u.name as student_name,
      a.status,
      a.startTime,
      (SELECT COUNT(*) FROM violations v WHERE v.studentId = a.studentId AND v.examId = a.examId) as violations
    FROM attendance a
    JOIN users u ON a.studentId = u.id
    JOIN assessments ass ON a.examId = ass.id
    ORDER BY a.startTime DESC
  `);

  return NextResponse.json(records);
}
