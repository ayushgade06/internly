"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function DashboardClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".stat-card", {
        y: 10,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.1
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { label: "Total Applications", value: "24", change: "+4 this week" },
    { label: "Interviews", value: "3", change: "1 upcoming" },
    { label: "Offers", value: "1", change: "High success rate" },
    { label: "Response Rate", value: "12%", change: "+2% from avg" },
  ];

  return (
    <div ref={containerRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="stat-card p-6 rounded-lg bg-slate-900 border border-slate-800 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {stat.label}
          </p>
          <h3 className="text-3xl font-bold text-white mt-3 tracking-tight">
            {stat.value}
          </h3>
          <p className="text-xs text-indigo-400 mt-2 font-medium">
            {stat.change}
          </p>
        </div>
      ))}
      
      <div className="stat-card sm:col-span-2 lg:col-span-4 p-12 rounded-lg bg-slate-900 border border-slate-800 border-dashed min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-60H6" />
            </svg>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white">No active applications</h4>
            <p className="text-slate-400 max-w-[320px] mx-auto text-sm leading-relaxed">
              Start tracking your career opportunities by adding your first internship application today.
            </p>
          </div>
          <button className="px-8 py-2.5 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-500 transition-all duration-200">
            Add Application
          </button>
        </div>
      </div>
    </div>
  );
}
