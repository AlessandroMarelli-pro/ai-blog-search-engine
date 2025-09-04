"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";

interface UserProfileData {
  firstName?: string;
  lastName?: string;
  age?: number;
  position?: string;
  themes?: string[];
  tags?: string[];
  language?: string;
}

export function UserProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfileData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newTheme, setNewTheme] = useState("");
  const [newTag, setNewTag] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const addTheme = () => {
    if (newTheme.trim() && !profile.themes?.includes(newTheme.trim())) {
      setProfile((prev) => ({
        ...prev,
        themes: [...(prev.themes || []), newTheme.trim()],
      }));
      setNewTheme("");
    }
  };

  const removeTheme = (theme: string) => {
    setProfile((prev) => ({
      ...prev,
      themes: prev.themes?.filter((t) => t !== theme) || [],
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !profile.tags?.includes(newTag.trim())) {
      setProfile((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setProfile((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Profile</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={updateProfile}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <p className="text-muted-foreground">{user?.email || "Not set"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            {isEditing ? (
              <Input
                value={profile.firstName || ""}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
            ) : (
              <p className="text-muted-foreground">
                {profile.firstName || "Not set"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            {isEditing ? (
              <Input
                value={profile.lastName || ""}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            ) : (
              <p className="text-muted-foreground">
                {profile.lastName || "Not set"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            {isEditing ? (
              <Input
                type="number"
                value={profile.age || ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    age: parseInt(e.target.value) || undefined,
                  }))
                }
              />
            ) : (
              <p className="text-muted-foreground">
                {profile.age || "Not set"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            {isEditing ? (
              <Input
                value={profile.position || ""}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, position: e.target.value }))
                }
              />
            ) : (
              <p className="text-muted-foreground">
                {profile.position || "Not set"}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Themes</label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  placeholder="Add a theme..."
                />
                <Button onClick={addTheme}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.themes?.map((theme) => (
                  <Badge
                    key={theme}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTheme(theme)}
                  >
                    {theme} ×
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.themes?.map((theme) => (
                <Badge key={theme} variant="secondary">
                  {theme}
                </Badge>
              ))}
              {(!profile.themes || profile.themes.length === 0) && (
                <p className="text-muted-foreground">No themes set</p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                />
                <Button onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              {(!profile.tags || profile.tags.length === 0) && (
                <p className="text-muted-foreground">No tags set</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
