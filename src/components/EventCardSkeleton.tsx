export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Image area */}
      <div className="relative aspect-[16/9] animate-pulse bg-gray-200">
        {/* Date tag placeholder */}
        <div className="absolute top-3 left-3 h-12 w-10 rounded-lg bg-gray-300" />
      </div>

      {/* Content area */}
      <div className="space-y-3 p-4">
        {/* Title lines */}
        <div className="h-5 w-4/5 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-3/5 animate-pulse rounded bg-gray-200" />

        {/* Venue line */}
        <div className="h-4 w-2/5 animate-pulse rounded bg-gray-100" />

        {/* Category pills */}
        <div className="flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
