import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export interface BlogPost {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  author?: string | null;
  source?: string | null;
  tags?: string[];
  publishedAt?: string | null;
  score?: number;
}

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 10) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <Card className="border-0 bg-transparent shadow-none hover:scale-[1.02] transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl leading-tight flex-1">
            <a
              href={post.url}
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-2 group"
            >
              <span className="group-hover:text-primary transition-colors">
                {post.title}
              </span>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </CardTitle>
          {post.score && (
            <Badge
              variant="outline"
              className={`text-xs ${getScoreColor(post.score)} border-current`}
            >
              Score: {post.score.toFixed(1)}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {post.source && (
            <span className="font-medium text-primary">{post.source}</span>
          )}
          {post.author && (
            <span className="text-muted-foreground">
              {post.source && " • "}by {post.author}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {post.description && (
          <p className="text-sm mb-6 text-muted-foreground line-clamp-3 leading-relaxed">
            {post.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {post.tags?.slice(0, 5).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
          {post.publishedAt && (
            <span className="text-xs text-muted-foreground font-medium">
              {formatDate(post.publishedAt)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
