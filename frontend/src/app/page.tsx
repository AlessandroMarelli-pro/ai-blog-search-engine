"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SearchResult = {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  author?: string | null;
  source?: string | null;
  tags?: string[];
  publishedAt?: string | null;
  score?: number;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=10`);
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
    <main className="min-h-screen flex flex-col items-center justify-start p-6">
      <div className="w-full max-w-3xl mt-24">
        <h1 className="text-4xl font-bold text-center mb-6">Blog Search Tool</h1>
        <form onSubmit={onSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tech blogs (e.g., "+
              "machine learning tutorials, TypeScript best practices)" 
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
        {error && (
          <p className="text-red-600 mt-3 text-sm">{error}</p>
        )}
      </div>

      <section className="w-full max-w-4xl mt-10 grid gap-4">
        {results.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                <a href={r.url} target="_blank" rel="noreferrer" className="hover:underline">
                  {r.title}
                </a>
              </CardTitle>
              <CardDescription>{r.source || r.author || r.url}</CardDescription>
            </CardHeader>
            <CardContent>
              {r.description && (
                <p className="text-sm mb-3 text-muted-foreground">{r.description}</p>
              )}
              <div className="flex flex-wrap gap-2 items-center">
                {r.tags?.slice(0, 6).map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
                {r.publishedAt && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(r.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && results.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Try searching for "React performance tips" or "Kubernetes tutorials".
          </p>
        )}
      </section>
    </main>
  );
}
