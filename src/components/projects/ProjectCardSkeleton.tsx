
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="aspect-video w-full rounded-t-lg" />
      </CardHeader>
      <CardContent className="p-6 flex-grow space-y-3">
        <Skeleton className="h-6 w-3/4 rounded" /> {/* Title */}
        <div className="mt-1 mb-3 flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full rounded" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-full rounded" /> {/* Description line 2 */}
        <Skeleton className="h-4 w-2/3 rounded" /> {/* Description line 3 */}
      </CardContent>
      <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-24 rounded-md" /> {/* Button 1 */}
          <Skeleton className="h-9 w-28 rounded-md" /> {/* Button 2 */}
        </div>
        <Skeleton className="h-9 w-24 rounded-md mt-2 sm:mt-0" /> {/* Button 3 */}
      </CardFooter>
    </Card>
  );
}
