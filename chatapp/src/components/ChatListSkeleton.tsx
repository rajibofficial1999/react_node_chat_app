import { Skeleton } from "@/components/ui/skeleton";

const ChatListSkeleton = () => {
  return (
    <aside className="w-full min-w-[320px] max-w-[320px] h-screen flex-col border-r border-gray-300 hidden md:flex">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-300 px-4 max-h-14 min-h-14 h-full">
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md md:hidden" />
        </div>
      </div>

      {/* Chat Items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100"
          >
            <div className="relative">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-2 w-2 rounded-full absolute right-0 bottom-0" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-2/4" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        ))}
      </div>

      {/* Bottom Dropdown */}
      <div className="border-t border-gray-300 px-4 pt-2 pb-4">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </aside>
  );
};

export default ChatListSkeleton;
