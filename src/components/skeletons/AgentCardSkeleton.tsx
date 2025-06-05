import { Skeleton } from "@/components/ui/skeleton";

const AgentCardSkeleton = () => (
  <div className="flex items-center p-4 space-x-4 border rounded-lg dark:border-slate-700 animate-pulse">
    <Skeleton className="w-12 h-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-32" /> {/* Agent name placeholder */}
      <Skeleton className="h-4 w-40" /> {/* Agent role_description placeholder */}
    </div>
  </div>
);

export default AgentCardSkeleton; 