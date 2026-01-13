"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".animate-item", {
        y: 10,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col items-center justify-center p-6 text-slate-100">
      <header className="animate-item mb-16">
        <Image
          className="invert opacity-90"
          src="/next.svg"
          alt="Internly"
          width={100}
          height={20}
          priority
        />
      </header>
      
      <main className="flex flex-col items-center text-center max-w-2xl gap-8">
        <h1 className="animate-item text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Streamline your <br />
          <span className="text-indigo-500">internship journey.</span>
        </h1>
        
        <p className="animate-item text-lg text-slate-400 max-w-lg leading-relaxed">
          The professional platform for students to track, manage, and accelerate their career growth.
        </p>

        <div className="animate-item flex flex-col sm:flex-row gap-4 mt-6">
          <Link
            href="/login"
            className="flex h-11 items-center justify-center px-8 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors duration-200"
          >
            Sign In
          </Link>
          <a
            href="https://nextjs.org/docs"
            className="flex h-11 items-center justify-center px-8 rounded-md border border-slate-700 text-slate-300 font-medium hover:bg-slate-900 transition-colors duration-200"
          >
            Documentation
          </a>
        </div>
      </main>

      <footer className="animate-item mt-32 text-xs font-medium tracking-widest uppercase text-slate-500">
        Professional Edition &middot; 2026
      </footer>
    </div>
  );
}
