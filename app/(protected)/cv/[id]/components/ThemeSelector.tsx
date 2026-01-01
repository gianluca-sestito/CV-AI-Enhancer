"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCVTheme } from "./CVThemeProvider";
import { themes, type ThemeName } from "./themes";

export default function ThemeSelector() {
  const { themeName, setTheme } = useCVTheme();

  return (
    <Select value={themeName} onValueChange={(value) => setTheme(value as ThemeName)}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(themes).map(([key, theme]) => (
          <SelectItem key={key} value={key}>
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


