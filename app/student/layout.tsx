import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    redirect('/login');
  }

  return (
    <div className="dashboard-layout" style={{ background: 'var(--background)' }}>
      <main className="main-content" style={{ margin: '0 auto', maxWidth: '1200px', width: '100%', padding: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <div className="logo">AptitudeX <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>| Student Portal</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Hello, <strong style={{ color: 'var(--text-light)' }}>{session.username}</strong></span>
            <LogoutButton style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} />
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
}
