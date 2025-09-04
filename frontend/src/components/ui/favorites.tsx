"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";
import { BlogCard, type BlogPost } from "./blog-card";
import { Button } from "./button";
import { Card } from "./card";

export function Favorites() {
  const { user } = useUser();
  const isAuthenticated = !!user;
  const [favorites, setFavorites] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = "/api/proxy";

  const fetchFavorites = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE}/users/favorites`);
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.map((fav: any) => fav.blogPost));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Favorites</h2>
        <Button onClick={fetchFavorites} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading favorites...</p>
      ) : favorites.length > 0 ? (
        <div className="space-y-4">
          {favorites.map((post) => (
            <div
              key={post.id}
              className="glass-effect rounded-xl overflow-hidden"
            >
              <BlogCard post={post} />
            </div>
          ))}{" "}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No favorites yet. Start searching and add posts to your favorites!
        </p>
      )}
    </Card>
  );
}
