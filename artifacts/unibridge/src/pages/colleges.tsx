import { useState } from "react";
import { Link } from "wouter";
import { useListColleges } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, BookOpen, BarChart2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // We'll implement a simple inline debounce if needed, or just normal state

export default function Colleges() {
  const [search, setSearch] = useState("");
  // Simple debounce
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Use a simple effect to debounce
  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  });

  const { data: colleges, isLoading } = useListColleges({ search: debouncedSearch || undefined });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">College Directory</h1>
          <p className="text-muted-foreground mt-1">Explore stats, read peer reviews, and find your fit.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/colleges/compare">
            <Button variant="outline" className="gap-2 shrink-0">
              <BarChart2 className="w-4 h-4" /> Compare
            </Button>
          </Link>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleges..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : colleges?.length ? (
          colleges.map((college) => (
            <Link key={college.id} href={`/colleges/${college.id}`}>
              <Card className="h-full hover-elevate cursor-pointer transition-all hover:border-primary/50">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{college.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1">
                      <MapPin className="w-3 h-3" /> {college.location}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                    <div className="bg-muted/50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Acceptance</p>
                      <p className="font-medium text-foreground">{college.acceptanceRate}%</p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Reviews</p>
                      <p className="font-medium text-foreground">{college.reviewCount || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                    <Badge variant="outline" className="font-normal capitalize bg-background">
                      {college.type?.replace("_", " ")}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{college.postCount || 0} posts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 border rounded-xl border-dashed">
            <h3 className="text-lg font-medium text-muted-foreground">No colleges found matching "{search}"</h3>
          </div>
        )}
      </div>
    </div>
  );
}
