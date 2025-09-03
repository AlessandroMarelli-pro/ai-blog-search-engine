"use client";

import { BlogCard, type BlogPost } from "@/components/ui/blog-card";
import { SearchBar } from "@/components/ui/search-bar";
import { useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(query)}&limit=50`
      );
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6 relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mt-16">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Blog Search Tool
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the latest tech insights with AI-powered search across
            thousands of blog posts
          </p>
        </div>

        {/* Search section */}
        <div className="glass-effect rounded-2xl p-8 mb-12">
          <div className="flex justify-center">
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              placeholder="Search tech blogs (e.g., machine learning tutorials, TypeScript best practices)"
            />
          </div>
          {error && (
            <p className="text-red-400 mt-4 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Results section */}
        <section className="space-y-6">
          {results.length > 0 && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Found {results.length} results
              </h2>
              <p className="text-muted-foreground">
                Click on any card to read the full article
              </p>
            </div>
          )}

          <div className="grid gap-6">
            {results.map((post) => (
              <div
                key={post.id}
                className="glass-effect rounded-xl overflow-hidden"
              >
                <BlogCard post={post} />
              </div>
            ))}
          </div>

          {!loading && results.length === 0 && (
            <div className="text-center py-12">
              <div className="glass-effect rounded-xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-2">Ready to search?</h3>
                <p className="text-muted-foreground">
                  Try searching for "React performance tips" or "Kubernetes
                  tutorials"
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
