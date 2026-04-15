'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Hero3D component with ssr: false
// This wrapper can be safely imported into Server Components
const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false });

export default function Hero3DWrapper() {
  return <Hero3D />;
}
