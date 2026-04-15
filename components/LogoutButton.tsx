'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton({ className, style, children }: { className?: string, style?: React.CSSProperties, children?: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/');
        router.refresh(); // Force a refresh to clear any cached layout state containing the user
      } else {
        console.error('Logout failed');
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleLogout} 
      className={className || "btn btn-outline"} 
      style={style}
      disabled={loading}
    >
      {loading ? 'Logging out...' : (children || 'Logout')}
    </button>
  );
}
