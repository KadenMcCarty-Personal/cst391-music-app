// app/about/page.tsx
// SSR Component — no "use client" directive.
// This component has no hooks or browser interactivity, so Next.js renders it
// entirely on the server and sends pre-built HTML to the browser.
// Citation: Bootstrap Jumbotron / Card pattern — https://getbootstrap.com/docs/5.3/components/card/

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="container py-5">
      <div className="card shadow-sm">
        <div className="card-body text-center p-5">
          <h1 className="card-title display-4">Music App</h1>
          <hr />
          
          <div className="mt-4">
            <h4>Boss</h4>
            <p className="fs-5 fw-bold">Kaden McCarty</p>
          </div>
          <div className="mt-4">
            <h5>Tech Stack</h5>
            <ul className="list-unstyled">
              <li>Next.js 14 (App Router)</li>
              <li>TypeScript</li>
              <li>Bootstrap 5</li>
              <li>Neon PostgreSQL</li>
              <li>Vercel</li>
            </ul>
          </div>
          <Link href="/" className="btn btn-primary mt-3">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
