export default function StudentDashboardLoading() {
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

      {/* Main Grid Skeleton */}
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Left Column Profile Skeleton */}
        <div className="animate-pulse md:col-span-1 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
          </div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
        </div>

        {/* Right Column Details Skeleton */}
        <div className="md:col-span-2 space-y-8">
          {/* Fees status cards */}
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>

          {/* Table container skeleton */}
          <div className="animate-pulse bg-white/50 dark:bg-slate-950/20 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-900 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
