import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* 1. WELCOME GREETING SECTION SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          {/* Welcome title skeleton */}
          <div className="h-8 w-64 sm:w-80 rounded-xl bg-slate-200 dark:bg-[#1E2638]" />
          {/* Subtitle skeleton */}
          <div className="h-4 w-48 sm:w-60 rounded-lg bg-slate-100 dark:bg-[#161D2B]" />
        </div>

        {/* Date and Match Count Pill Skeleton */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <div className="h-8 w-44 rounded-xl bg-slate-100 dark:bg-[#121824]" />
          <div className="h-8 w-20 rounded-xl bg-slate-100 dark:bg-[#121824]" />
        </div>
      </div>

      {/* 2. ROW OF 4 METRIC CARDS SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-[#121824]" />
              <div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-[#1C2638]" />
            </div>
            <div className="flex items-baseline space-x-2 pl-12">
              <div className="h-7 w-16 rounded-md bg-slate-300 dark:bg-[#253046]" />
              <div className="h-4 w-12 rounded-sm bg-slate-100 dark:bg-[#161D2B]" />
            </div>
          </div>
        ))}
      </div>

      {/* Live Data / API Status Banner Skeleton */}
      <div className="rounded-xl border border-slate-200 dark:border-[#161D2B] bg-slate-50 dark:bg-[#0A0F1D] px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-[#253046]" />
          <div className="h-4 w-full sm:w-96 rounded-md bg-slate-100 dark:bg-[#121824]" />
        </div>
        <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-[#1C2638]" />
      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Matches list */}
        <div className="lg:col-span-8 space-y-5">
          {/* Left Title section */}
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-32 rounded-md bg-slate-200 dark:bg-[#1C2638]" />
              <div className="h-3 w-56 rounded-md bg-slate-100 dark:bg-[#121824]" />
            </div>
            <div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-[#121824]" />
          </div>

          {/* League Filter Pills Skeletons */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-24 flex-shrink-0 rounded-full bg-slate-100 dark:bg-[#0F1626] border border-slate-200 dark:border-[#1E2638]"
              />
            ))}
          </div>

          {/* 4 Matches Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-4.5 shadow-2xs space-y-4"
              >
                {/* Match Card Header Skeleton */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 rounded-md bg-slate-200 dark:bg-[#1E2638]" />
                    <div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-[#121824]" />
                  </div>
                  <div className="h-4 w-12 rounded-full bg-slate-100 dark:bg-[#121824]" />
                </div>

                {/* Match Card Teams Skeleton */}
                <div className="space-y-3 py-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-[#1E2638]" />
                      <div className="h-4.5 w-32 rounded-md bg-slate-300 dark:bg-[#253046]" />
                    </div>
                    <div className="h-5 w-6 rounded-md bg-slate-100 dark:bg-[#121824]" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-[#1E2638]" />
                      <div className="h-4.5 w-28 rounded-md bg-slate-300 dark:bg-[#253046]" />
                    </div>
                    <div className="h-5 w-6 rounded-md bg-slate-100 dark:bg-[#121824]" />
                  </div>
                </div>

                {/* Probabilities 1X2 buttons skeletons */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-[#141C2E]">
                  {[1, 2, 3].map((b) => (
                    <div key={b} className="h-10 rounded-xl bg-slate-100 dark:bg-[#121824] flex items-center justify-center" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar Panels Skeletons */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Banner Panel Skeleton */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-[#1E2638]" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded-md bg-slate-300 dark:bg-[#253046]" />
                <div className="h-3 w-20 rounded-md bg-slate-100 dark:bg-[#121824]" />
              </div>
            </div>
            <div className="space-y-2 py-1">
              <div className="h-3 w-full rounded bg-slate-100 dark:bg-[#121824]" />
              <div className="h-3 w-full rounded bg-slate-100 dark:bg-[#121824]" />
              <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-[#121824]" />
            </div>
            <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-[#1E2638]" />
          </div>

          {/* Quick Filters Panel Skeleton */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-5 shadow-2xs space-y-4">
            <div className="h-4.5 w-32 rounded-md bg-slate-200 dark:bg-[#1E2638]" />
            <div className="space-y-3">
              {[1, 2, 3].map((f) => (
                <div key={f} className="space-y-1.5">
                  <div className="h-3 w-16 rounded bg-slate-100 dark:bg-[#121824]" />
                  <div className="h-9 w-full rounded-lg bg-slate-50 dark:bg-[#0A0F1D] border border-slate-100 dark:border-[#141C2E]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
