export default function AdminDashboardLoading() {
  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl flex-grow flex flex-col justify-start">
      {/* Header Info Skeleton */}
      <div className="animate-pulse flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="flex flex-col items-start gap-3 w-1/2">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded w-64 mt-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-80 mt-1"></div>
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="animate-pulse grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl p-6"></div>
        ))}
      </div>

      {/* Tab Selector Buttons Skeleton */}
      <div className="animate-pulse flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="animate-pulse bg-white/50 dark:bg-slate-950/20 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900 rounded w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
