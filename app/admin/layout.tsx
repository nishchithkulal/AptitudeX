import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }} />
          AptitudeX
        </div>
        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-item">Dashboard</Link>
          <Link href="/admin/questions" className="nav-item">Question Bank</Link>
          <Link href="/admin/assessments" className="nav-item">Create Assessment</Link>
          <Link href="/admin/monitoring" className="nav-item">Exam Monitoring</Link>
          <Link href="/admin/results" className="nav-item">Results Management</Link>
        </nav>
        <div style={{ padding: '1.5rem', marginTop: 'auto' }}>
          <LogoutButton style={{ width: '100%' }} />
        </div>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <span style={{ color: 'var(--text-muted)' }}>Admin: <strong style={{ color: 'var(--text-light)' }}>{session.username}</strong></span>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
