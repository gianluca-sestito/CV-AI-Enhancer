import { prisma } from "../prisma/client";
import type { z } from "zod";
import type { ProfileDataSchema } from "../types/schemas";

type ProfileData = z.infer<typeof ProfileDataSchema>;

/**
 * Deletes all existing profile data for a user and imports new data
 * @param userId - User ID
 * @param profileData - New profile data to import
 */
export async function bulkImportProfileData(
  userId: string,
  profileData: ProfileData
): Promise<void> {
  // Use a transaction to ensure data integrity
  await prisma.$transaction(async (tx) => {
    // Find existing profile
    const existingProfile = await tx.profile.findUnique({
      where: { userId },
      include: {
        workExperiences: true,
        skills: true,
        education: true,
        languages: true,
      },
    });

    // Delete all related data if profile exists
    if (existingProfile) {
      // Delete in order (respecting foreign keys)
      await tx.workExperience.deleteMany({
        where: { profileId: existingProfile.id },
      });
      await tx.skill.deleteMany({
        where: { profileId: existingProfile.id },
      });
      await tx.education.deleteMany({
        where: { profileId: existingProfile.id },
      });
      await tx.language.deleteMany({
        where: { profileId: existingProfile.id },
      });
      await tx.profile.delete({
        where: { id: existingProfile.id },
      });
    }

    // Create new profile
    const newProfile = await tx.profile.create({
      data: {
        userId,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        postalCode: profileData.postalCode,
        profileImageUrl: profileData.profileImageUrl,
        personalSummary: profileData.personalSummary,
      },
    });

    // Bulk insert work experiences
    if (profileData.workExperiences.length > 0) {
      await tx.workExperience.createMany({
        data: profileData.workExperiences.map((exp, index) => ({
          profileId: newProfile.id,
          company: exp.company,
          position: exp.position,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          current: exp.current,
          description: exp.description,
          orderIndex: index,
        })),
      });
    }

    // Bulk insert skills
    if (profileData.skills.length > 0) {
      await tx.skill.createMany({
        data: profileData.skills.map((skill) => ({
          profileId: newProfile.id,
          name: skill.name,
          category: skill.category,
          proficiencyLevel: skill.proficiencyLevel,
        })),
      });
    }

    // Bulk insert education
    if (profileData.education.length > 0) {
      await tx.education.createMany({
        data: profileData.education.map((edu, index) => ({
          profileId: newProfile.id,
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          current: edu.current,
          description: edu.description,
          orderIndex: index,
        })),
      });
    }

    // Bulk insert languages
    if (profileData.languages.length > 0) {
      await tx.language.createMany({
        data: profileData.languages.map((lang) => ({
          profileId: newProfile.id,
          name: lang.name,
          proficiencyLevel: lang.proficiencyLevel,
        })),
      });
    }
  });
}


