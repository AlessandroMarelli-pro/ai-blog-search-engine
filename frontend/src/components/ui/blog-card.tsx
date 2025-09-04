import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@auth0/nextjs-auth0";
import { ExternalLink, Heart } from "lucide-react";
import { useEffect, useState } from "react";

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
  showFavoriteButton?: boolean;
}

export function BlogCard({ post, showFavoriteButton = true }: BlogCardProps) {
  const { user, error } = useUser();
  const isAuthenticated = !!user;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = process.env.APP_BASE_URL || "http://localhost:3001";

  const checkFavoriteStatus = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/proxy/users/favorites/${post.id}/check`
      );
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const endpoint = isFavorite ? `${post.id}/remove` : post.id;
      const response = await fetch(
        `${API_BASE}/api/proxy/users/favorites/${endpoint}`,
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && showFavoriteButton) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, post.id]);
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
          <div className="flex items-center gap-2">
            {showFavoriteButton && isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                disabled={isLoading}
                className="p-1 h-auto "
              >
                FAV
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground hover:text-red-500"
                  }`}
                />
              </Button>
            )}
            {post.score && (
              <Badge
                variant="outline"
                className={`text-xs ${getScoreColor(post.score)} border-current`}
              >
                Score: {post.score.toFixed(1)}
              </Badge>
            )}
          </div>
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
