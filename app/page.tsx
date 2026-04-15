import Link from "next/link";
import Hero3DWrapper from '@/components/Hero3DWrapper';

export default async function Home() {

  return (
    <div className="landing-container">
      <header className="navbar">
        <div className="logo">AptitudeX</div>
        <nav className="nav-links">
          <Link href="/login" className="btn btn-outline">Login</Link>
          <Link href="/register" className="btn btn-primary">Register</Link>
        </nav>
      </header>
      
      <main className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Evaluate Potential, Effortlessly</h1>
          <p className="hero-subtitle">
            A modern, secure, and structured aptitude assessment platform for administrators and students.
          </p>
          <div className="hero-actions">
            <form action="/student" className="exam-code-box">
              <input type="text" name="code" placeholder="Enter Exam Code (e.g. APT-123)" className="input-field" />
              <button type="submit" className="btn btn-primary">Join Exam</button>
            </form>
            <span className="or-divider">or</span>
            <Link href="/login" className="btn btn-secondary">Admin Login</Link>
          </div>
        </div>
        <div className="hero-3d-container">
          <Hero3DWrapper />
        </div>
      </main>
    </div>
  );
}
