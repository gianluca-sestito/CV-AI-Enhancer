"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalInfoForm from "./PersonalInfoForm";
import WorkExperienceForm from "./WorkExperienceForm";
import SkillsForm from "./SkillsForm";
import EducationForm from "./EducationForm";
import LanguagesForm from "./LanguagesForm";

interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  profileImageUrl: string | null;
  personalSummary: string | null;
  workExperiences: any[];
  skills: any[];
  education: any[];
  languages: any[];
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();

  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <div className="overflow-x-auto">
        <TabsList className="w-full min-w-max md:w-auto">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="personal">
        <PersonalInfoForm profile={profile} />
      </TabsContent>

      <TabsContent value="experience">
        <WorkExperienceForm profileId={profile.id} experiences={profile.workExperiences} />
      </TabsContent>

      <TabsContent value="skills">
        <SkillsForm profileId={profile.id} skills={profile.skills} />
      </TabsContent>

      <TabsContent value="education">
        <EducationForm profileId={profile.id} education={profile.education} />
      </TabsContent>

      <TabsContent value="languages">
        <LanguagesForm profileId={profile.id} languages={profile.languages} />
      </TabsContent>
    </Tabs>
  );
}

