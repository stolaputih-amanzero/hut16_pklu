export default function CheckStatusLoading() {
  return (
    <div className="container mx-auto min-h-screen py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border-2 border-white/10 bg-black/50 p-6 md:p-8 backdrop-blur-xl animate-pulse space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="space-y-2">
              <div className="h-3 w-32 bg-white/10 rounded" />
              <div className="h-6 w-48 bg-white/20 rounded" />
            </div>
            <div className="h-7 w-32 bg-emerald-500/20 rounded-full" />
          </div>

          {/* Code Banner Skeleton */}
          <div className="flex items-center justify-between p-4 bg-black/60 rounded-xl border border-white/10">
            <div className="space-y-2">
              <div className="h-2.5 w-24 bg-white/10 rounded" />
              <div className="h-8 w-40 bg-[#D4AF37]/30 rounded" />
            </div>
            <div className="h-12 w-12 bg-white/10 rounded-xl" />
          </div>

          {/* Name Skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-40 bg-white/10 rounded" />
            <div className="h-7 w-64 bg-white/20 rounded" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl space-y-2">
              <div className="h-3 w-28 bg-white/10 rounded" />
              <div className="h-5 w-36 bg-white/20 rounded" />
            </div>
            <div className="p-4 bg-white/5 rounded-xl space-y-2">
              <div className="h-3 w-28 bg-white/10 rounded" />
              <div className="h-5 w-36 bg-white/20 rounded" />
            </div>
            <div className="p-4 bg-white/5 rounded-xl space-y-2">
              <div className="h-3 w-28 bg-white/10 rounded" />
              <div className="h-5 w-36 bg-white/20 rounded" />
            </div>
            <div className="p-4 bg-white/5 rounded-xl space-y-2">
              <div className="h-3 w-28 bg-white/10 rounded" />
              <div className="h-5 w-36 bg-white/20 rounded" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="pt-4 border-t border-white/10 flex justify-center">
            <div className="h-4 w-56 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
