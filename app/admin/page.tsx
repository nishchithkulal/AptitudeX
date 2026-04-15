import { getDb } from '@/lib/db';

export default async function AdminDashboardPage() {
  const db = await getDb();
  
  // Basic stats aggregation
  const { totalAssessments } = await db.get('SELECT COUNT(*) as totalAssessments FROM assessments') || { totalAssessments: 0 };
  const { totalQuestions } = await db.get('SELECT COUNT(*) as totalQuestions FROM questions') || { totalQuestions: 0 };
  const { totalStudents } = await db.get('SELECT COUNT(*) as totalStudents FROM users WHERE role = "student"') || { totalStudents: 0 };

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>
      
      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-label">Total Assessments</span>
          <span className="stat-value">{totalAssessments}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Questions in Bank</span>
          <span className="stat-value">{totalQuestions}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Registered Students</span>
          <span className="stat-value">{totalStudents}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Active Exams</span>
          <span className="stat-value">0</span>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/admin/questions" className="btn btn-secondary">Add New Question</a>
          <a href="/admin/assessments" className="btn btn-primary">Create Assessment</a>
          <a href="/admin/results" className="btn btn-secondary">Publish Results</a>
        </div>
      </div>
    </div>
  );
}
