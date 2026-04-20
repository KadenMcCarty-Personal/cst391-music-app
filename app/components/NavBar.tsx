'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function NavBar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    // @ts-expect-error: Bootstrap's JavaScript bundle lacks TypeScript definitions.
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link href="/" className="navbar-brand">
        🎵 Music App
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavAltMarkup"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">
          {isAdmin && (
            <Link href="/new" className="nav-item nav-link">
              New Album
            </Link>
          )}
          <Link href="/about" className="nav-item nav-link">
            About
          </Link>
          {session ? (
            <Link href="/api/auth/signout" className="nav-item nav-link">
              Sign Out
            </Link>
          ) : (
            <Link href="/api/auth/signin" className="nav-item nav-link">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
