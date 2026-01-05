"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const refetchControllerRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", { signal });
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      
      // Check if request was aborted before updating state
      if (signal.aborted) {
        return;
      }
      
      setProfile(data);
    } catch (err) {
      // Don't set error/state if request was aborted
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      
      // Check if request was aborted before updating state
      if (signal.aborted) {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setProfile(null);
    } finally {
      // Only update loading state if request wasn't aborted
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);
    
    return () => {
      controller.abort();
      // Also abort any in-flight refetch request
      if (refetchControllerRef.current) {
        refetchControllerRef.current.abort();
        refetchControllerRef.current = null;
      }
    };
  }, [fetchProfile]);

  const refetch = useCallback(async () => {
    // Abort any previous refetch request
    if (refetchControllerRef.current) {
      refetchControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    refetchControllerRef.current = controller;
    await fetchProfile(controller.signal);
    refetchControllerRef.current = null;
  }, [fetchProfile]);

  return {
    profile,
    workExperiences: profile?.workExperiences || [],
    skills: profile?.skills || [],
    isLoading,
    error,
    refetch,
  };
}


