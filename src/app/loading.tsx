export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 dark:bg-[#090a0f] transition-colors duration-300">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated pulsing outer ring */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#8B5CF6]/20 animate-ping"></div>
          <div className="w-12 h-12 rounded-full border-4 border-t-[#8B5CF6] border-r-transparent border-b-[#8B5CF6] border-l-transparent animate-spin"></div>
        </div>
        <span className="text-xs font-black text-[#8B5CF6] tracking-[0.2em] uppercase animate-pulse">Loading Vinayak...</span>
      </div>
    </div>
  );
}
