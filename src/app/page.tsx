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
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col items-center justify-center p-6 text-foreground">
      <header className="animate-item mb-12">
        <Image
          className="dark:invert opacity-80"
          src="/next.svg"
          alt="Internly"
          width={120}
          height={24}
          priority
        />
      </header>
      
      <main className="flex flex-col items-center text-center max-w-2xl gap-8">
        <h1 className="animate-item text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Internship tracking <br />
          <span className="text-primary">made elegant.</span>
        </h1>
        
        <p className="animate-item text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
          The all-in-one platform for students to manage their career journey. 
          Beautifully simple, powerfully effective.
        </p>

        <div className="animate-item flex flex-col sm:flex-row gap-4 mt-4">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center px-8 rounded-full bg-primary text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20"
          >
            Get Started
          </Link>
          <a
            href="https://nextjs.org/docs"
            className="flex h-12 items-center justify-center px-8 rounded-full border border-slate-200 dark:border-slate-800 font-medium hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-200"
          >
            Read Docs
          </a>
        </div>
      </main>

      <footer className="animate-item mt-24 text-sm text-slate-400">
        Built with Next.js & GSAP
      </footer>
    </div>
  );
}
