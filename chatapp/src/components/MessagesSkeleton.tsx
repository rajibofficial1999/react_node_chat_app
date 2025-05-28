import { Skeleton } from "@/components/ui/skeleton";

const MessagesSkeleton = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Chat Navbar Skeleton */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/3 mb-1" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`flex ${
              index % 2 === 0 ? "justify-start" : "justify-end"
            }`}
          >
            <div className="space-y-2 max-w-xs w-full">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}

        {/* Typing Indicator Skeleton */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default MessagesSkeleton;
