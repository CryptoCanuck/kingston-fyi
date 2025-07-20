export function PlaceCardSkeleton() {
  return (
    <div className="card animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
      
      {/* Content skeleton */}
      <div className="p-4">
        {/* Category badge skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        
        {/* Title skeleton */}
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
        
        {/* Description skeleton */}
        <div className="mt-2 space-y-1">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        
        {/* Info row skeleton */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        
        {/* Features skeleton */}
        <div className="mt-3 flex gap-1">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        
        {/* Address skeleton */}
        <div className="mt-3 h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );
}