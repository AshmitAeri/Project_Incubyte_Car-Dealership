import React from 'react';

/**
 * Loading skeleton for car grid
 */
const CarCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-52 rounded-none" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
      </div>
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-24" />
        <div className="skeleton h-10 w-20 rounded-xl" />
      </div>
    </div>
  </div>
);

export const LoadingSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CarCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Table skeleton
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="card overflow-hidden">
    <div className="p-4 border-b border-gray-100 dark:border-white/10">
      <div className="skeleton h-6 w-48" />
    </div>
    <div className="divide-y divide-gray-100 dark:divide-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
          {Array.from({ length: cols - 2 }).map((_, j) => (
            <div key={j} className="skeleton h-4 w-20" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Dashboard stat card skeleton
 */
export const StatCardSkeleton = () => (
  <div className="stat-card">
    <div className="skeleton w-14 h-14 rounded-2xl" />
    <div className="space-y-2">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton h-7 w-20" />
    </div>
  </div>
);

export default LoadingSkeleton;
