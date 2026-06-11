import { Link } from "wouter";
import { 
  useGetCollege, 
  getGetCollegeQueryKey,
  useListCollegeReviews,
  useListPosts
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Target, BookOpen, ArrowLeft, BarChart2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PostCard } from "@/components/post-card";

export default function CollegeDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  const { data: college, isLoading: isLoadingCollege } = useGetCollege(id, {
    query: { enabled: !!id, queryKey: getGetCollegeQueryKey(id) }
  });

  const { data: reviews, isLoading: isLoadingReviews } = useListCollegeReviews(id);
  const { data: posts, isLoading: isLoadingPosts } = useListPosts({ collegeId: id, limit: 5 });

  if (isLoadingCollege) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-96 rounded-xl" />
          <Skeleton className="col-span-1 h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!college) {
    return <div className="text-center py-12">College not found</div>;
  }

  const acceptedReviews = reviews?.filter(r => r.status === "accepted") || [];
  const rejectedReviews = reviews?.filter(r => r.status === "rejected") || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Link href="/colleges" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Colleges
        </Link>
        <Link href="/colleges/compare">
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart2 className="w-4 h-4" /> Compare Colleges
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden">
        {college.color && (
          <div 
            className="absolute top-0 left-0 w-2 h-full" 
            style={{ backgroundColor: college.color }} 
          />
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-serif font-bold">{college.name}</h1>
              <Badge variant="secondary" className="capitalize">{college.type?.replace("_", " ")}</Badge>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {college.location}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {college.enrollment?.toLocaleString()} undergrads</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{college.acceptanceRate}%</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Acceptance</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-serif font-bold mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              {college.description || "No description available."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold mb-4">Community Admissions Results</h2>
            <div className="grid gap-4">
              {isLoadingReviews ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
              ) : reviews?.length ? (
                reviews.map(review => (
                  <Card key={review.id} className="overflow-hidden">
                    <div className={`h-1 w-full ${review.status === 'accepted' ? 'bg-green-500' : review.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`font-bold uppercase tracking-wider text-[10px] ${
                            review.status === 'accepted' ? 'border-green-500 text-green-600' : 
                            review.status === 'rejected' ? 'border-red-500 text-red-600' : 
                            'border-yellow-500 text-yellow-600'
                          }`}>
                            {review.status}
                          </Badge>
                          <span className="font-medium text-sm">u/{review.username}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex gap-3 text-sm font-medium mb-3">
                        {review.gpa && <span className="bg-muted px-2 py-1 rounded">GPA: {review.gpa.toFixed(2)}</span>}
                        {review.satScore && <span className="bg-muted px-2 py-1 rounded">SAT: {review.satScore}</span>}
                        {review.actScore && <span className="bg-muted px-2 py-1 rounded">ACT: {review.actScore}</span>}
                      </div>
                      
                      {review.content && (
                        <p className="text-sm text-muted-foreground">{review.content}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 border rounded-xl border-dashed">
                  <p className="text-muted-foreground">No community results posted yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" /> Median Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">GPA</span>
                  <span className="text-sm font-bold">{college.medianGpa || "N/A"}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: college.medianGpa ? `${(college.medianGpa / 4.0) * 100}%` : '0%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">SAT</span>
                  <span className="text-sm font-bold">{college.medianSat || "N/A"}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: college.medianSat ? `${(college.medianSat / 1600) * 100}%` : '0%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">ACT</span>
                  <span className="text-sm font-bold">{college.medianAct || "N/A"}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: college.medianAct ? `${(college.medianAct / 36) * 100}%` : '0%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Related Posts
              </h3>
            </div>
            <div className="space-y-3">
              {isLoadingPosts ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
              ) : posts?.length ? (
                posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No discussions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
