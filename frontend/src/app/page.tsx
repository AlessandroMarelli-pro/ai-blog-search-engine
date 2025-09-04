"use client";

import { BlogCard, type BlogPost } from "@/components/ui/blog-card";
import { SearchBar } from "@/components/ui/search-bar";
import { SearchHistory } from "@/components/ui/search-history";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<string>("text");
  const [semanticAnalysis, setSemanticAnalysis] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    setSemanticAnalysis(null);

    try {
      // Determine if this is a complex query that needs semantic search
      const isComplexQuery =
        query.length > 50 ||
        query.toLowerCase().includes("build") ||
        query.toLowerCase().includes("create") ||
        query.toLowerCase().includes("help") ||
        query.toLowerCase().includes("latest") ||
        query.toLowerCase().includes("new");

      const searchEndpoint = isComplexQuery ? "semantic" : "";
      setSearchType(isComplexQuery ? "semantic" : "text");

      const res = await fetch(
        `${API_BASE}/search/${searchEndpoint}?q=${encodeURIComponent(query)}&limit=50`
      );

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      setResults(data.results || []);

      // Store semantic analysis if available
      if (data.semantic_analysis) {
        setSemanticAnalysis(data.semantic_analysis);
      }
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  const handleHistoryClick = () => {
    setShowHistory(true);
  };

  const handleHistoryClose = () => {
    setShowHistory(false);
  };

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
              onHistoryClick={handleHistoryClick}
              loading={loading}
              placeholder="Try: 'I want to build a software that handles frontend and backend solutions' or 'latest React tutorials'"
            />
          </div>
          {error && (
            <p className="text-red-400 mt-4 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Search History Modal */}
        <SearchHistory
          isOpen={showHistory}
          onClose={handleHistoryClose}
          onSearch={handleSearch}
          apiBase={API_BASE}
        />

        {/* Semantic Analysis */}
        {semanticAnalysis && (
          <div className="glass-effect rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-primary">
              🧠 Semantic Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Intent:</p>
                <p className="text-muted-foreground capitalize">
                  {semanticAnalysis.intent?.primary_intent || "information"}
                </p>
              </div>
              <div>
                <p className="font-medium">Confidence:</p>
                <p className="text-muted-foreground">
                  {(semanticAnalysis.intent?.confidence * 100).toFixed(0)}%
                </p>
              </div>
              {semanticAnalysis.entities?.companies?.length > 0 && (
                <div>
                  <p className="font-medium">Companies:</p>
                  <p className="text-muted-foreground">
                    {semanticAnalysis.entities.companies.join(", ")}
                  </p>
                </div>
              )}
              <div>
                <p className="font-medium">Domains:</p>
                <p className="text-muted-foreground">
                  {semanticAnalysis.domains
                    ?.map((d: any) => {
                      if (d.domain.startsWith("company_")) {
                        return `Company: ${d.domain.replace("company_", "")}`;
                      } else if (d.domain.startsWith("non_tech_")) {
                        return `Domain: ${d.domain.replace("non_tech_", "")}`;
                      } else {
                        return d.domain;
                      }
                    })
                    .join(", ") || "general"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium">Expanded Query:</p>
                <p className="text-muted-foreground text-xs">
                  {semanticAnalysis.expanded_terms?.join(", ") || "none"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results section */}
        <section className="space-y-6">
          {results.length > 0 && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Found {results.length} results
              </h2>
              <p className="text-muted-foreground">
                Search type:{" "}
                <span className="text-primary font-medium">{searchType}</span> •
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
          {loading && <Skeleton className="w-full h-48" />}
          {!loading && results.length === 0 && (
            <div className="text-center py-12">
              <div className="glass-effect rounded-xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-2">Ready to search?</h3>
                <p className="text-muted-foreground mb-4">
                  Try these example queries:
                </p>
                <div className="text-left text-sm space-y-2">
                  <p className="text-primary">
                    • "I want to build a full-stack app with React and Node.js"
                  </p>
                  <p className="text-primary">
                    • "Latest AI tools for developers"
                  </p>
                  <p className="text-primary">
                    • "Microservices architecture best practices"
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
