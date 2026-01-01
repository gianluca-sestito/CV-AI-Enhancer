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
import ImportCV from "./ImportCV";
import type { ProfileWithRelations } from "@/lib/types";

type Profile = ProfileWithRelations;

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
          <TabsTrigger value="import">Import CV</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="personal">
        <PersonalInfoForm profile={profile} />
      </TabsContent>

      <TabsContent value="experience">
        <WorkExperienceForm 
          profileId={profile.id} 
          experiences={profile.workExperiences.map(exp => ({
            ...exp,
            startDate: exp.startDate instanceof Date 
              ? exp.startDate.toISOString().split('T')[0] 
              : typeof exp.startDate === 'string' 
                ? exp.startDate 
                : '',
            endDate: exp.endDate instanceof Date 
              ? exp.endDate.toISOString().split('T')[0] 
              : exp.endDate 
                ? (typeof exp.endDate === 'string' ? exp.endDate : null)
                : null,
          }))} 
        />
      </TabsContent>

      <TabsContent value="skills">
        <SkillsForm profileId={profile.id} skills={profile.skills} />
      </TabsContent>

      <TabsContent value="education">
        <EducationForm 
          profileId={profile.id} 
          education={profile.education.map(edu => ({
            ...edu,
            startDate: edu.startDate instanceof Date 
              ? edu.startDate.toISOString().split('T')[0] 
              : typeof edu.startDate === 'string' 
                ? edu.startDate 
                : '',
            endDate: edu.endDate instanceof Date 
              ? edu.endDate.toISOString().split('T')[0] 
              : edu.endDate 
                ? (typeof edu.endDate === 'string' ? edu.endDate : null)
                : null,
          }))} 
        />
      </TabsContent>

      <TabsContent value="languages">
        <LanguagesForm profileId={profile.id} languages={profile.languages} />
      </TabsContent>

      <TabsContent value="import">
        <ImportCV />
      </TabsContent>
    </Tabs>
  );
}

