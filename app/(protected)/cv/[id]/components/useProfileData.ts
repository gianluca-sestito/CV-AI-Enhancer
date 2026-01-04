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

/**
 * Exposes profile data, derived lists (work experiences and skills), loading/error state, and a refetch function for components.
 *
 * @returns An object containing:
 * - `profile`: the fetched profile data or `null` if unavailable
 * - `workExperiences`: array of work experiences (empty array if `profile` is `null`)
 * - `skills`: array of skills (empty array if `profile` is `null`)
 * - `isLoading`: `true` while a fetch is in progress, `false` otherwise
 * - `error`: an error message string if the last fetch failed, or `null`
 * - `refetch`: a function to re-trigger fetching the profile
 */
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


