"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProfileWithRelations } from "@/lib/types/prisma";

interface UseProfileDataReturn {
  profile: ProfileWithRelations | null;
  workExperiences: ProfileWithRelations["workExperiences"];
  skills: ProfileWithRelations["skills"];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfileData(): UseProfileDataReturn {
  const [profile, setProfile] = useState<ProfileWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    workExperiences: profile?.workExperiences || [],
    skills: profile?.skills || [],
    isLoading,
    error,
    refetch: fetchProfile,
  };
}



