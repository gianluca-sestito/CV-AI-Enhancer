"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCVStyleContext } from "../CVStyleProvider";

export default function SpacingEditor() {
  const { styles, updateGlobalStyle, updateSectionStyle, updateElementStyle } =
    useCVStyleContext();

  return (
    <div className="space-y-6">
      {/* Global Spacing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Global Spacing</h3>
        <div className="space-y-3">
          <div>
            <Label>Base Spacing Unit</Label>
            <Input
              type="text"
              value={styles.global.baseSpacing}
              onChange={(e) => updateGlobalStyle("baseSpacing", e.target.value)}
              placeholder="1rem"
            />
          </div>
          <div>
            <Label>Section Spacing</Label>
            <Input
              type="text"
              value={styles.global.sectionSpacing}
              onChange={(e) => updateGlobalStyle("sectionSpacing", e.target.value)}
              placeholder="2rem"
            />
          </div>
        </div>
      </div>

      {/* Element Spacing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Element Spacing</h3>
        <div className="space-y-3">
          {/* H1 Spacing */}
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <Label className="text-xs font-medium">H1</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Margin Top</Label>
                <Input
                  type="text"
                  value={styles.elements.h1.marginTop || ""}
                  onChange={(e) => updateElementStyle("h1", "marginTop", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Margin Bottom</Label>
                <Input
                  type="text"
                  value={styles.elements.h1.marginBottom || ""}
                  onChange={(e) => updateElementStyle("h1", "marginBottom", e.target.value)}
                  placeholder="8px"
                />
              </div>
            </div>
          </div>

          {/* H2 Spacing */}
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <Label className="text-xs font-medium">H2</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Margin Top</Label>
                <Input
                  type="text"
                  value={styles.elements.h2.marginTop || ""}
                  onChange={(e) => updateElementStyle("h2", "marginTop", e.target.value)}
                  placeholder="32px"
                />
              </div>
              <div>
                <Label className="text-xs">Margin Bottom</Label>
                <Input
                  type="text"
                  value={styles.elements.h2.marginBottom || ""}
                  onChange={(e) => updateElementStyle("h2", "marginBottom", e.target.value)}
                  placeholder="16px"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Padding Bottom</Label>
              <Input
                type="text"
                value={styles.elements.h2.padding || ""}
                onChange={(e) => updateElementStyle("h2", "padding", e.target.value)}
                placeholder="8px"
              />
            </div>
          </div>

          {/* H3 Spacing */}
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <Label className="text-xs font-medium">H3</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Margin Top</Label>
                <Input
                  type="text"
                  value={styles.elements.h3.marginTop || ""}
                  onChange={(e) => updateElementStyle("h3", "marginTop", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Margin Bottom</Label>
                <Input
                  type="text"
                  value={styles.elements.h3.marginBottom || ""}
                  onChange={(e) => updateElementStyle("h3", "marginBottom", e.target.value)}
                  placeholder="8px"
                />
              </div>
            </div>
          </div>

          {/* Paragraph Spacing */}
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <Label className="text-xs font-medium">Paragraph</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Margin Top</Label>
                <Input
                  type="text"
                  value={styles.elements.p.marginTop || ""}
                  onChange={(e) => updateElementStyle("p", "marginTop", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Margin Bottom</Label>
                <Input
                  type="text"
                  value={styles.elements.p.marginBottom || ""}
                  onChange={(e) => updateElementStyle("p", "marginBottom", e.target.value)}
                  placeholder="8px"
                />
              </div>
            </div>
          </div>

          {/* List Item Spacing */}
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <Label className="text-xs font-medium">List Items</Label>
            <div>
              <Label className="text-xs">Margin Bottom</Label>
              <Input
                type="text"
                value={styles.elements.listItem.marginBottom || ""}
                onChange={(e) => updateElementStyle("listItem", "marginBottom", e.target.value)}
                placeholder="6px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Spacing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Section Spacing</h3>
        <div className="space-y-3">
          {Object.entries(styles.sections).map(([sectionKey, sectionStyles]) => (
            <div key={sectionKey} className="border border-gray-200 rounded p-3 space-y-2">
              <Label className="text-xs font-medium capitalize">{sectionKey}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Margin Top</Label>
                  <Input
                    type="text"
                    value={sectionStyles.marginTop || ""}
                    onChange={(e) =>
                      updateSectionStyle(sectionKey as any, "marginTop", e.target.value)
                    }
                    placeholder="0"
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Margin Bottom</Label>
                  <Input
                    type="text"
                    value={sectionStyles.marginBottom || ""}
                    onChange={(e) =>
                      updateSectionStyle(sectionKey as any, "marginBottom", e.target.value)
                    }
                    placeholder="0"
                    className="text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Padding</Label>
                <Input
                  type="text"
                  value={sectionStyles.padding || ""}
                  onChange={(e) =>
                    updateSectionStyle(sectionKey as any, "padding", e.target.value)
                  }
                  placeholder="0"
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


