"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onHistoryClick: () => void;
  loading?: boolean;
  placeholder?: string;
  otherQuery?: string;
}

export function SearchBar({
  otherQuery,
  onSearch,
  onHistoryClick,
  loading = false,
  placeholder,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query?.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
      <Input
        value={!query ? otherQuery : query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || "Search tech blogs..."}
        className="flex-1 h-12 text-base bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
      />
      <Button
        type="button"
        onClick={onHistoryClick}
        variant="outline"
        size="icon"
        className="h-12 w-12 border-border/50 hover:bg-accent/50 transition-all duration-200"
      >
        <Clock className="h-5 w-5" />
      </Button>
      <Button
        type="submit"
        disabled={loading}
        size="icon"
        className="h-12 w-12 bg-primary hover:bg-primary/90 transition-all duration-200"
      >
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );
}
