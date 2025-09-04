"use client";

import { useAuth } from "@/hooks/useAuth";
import { Heart, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

export function Navigation() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Blog Search
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/favorites">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <Button onClick={login}>
                <User className="h-4 w-4 mr-2" />
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
