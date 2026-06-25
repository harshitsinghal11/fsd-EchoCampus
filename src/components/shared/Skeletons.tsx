// Announcement Skeleton
export function AnnouncementSkeleton({ isWidget = false }: { isWidget?: boolean }) {
  return (
    <div className="space-y-4 pr-2 w-full">
      {[...Array(isWidget ? 3 : 5)].map((_, i) => (
        <div
          key={i}
          className={`border w-full flex flex-col animate-pulse ${isWidget
            ? "bg-slate-800/60 p-4 rounded-xl border-slate-700/50"
            : "relative overflow-hidden bg-slate-800/40 backdrop-blur-xl p-6 md:p-8 rounded-2xl border-slate-700/50 shadow-xl"
            }`}
        >
          <div className="flex flex-col gap-1 w-full">
            <div className={`h-6 bg-slate-700/50 rounded-md w-3/4 ${isWidget ? 'mb-1' : 'mb-2'}`}></div>
            <div className="space-y-2 mt-1">
              <div className="h-4 bg-slate-700/50 rounded-md w-full"></div>
              <div className="h-4 bg-slate-700/50 rounded-md w-5/6"></div>
            </div>

            <div className={`flex ${isWidget ? "mt-2" : "mt-4"}`}>
              <div className={`h-8 bg-slate-700/50 rounded-lg ${isWidget ? 'w-20' : 'w-32'}`}></div>
            </div>

            {!isWidget && (
              <div className="mt-5 pt-4 border-t border-slate-700/50 space-y-2.5 flex flex-col justify-end grow">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-700/50 shrink-0"></div>
                  <div className="h-4 bg-slate-700/50 rounded-md w-1/4"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Marketplace Skeleton Card
export function MarketplaceSkeleton({ isWidget = false }: { isWidget?: boolean }) {
  return (
    <div className={`grid gap-4 md:gap-6 items-start ${isWidget
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
      }`}>
      {[...Array(isWidget ? 4 : 6)].map((_, i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl p-5 md:p-6 border transition-all duration-300 bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-xl animate-pulse">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="h-6 bg-slate-700/50 rounded-md w-3/4"></div>
            <div className="h-6 bg-slate-700/50 rounded-full w-16 shrink-0"></div>
          </div>
          {/* Price */}
          <div className="h-8 bg-slate-700/50 rounded-md w-1/3 mt-3"></div>
          {/* Description */}
          <div className="mt-2 space-y-1">
            <div className="h-4 bg-slate-700/50 rounded-md w-full"></div>
            <div className="h-4 bg-slate-700/50 rounded-md w-5/6"></div>
          </div>
          {/* Footer (User/Phone) */}
          <div className="mt-5 pt-4 border-t border-slate-700/50 space-y-2.5 flex flex-col justify-end grow">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-700/50 rounded-full shrink-0"></div>
              <div className="h-4 bg-slate-700/50 rounded-md w-1/2"></div>
            </div>
            {!isWidget && (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-slate-700/50 rounded-full shrink-0"></div>
                <div className="h-4 bg-slate-700/50 rounded-md w-1/3"></div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Complaint Row Skeleton
export function ComplaintSkeleton({ isWidget = false }: { isWidget?: boolean }) {
  return (
    <div className="space-y-3">
      {[...Array(isWidget ? 3 : 5)].map((_, i) => (
        <div key={i} className={`bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl animate-pulse p-4`}>
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="h-5 bg-slate-700/50 rounded-md w-full"></div>
              <div className="h-5 bg-slate-700/50 rounded-md w-5/6"></div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-3 w-3 bg-slate-700/50 rounded-full shrink-0"></div>
                <div className="h-3 bg-slate-700/50 rounded-md w-20"></div>
              </div>
            </div>
            {/* Vote Button */}
            <div className={`flex items-center gap-1 px-2 py-1.5 rounded-md border border-slate-700/50 ${isWidget ? '' : 'flex-col min-w-[60px] h-[52px]'}`}>
              <div className="h-4 w-4 bg-slate-700/50 rounded-md"></div>
              {!isWidget && <div className="h-3.5 w-3.5 bg-slate-700/50 rounded-full mt-1"></div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Lost & Found Skeleton
export function LostFoundSkeleton({ isWidget = false }: { isWidget?: boolean }) {
  const showSearch = isWidget; // Note: In the component !showSearch corresponds to widget mode (confusing prop naming in original)
  // Let's align with the component's logic: if isWidget is true, it behaves like !showSearch

  return (
    <div className={
      isWidget
        ? "flex-1 overflow-y-auto pr-2 space-y-2.5"
        : "grid grid-cols-1 xl:grid-cols-2 gap-6"
    }>
      {[...Array(isWidget ? 3 : 4)].map((_, i) => (
        <div key={i} className={`
          animate-pulse
          ${isWidget
            ? 'bg-slate-900/40 rounded-xl p-3 flex items-center gap-3 border border-transparent'
            : 'bg-slate-800/40 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 md:gap-6 border border-slate-700/50'
          }
        `}>
          {/* Image Thumbnail */}
          <div className={`
            bg-slate-700/50 shrink-0
            ${isWidget ? 'rounded-lg w-16 h-16' : 'rounded-2xl w-full sm:w-40 md:w-48 h-48 sm:h-auto'}
          `}></div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
            {/* Header: Title + Date */}
            <div className="flex justify-between items-start mb-1.5 gap-2">
              <div className={`h-5 bg-slate-700/50 rounded-md ${isWidget ? 'w-1/2' : 'w-2/3'}`}></div>
              <div className={`h-5 bg-slate-700/50 rounded-lg ${isWidget ? 'w-16' : 'w-20'}`}></div>
            </div>

            {/* Location (Widget Only) */}
            {isWidget && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-3.5 w-3.5 bg-slate-700/50 rounded-full shrink-0"></div>
                <div className="h-3 bg-slate-700/50 rounded-md w-1/3"></div>
              </div>
            )}

            {/* Full Details (Full Page Only) */}
            {!isWidget && (
              <>
                <div className="flex flex-wrap gap-2 mb-3 mt-1">
                  <div className="h-6 bg-slate-700/50 rounded-lg w-20"></div>
                  <div className="h-6 bg-slate-700/50 rounded-lg w-24"></div>
                </div>
                <div className="h-4 bg-slate-700/50 rounded-md w-full mb-1"></div>
                <div className="h-4 bg-slate-700/50 rounded-md w-5/6 mb-4"></div>
              </>
            )}
          </div>

          {/* Widget Mode Chevron */}
          {isWidget && (
            <div className="shrink-0 w-4 h-4 bg-slate-700/50 rounded-md mr-1"></div>
          )}
        </div>
      ))}
    </div>
  );
}

// Directory Skeleton
export function DirectorySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-pulse">
          {/* Name and Department */}
          <div className="mb-4">
            <div className="h-6 bg-slate-700/50 rounded-md w-1/2 mb-1"></div>
            <div className="h-4 bg-slate-700/50 rounded-md w-1/3"></div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 mt-4">
            <div className="flex items-start gap-2">
              <div className="h-4 w-4 bg-slate-700/50 rounded-full shrink-0 mt-0.5"></div>
              <div className="h-4 bg-slate-700/50 rounded-md w-3/4"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-700/50 rounded-full shrink-0"></div>
              <div className="h-4 bg-slate-700/50 rounded-md w-1/2"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-700/50 rounded-full shrink-0"></div>
              <div className="h-4 bg-slate-700/50 rounded-md w-1/3"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-700/50 rounded-full shrink-0"></div>
              <div className="h-4 bg-slate-700/50 rounded-md w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="min-h-dvh bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl md:rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl relative animate-pulse">
          {/* Skeleton Header */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-8 py-6 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-28 h-28 rounded-full bg-slate-800 p-1 shrink-0"></div>
              <div className="flex flex-col items-center md:items-start">
                <div className="h-10 w-48 bg-slate-800 rounded-lg mb-3"></div>
              </div>
            </div>
          </div>

          {/* Skeleton Grid */}
          <div className="px-8 py-10 relative">
            <div className="h-7 w-48 bg-slate-800 rounded-md mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/50 shrink-0"></div>
                  <div className="flex-1 w-full">
                    <div className="h-3 w-24 bg-slate-800 rounded-sm mb-2 mt-1"></div>
                    <div className="h-5 w-3/4 bg-slate-800 rounded-sm"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}