"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Heart, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

export function Navigation() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Blog Search
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
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
                <>
                  <Link
                    href="/auth/logout"
                    className="btn btn-primary btn-margin"
                    tabIndex={0}
                  >
                    Log out
                  </Link>
                </>
              </>
            )}
            {!isLoading && !user && (
              <>
                <Link
                  href="/auth/login"
                  className="btn btn-primary btn-margin"
                  tabIndex={0}
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
