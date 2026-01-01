import { createClient } from "./server";
import { redirect } from "next/navigation";
import { logger } from "@/lib/utils/logger";

export async function getSession() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    
    if (error) {
      logger.warn("Error getting session", error);
      return null;
    }
    
    return session;
  } catch (error) {
    logger.warn("Exception getting session", error);
    return null;
  }
}

export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error) {
      // If it's a refresh token error, just return null
      // The cookies will be cleared automatically by the SSR client
      if (error.message?.includes("Refresh Token") || error.message?.includes("JWT") || error.message?.includes("Invalid Refresh Token")) {
        logger.warn("Invalid refresh token detected", { message: error.message });
        return null;
      }
      logger.warn("Error getting user", error);
      return null;
    }
    
    return user;
  } catch (error) {
    // Catch any exceptions (like AuthApiError) and return null
    logger.warn("Exception getting user", error);
    return null;
  }
}

export async function requireAuth() {
  // Try getSession first (reads from cookies)
  const session = await getSession();
  
  if (session?.user) {
    return session.user;
  }
  
  // Fallback to getUser (makes API call)
  // This will handle invalid refresh tokens gracefully
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }
  return user;
}

