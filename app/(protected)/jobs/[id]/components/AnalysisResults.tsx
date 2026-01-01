"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Loader2, Code, Users, Wrench, Plus, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type SkillType = 'technical' | 'soft-skill' | 'programming-language';
type SkillCategory = 'Technical' | 'Soft Skills' | 'Programming Language';

interface MissingSkill {
  name: string;
  type: SkillType;
}

interface AnalysisResult {
  id: string;
  matchScore: number;
  strengths: Array<{ title: string; description: string }>;
  gaps: Array<{ title: string; description: string; severity: string }>;
  missingSkills: string[] | MissingSkill[];
  suggestedFocusAreas: string[];
  status: string;
}

// Backward compatibility: convert string array to categorized format
function normalizeMissingSkills(skills: string[] | MissingSkill[]): MissingSkill[] {
  if (skills.length === 0) return [];
  
  // Check if first item is a string (old format)
  if (typeof skills[0] === 'string') {
    return (skills as string[]).map(skill => detectSkillType(skill));
  }
  
  return skills as MissingSkill[];
}

// Heuristic skill type detection for backward compatibility
function detectSkillType(skillName: string): MissingSkill {
  const name = skillName.toLowerCase();
  
  // Known programming languages
  const programmingLanguages = [
    'python', 'javascript', 'java', 'go', 'rust', 'typescript', 'c++', 'c#', 'swift', 
    'kotlin', 'php', 'ruby', 'scala', 'r', 'matlab', 'perl', 'haskell', 'clojure',
    'elixir', 'erlang', 'dart', 'lua', 'sql', 'html', 'css', 'shell', 'bash'
  ];
  
  // Soft skill keywords
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
  
  // Default to technical
  return { name: skillName, type: 'technical' };
}

// Map analysis type to form category
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

// Get badge variant and icon based on skill type
function getSkillTypeStyle(type: SkillType) {
  switch (type) {
    case 'programming-language':
      return {
        variant: 'outline' as const,
        className: 'border-purple-500 text-purple-700 hover:bg-purple-50 cursor-pointer',
        icon: Code,
        label: 'Programming Language',
      };
    case 'soft-skill':
      return {
        variant: 'outline' as const,
        className: 'border-green-500 text-green-700 hover:bg-green-50 cursor-pointer',
        icon: Users,
        label: 'Soft Skill',
      };
    case 'technical':
    default:
      return {
        variant: 'outline' as const,
        className: 'border-blue-500 text-blue-700 hover:bg-blue-50 cursor-pointer',
        icon: Wrench,
        label: 'Technical',
      };
  }
}

interface AddSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: MissingSkill | null;
  profileId: string;
  onSuccess: () => void;
}

function AddSkillDialog({ open, onOpenChange, skill, profileId, onSuccess }: AddSkillDialogProps) {
  const [category, setCategory] = useState<SkillCategory>('Technical');
  const [proficiencyLevel, setProficiencyLevel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (skill) {
      setCategory(mapTypeToCategory(skill.type));
      setProficiencyLevel('');
    }
  }, [skill]);

  const handleAdd = async () => {
    if (!skill) return;

    setLoading(true);
    try {
      const response = await fetch('/api/profile/skills/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          name: skill.name,
          category,
          proficiencyLevel: proficiencyLevel || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add skill');
      }

      onSuccess();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error adding skill:', error);
      alert(error instanceof Error ? error.message : 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  if (!skill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Skill to Profile</DialogTitle>
          <DialogDescription>
            Add this skill to your profile. You can adjust the category and proficiency level.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Skill Name</Label>
            <div className="p-3 bg-muted rounded-md font-medium">{skill.name}</div>
          </div>
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
            <Select value={proficiencyLevel} onValueChange={setProficiencyLevel}>
              <SelectTrigger id="proficiency">
                <SelectValue placeholder="Select proficiency level" />
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AnalysisResults({
  analysis: initialAnalysis,
  jobId,
  profileId,
}: {
  analysis: AnalysisResult;
  jobId: string;
  profileId: string;
}) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(analysis.status === "processing");
  const [selectedSkill, setSelectedSkill] = useState<MissingSkill | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // Normalize missing skills (handle backward compatibility)
  const normalizedSkills = normalizeMissingSkills(analysis.missingSkills);

  useEffect(() => {
    if (analysis.status === "processing") {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/analysis/${analysis.id}`);
          if (response.ok) {
            const data = await response.json();
            setAnalysis(data);
            if (data.status === "completed" || data.status === "failed") {
              setLoading(false);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Error fetching analysis:", error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [analysis.id, analysis.status]);

  const handleSkillClick = (skill: MissingSkill) => {
    setSelectedSkill(skill);
    setDialogOpen(true);
  };

  const handleSkillAdded = () => {
    // Refresh the analysis to potentially update match score
    router.refresh();
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Analyzing your profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (analysis.status === "failed") {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Analysis Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            The analysis could not be completed. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription className="mt-1">
                Your profile match with this job description
              </CardDescription>
            </div>
            <Badge 
              variant={analysis.matchScore >= 70 ? "default" : "secondary"} 
              className="self-start sm:self-auto text-base px-4 py-1.5"
            >
              {analysis.matchScore}% Match
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Strengths
            </h3>
            <ul className="space-y-3 pl-4 border-l-2 border-green-200">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="text-sm lg:text-base leading-relaxed">
                  <strong className="text-foreground">{strength.title}:</strong>{" "}
                  <span className="text-muted-foreground">{strength.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Gaps
            </h3>
            <ul className="space-y-3 pl-4 border-l-2 border-orange-200">
              {analysis.gaps.map((gap, index) => (
                <li key={index} className="text-sm lg:text-base leading-relaxed flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="flex-1">
                    <strong className="text-foreground">{gap.title}:</strong>{" "}
                    <span className="text-muted-foreground">{gap.description}</span>
                  </span>
                  <Badge
                    variant={
                      gap.severity === "high"
                        ? "destructive"
                        : gap.severity === "medium"
                        ? "default"
                        : "secondary"
                    }
                    className="self-start sm:self-auto shrink-0"
                  >
                    {gap.severity}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>

          {normalizedSkills.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Missing Skills
              </h3>
              <p className="text-sm text-muted-foreground">
                Click on a skill to add it to your profile
              </p>
              <div className="flex flex-wrap gap-2">
                {normalizedSkills.map((skill, index) => {
                  const style = getSkillTypeStyle(skill.type);
                  const Icon = style.icon;
                  return (
                    <Badge
                      key={index}
                      variant={style.variant}
                      className={cn(style.className, "transition-all hover:scale-105 cursor-pointer")}
                      onClick={() => handleSkillClick(skill)}
                      title={`Click to add ${skill.name} to your profile`}
                    >
                      <Icon className="h-3 w-3 mr-1.5" />
                      {skill.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {analysis.suggestedFocusAreas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Suggested Focus Areas
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm lg:text-base pl-4">
                {analysis.suggestedFocusAreas.map((area, index) => (
                  <li key={index} className="text-muted-foreground leading-relaxed">{area}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <AddSkillDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        skill={selectedSkill}
        profileId={profileId}
        onSuccess={handleSkillAdded}
      />
    </>
  );
}
