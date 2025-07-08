import { Skeleton } from "@/components/ui/skeleton";

const AgentCardSkeleton = () => (
  <div className="
    bg-card rounded-2xl shadow-md border border-border flex flex-col justify-between
    p-4 min-h-[210px] max-w-[320px] w-full
    animate-pulse
  ">
    {/* Avatar & Info */}
    <div className="flex items-center gap-2 mb-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-1 flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    {/* Job brief */}
    <Skeleton className="h-4 w-full mb-3" />
    {/* Button row */}
    <div className="flex gap-2 mt-auto">
      <Skeleton className="h-8 w-full rounded-xl flex-1" />
      <Skeleton className="h-8 w-full rounded-xl flex-1" />
    </div>
  </div>
);

export default AgentCardSkeleton;
