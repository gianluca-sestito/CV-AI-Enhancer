"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCVStyleContext } from "../CVStyleProvider";

const FONT_FAMILIES = [
  { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", label: "System Sans" },
  { value: "'Georgia', 'Times New Roman', serif", label: "Serif" },
  { value: "'Courier New', monospace", label: "Monospace" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
];

const FONT_WEIGHTS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

export default function TypographyEditor() {
  const { styles, updateGlobalStyle, updateSectionStyle, updateElementStyle } =
    useCVStyleContext();

  return (
    <div className="space-y-6">
      {/* Global Typography */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Global Typography</h3>
        <div className="space-y-3">
          <div>
            <Label>Font Family</Label>
            <Select
              value={styles.global.fontFamily}
              onValueChange={(value) => updateGlobalStyle("fontFamily", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Base Font Size</Label>
            <Input
              type="text"
              value={styles.global.baseFontSize}
              onChange={(e) => updateGlobalStyle("baseFontSize", e.target.value)}
              placeholder="11pt"
            />
          </div>
          <div>
            <Label>Line Height</Label>
            <Input
              type="text"
              value={styles.global.lineHeight}
              onChange={(e) => updateGlobalStyle("lineHeight", e.target.value)}
              placeholder="1.6"
            />
          </div>
        </div>
      </div>

      {/* Element Typography */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Headings</h3>
        <div className="space-y-3">
          {/* H1 */}
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <Label className="text-xs font-medium">H1 (Name)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Size</Label>
                <Input
                  type="text"
                  value={styles.elements.h1.fontSize || ""}
                  onChange={(e) => updateElementStyle("h1", "fontSize", e.target.value)}
                  placeholder="30pt"
                />
              </div>
              <div>
                <Label className="text-xs">Weight</Label>
                <Select
                  value={styles.elements.h1.fontWeight || "bold"}
                  onValueChange={(value) => updateElementStyle("h1", "fontWeight", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* H2 */}
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <Label className="text-xs font-medium">H2 (Section Titles)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Size</Label>
                <Input
                  type="text"
                  value={styles.elements.h2.fontSize || ""}
                  onChange={(e) => updateElementStyle("h2", "fontSize", e.target.value)}
                  placeholder="20pt"
                />
              </div>
              <div>
                <Label className="text-xs">Weight</Label>
                <Select
                  value={styles.elements.h2.fontWeight || "bold"}
                  onValueChange={(value) => updateElementStyle("h2", "fontWeight", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* H3 */}
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <Label className="text-xs font-medium">H3 (Subheadings)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Size</Label>
                <Input
                  type="text"
                  value={styles.elements.h3.fontSize || ""}
                  onChange={(e) => updateElementStyle("h3", "fontSize", e.target.value)}
                  placeholder="16pt"
                />
              </div>
              <div>
                <Label className="text-xs">Weight</Label>
                <Select
                  value={styles.elements.h3.fontWeight || "600"}
                  onValueChange={(value) => updateElementStyle("h3", "fontWeight", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paragraph Typography */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Text</h3>
        <div className="border border-gray-200 rounded p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Paragraph Size</Label>
              <Input
                type="text"
                value={styles.elements.p.fontSize || ""}
                onChange={(e) => updateElementStyle("p", "fontSize", e.target.value)}
                placeholder="11pt"
              />
            </div>
            <div>
              <Label className="text-xs">Line Height</Label>
              <Input
                type="text"
                value={styles.elements.p.lineHeight || ""}
                onChange={(e) => updateElementStyle("p", "lineHeight", e.target.value)}
                placeholder="1.6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badge Typography */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Skills Badges</h3>
        <div className="border border-gray-200 rounded p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Font Size</Label>
              <Input
                type="text"
                value={styles.elements.badge.fontSize || ""}
                onChange={(e) => updateElementStyle("badge", "fontSize", e.target.value)}
                placeholder="14pt"
              />
            </div>
            <div>
              <Label className="text-xs">Weight</Label>
              <Select
                value={styles.elements.badge.fontWeight || "500"}
                onValueChange={(value) => updateElementStyle("badge", "fontWeight", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


