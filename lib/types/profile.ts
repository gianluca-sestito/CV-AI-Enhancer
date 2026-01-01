// Profile-related types
import type { ProfileWithRelations } from "./prisma";

export type Profile = ProfileWithRelations;

export type ProfileFormData = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  profileImageUrl?: string | null;
  personalSummary?: string | null;
};

