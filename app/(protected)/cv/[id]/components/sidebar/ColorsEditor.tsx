"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCVStyleContext } from "../CVStyleProvider";
import type { CVStyles } from "../types";

export default function ColorsEditor() {
  const { styles, updateGlobalStyle, updateSectionStyle, updateElementStyle } =
    useCVStyleContext();

  return (
    <div className="space-y-6">
      {/* Global Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Global Colors</h3>
        <div className="space-y-3">
          <div>
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={styles.global.textColor}
                onChange={(e) => updateGlobalStyle("textColor", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={styles.global.textColor}
                onChange={(e) => updateGlobalStyle("textColor", e.target.value)}
                placeholder="#111827"
              />
            </div>
          </div>
          <div>
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={styles.global.backgroundColor}
                onChange={(e) => updateGlobalStyle("backgroundColor", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={styles.global.backgroundColor}
                onChange={(e) => updateGlobalStyle("backgroundColor", e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div>
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={styles.global.primaryColor}
                onChange={(e) => updateGlobalStyle("primaryColor", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={styles.global.primaryColor}
                onChange={(e) => updateGlobalStyle("primaryColor", e.target.value)}
                placeholder="#111827"
              />
            </div>
          </div>
          <div>
            <Label>Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={styles.global.secondaryColor}
                onChange={(e) => updateGlobalStyle("secondaryColor", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={styles.global.secondaryColor}
                onChange={(e) => updateGlobalStyle("secondaryColor", e.target.value)}
                placeholder="#6b7280"
              />
            </div>
          </div>
          <div>
            <Label>Border Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={styles.global.borderColor}
                onChange={(e) => updateGlobalStyle("borderColor", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={styles.global.borderColor}
                onChange={(e) => updateGlobalStyle("borderColor", e.target.value)}
                placeholder="#d1d5db"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Element Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Element Colors</h3>
        <div className="space-y-3">
          <div>
            <Label>H1 Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={styles.elements.h1.color || styles.global.textColor}
                onChange={(e) => updateElementStyle("h1", "color", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={styles.elements.h1.color || styles.global.textColor}
                onChange={(e) => updateElementStyle("h1", "color", e.target.value)}
                placeholder="#111827"
              />
            </div>
          </div>
          <div>
            <Label>H2 Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={styles.elements.h2.color || styles.global.textColor}
                onChange={(e) => updateElementStyle("h2", "color", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={styles.elements.h2.color || styles.global.textColor}
                onChange={(e) => updateElementStyle("h2", "color", e.target.value)}
                placeholder="#111827"
              />
            </div>
          </div>
          <div>
            <Label>H3 Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={styles.elements.h3.color || styles.global.textColor}
                onChange={(e) => updateElementStyle("h3", "color", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={styles.elements.h3.color || styles.global.textColor}
                onChange={(e) => updateElementStyle("h3", "color", e.target.value)}
                placeholder="#111827"
              />
            </div>
          </div>
          <div>
            <Label>Paragraph Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={styles.elements.p.color || styles.global.textColor}
                onChange={(e) => updateElementStyle("p", "color", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={styles.elements.p.color || styles.global.textColor}
                onChange={(e) => updateElementStyle("p", "color", e.target.value)}
                placeholder="#374151"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Section Colors</h3>
        <div className="space-y-3">
          {(Object.keys(styles.sections) as Array<keyof CVStyles["sections"]>).map((sectionKey) => {
            const sectionStyles = styles.sections[sectionKey];
            return (
              <div key={sectionKey} className="border border-gray-200 rounded p-3 space-y-2">
                <Label className="text-xs font-medium capitalize">{sectionKey}</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={sectionStyles.color || styles.global.textColor}
                        onChange={(e) =>
                          updateSectionStyle(sectionKey, "color", e.target.value)
                        }
                        className="w-12 h-8"
                      />
                      <Input
                        type="text"
                        value={sectionStyles.color || ""}
                        onChange={(e) =>
                          updateSectionStyle(sectionKey, "color", e.target.value)
                        }
                        placeholder="Inherit"
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={sectionStyles.backgroundColor || styles.global.backgroundColor}
                        onChange={(e) =>
                          updateSectionStyle(sectionKey, "backgroundColor", e.target.value)
                        }
                        className="w-12 h-8"
                      />
                      <Input
                        type="text"
                        value={sectionStyles.backgroundColor || ""}
                        onChange={(e) =>
                          updateSectionStyle(sectionKey, "backgroundColor", e.target.value)
                        }
                        placeholder="Inherit"
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


