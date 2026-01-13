"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function DashboardClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".stat-card", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { label: "Total Applications", value: "24", change: "+4 this week", color: "blue" },
    { label: "Interviews", value: "3", change: "1 upcoming", color: "indigo" },
    { label: "Offers", value: "1", change: "Keep it up!", color: "emerald" },
    { label: "Response Rate", value: "12%", change: "+2% from last month", color: "slate" },
  ];

  return (
    <div ref={containerRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="stat-card p-6 rounded-2xl glass shadow-sm hover:shadow-md transition-all duration-300 group cursor-default"
        >
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
            {stat.label}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {stat.value}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {stat.change}
          </p>
        </div>
      ))}
      
      <div className="stat-card sm:col-span-2 lg:col-span-4 p-8 rounded-2xl glass shadow-sm min-h-[300px] flex items-center justify-center border-dashed border-2 border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-60H6" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-semibold">No applications yet</h4>
            <p className="text-slate-500 max-w-[240px] text-sm">
              Ready to start your journey? Add your first internship application.
            </p>
          </div>
          <button className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:scale-[1.02] active:scale-[0.98] transition-all">
            Add Application
          </button>
        </div>
      </div>
    </div>
  );
}
