export default function TeacherDashboardLoading() {
  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl flex-grow flex flex-col justify-start">
      {/* Header Info Skeleton */}
      <div className="animate-pulse flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="flex flex-col items-start gap-3 w-1/2">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-28"></div>
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded w-64 mt-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-80 mt-1"></div>
        </div>
      </div>

      {/* Selectors grid Skeleton */}
      <div className="animate-pulse grid md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        ))}
      </div>

      {/* Tab Selectors Skeleton */}
      <div className="animate-pulse flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
      </div>

      {/* Main Register Area Skeleton */}
      <div className="animate-pulse bg-white/50 dark:bg-slate-950/20 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex justify-between mb-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-900">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-16"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
