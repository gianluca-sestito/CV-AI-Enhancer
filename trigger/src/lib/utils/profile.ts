import { prisma } from "../prisma/client";

/**
 * Fetches complete profile data including all related entities
 */
export async function fetchProfileData(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      workExperiences: {
        orderBy: { orderIndex: "asc" },
      },
      skills: true,
      education: {
        orderBy: { orderIndex: "asc" },
      },
      languages: true,
    },
  });

  if (!profile) {
    throw new Error(`Profile not found for user ${userId}`);
  }

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    address: profile.address,
    city: profile.city,
    country: profile.country,
    postalCode: profile.postalCode,
    profileImageUrl: profile.profileImageUrl,
    personalSummary: profile.personalSummary,
    workExperiences: profile.workExperiences,
    skills: profile.skills,
    education: profile.education,
    languages: profile.languages,
  };
}


