"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CVEditorSettings } from "./CVEditorSettings";
import { Settings, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CVEditorControlsProps {
  settings: CVEditorSettings;
  onSettingsChange: (settings: CVEditorSettings) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CVEditorControls({
  settings,
  onSettingsChange,
  onReset,
  isOpen,
  onToggle,
}: CVEditorControlsProps) {
  const updateSetting = <K extends keyof CVEditorSettings>(
    key: K,
    value: CVEditorSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="fixed top-20 right-4 z-40 lg:top-24 lg:right-6 shadow-lg"
        aria-label="Toggle editor settings"
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Settings className="h-4 w-4" />
        )}
      </Button>

      {/* Settings Panel */}
      <div
        className={cn(
          "fixed top-16 right-0 z-30 h-[calc(100vh-4rem)] w-full max-w-sm bg-background border-l shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto",
          "lg:top-20 lg:max-w-md",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Card className="border-0 rounded-none h-full flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Editor Settings</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Font Family</label>
              <Select
                value={settings.fontFamily}
                onValueChange={(value: 'serif' | 'sans-serif' | 'mixed') =>
                  updateSetting('fontFamily', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans-serif">Sans-serif</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.fontFamily === 'serif' && 'Traditional, professional look'}
                {settings.fontFamily === 'sans-serif' && 'Modern, clean appearance'}
                {settings.fontFamily === 'mixed' && 'Serif headings, sans-serif body'}
              </p>
            </div>

            {/* Color Scheme */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Color Scheme</label>
              <Select
                value={settings.colorScheme}
                onValueChange={(value: 'warm' | 'cool' | 'minimal' | 'custom') =>
                  updateSetting('colorScheme', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cool">Cool</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.colorScheme === 'warm' && 'Cream background, warm tones'}
                {settings.colorScheme === 'cool' && 'White/light gray, cool blues'}
                {settings.colorScheme === 'minimal' && 'Pure white, subtle grays'}
                {settings.colorScheme === 'custom' && 'Custom color palette'}
              </p>
            </div>

            {/* Layout */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Layout</label>
              <Select
                value={settings.layout}
                onValueChange={(value: 'traditional' | 'modern' | 'compact') =>
                  updateSetting('layout', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.layout === 'traditional' && 'Classic CV format'}
                {settings.layout === 'modern' && 'Contemporary design'}
                {settings.layout === 'compact' && 'Dense, space-efficient'}
              </p>
            </div>

            {/* Spacing */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Spacing</label>
              <Select
                value={settings.spacing}
                onValueChange={(value: 'compact' | 'normal' | 'spacious') =>
                  updateSetting('spacing', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Font Size</label>
              <Select
                value={settings.fontSize}
                onValueChange={(value: 'small' | 'medium' | 'large') =>
                  updateSetting('fontSize', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={onReset}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}

