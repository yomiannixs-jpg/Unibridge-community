import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@workspace/api-client-react";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="hover-elevate cursor-pointer transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="capitalize">
              {post.category.replace("_", " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 mt-2">{post.title}</h3>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.content}
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Heart className={`w-4 h-4 ${post.isLiked ? "fill-primary text-primary" : ""}`} />
              <span>{post.likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{post.commentCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.collegeName && (
              <Badge variant="outline" className="font-normal text-xs bg-muted/50">
                {post.collegeName}
              </Badge>
            )}
            <span className="font-medium text-foreground">
              u/{post.username}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
