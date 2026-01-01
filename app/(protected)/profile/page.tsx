import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import ProfileForm from "./components/ProfileForm";
import ImportCV from "./components/ImportCV";

export default async function ProfilePage() {
  const user = await requireAuth();
  
  // Get or create profile using upsert to avoid race conditions
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your professional profile information
        </p>
      </div>
      
      <ProfileForm profile={profile} />
      
      <div className="mt-8">
        <ImportCV />
      </div>
    </div>
  );
}

