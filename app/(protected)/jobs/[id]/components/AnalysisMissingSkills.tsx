"use client";

import { memo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { AnalysisResultData, MissingSkill } from "@/lib/types/analysis";
import { logger } from "@/lib/utils/logger";

interface AnalysisMissingSkillsProps {
  missingSkills: AnalysisResultData["missingSkills"];
  profileId: string;
}

type SkillType = 'technical' | 'soft-skill' | 'programming-language';
type SkillCategory = 'Technical' | 'Soft Skills' | 'Programming Language';

function normalizeMissingSkills(skills: MissingSkill[]): Array<{ name: string; type: SkillType }> {
  if (skills.length === 0) return [];
  
  if (typeof skills[0] === 'string') {
    return (skills as string[]).map(skill => detectSkillType(skill));
  }
  
  return skills as Array<{ name: string; type: SkillType }>;
}

function detectSkillType(skillName: string): { name: string; type: SkillType } {
  const name = skillName.toLowerCase();
  
  const programmingLanguages = [
    'python', 'javascript', 'java', 'go', 'rust', 'typescript', 'c++', 'c#', 'swift', 
    'kotlin', 'php', 'ruby', 'scala', 'r', 'matlab', 'perl', 'haskell', 'clojure',
    'elixir', 'erlang', 'dart', 'lua', 'sql', 'html', 'css', 'shell', 'bash'
  ];
  
  const softSkillKeywords = [
    'leadership', 'communication', 'teamwork', 'collaboration', 'problem-solving',
    'time management', 'organization', 'adaptability', 'creativity', 'critical thinking',
    'negotiation', 'presentation', 'mentoring', 'coaching', 'conflict resolution',
    'emotional intelligence', 'empathy', 'patience', 'resilience', 'work ethic'
  ];
  
  if (programmingLanguages.some(lang => name.includes(lang))) {
    return { name: skillName, type: 'programming-language' };
  }
  
  if (softSkillKeywords.some(keyword => name.includes(keyword))) {
    return { name: skillName, type: 'soft-skill' };
  }
  
  return { name: skillName, type: 'technical' };
}

function mapTypeToCategory(type: SkillType): SkillCategory {
  switch (type) {
    case 'programming-language':
      return 'Programming Language';
    case 'soft-skill':
      return 'Soft Skills';
    case 'technical':
    default:
      return 'Technical';
  }
}

function AnalysisMissingSkills({ missingSkills, profileId }: AnalysisMissingSkillsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<{ name: string; type: SkillType } | null>(null);
  const [category, setCategory] = useState<SkillCategory>("Technical");
  const [proficiency, setProficiency] = useState<string>("");

  const normalizedSkills = normalizeMissingSkills(missingSkills);

  const handleSkillClick = (skill: { name: string; type: SkillType }) => {
    setSelectedSkill(skill);
    setCategory(mapTypeToCategory(skill.type));
    setDialogOpen(true);
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) return;

    try {
      const response = await fetch("/api/profile/skills/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          name: selectedSkill.name,
          category,
          proficiencyLevel: proficiency || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to add skill");

      setDialogOpen(false);
      setSelectedSkill(null);
      // Refresh the page to show the new skill
      window.location.reload();
    } catch (error) {
      logger.error('Error adding skill', error);
      alert("Failed to add skill. Please try again.");
    }
  };

  if (normalizedSkills.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Missing Skills
          </CardTitle>
          <CardDescription>
            Skills mentioned in the job description that are not in your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {normalizedSkills.map((skill, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleSkillClick(skill)}
                className="h-auto py-1.5"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                {skill.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill to Profile</DialogTitle>
            <DialogDescription>
              Add {selectedSkill?.name} to your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as SkillCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                  <SelectItem value="Programming Language">Programming Language</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proficiency">Proficiency Level (Optional)</Label>
              <Select value={proficiency} onValueChange={setProficiency}>
                <SelectTrigger id="proficiency">
                  <SelectValue placeholder="Select proficiency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill}>Add Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(AnalysisMissingSkills);

