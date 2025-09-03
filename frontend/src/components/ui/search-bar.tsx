"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  loading = false,
  placeholder,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || "Search tech blogs..."}
        className="flex-1 h-12 text-base bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
      />
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
