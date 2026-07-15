export default function GalleryLoading() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50 dark:bg-[#090a0f] transition-colors duration-300">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Title skeleton */}
        <div className="animate-pulse flex flex-col items-center mb-16 space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-64"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-96"></div>
        </div>

        {/* Masonry image grids skeleton */}
        <div className="animate-pulse columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {[...Array(6)].map((_, index) => {
            const heights = ["h-64", "h-80", "h-56", "h-72", "h-96", "h-60"];
            const currentHeight = heights[index % heights.length];
            return (
              <div 
                key={index}
                className={`w-full ${currentHeight} bg-slate-200 dark:bg-slate-800 rounded-2xl break-inside-avoid shadow-sm`}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
