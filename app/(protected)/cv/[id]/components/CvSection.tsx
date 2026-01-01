"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCVStyleContext } from "./CVStyleProvider";

interface CvSectionProps {
  title: string;
  children: ReactNode;
  divider?: boolean;
  className?: string;
  sectionKey?: keyof ReturnType<typeof useCVStyleContext>["styles"]["sections"];
}

export default function CvSection({
  title,
  children,
  divider = true,
  className,
  sectionKey,
}: CvSectionProps) {
  const { styles } = useCVStyleContext();
  const sectionStyles = sectionKey ? styles.sections[sectionKey] : {};

  return (
    <section
      className={cn("mb-8 print:mb-6", className)}
      style={{
        marginTop: sectionStyles.marginTop || "0",
        marginBottom: sectionStyles.marginBottom || styles.global.sectionSpacing,
        color: sectionStyles.color || styles.global.textColor,
        backgroundColor: sectionStyles.backgroundColor || "transparent",
        padding: sectionStyles.padding || "0",
      }}
    >
      <h2
        className={cn(divider && "border-b")}
        style={{
          fontSize: styles.elements.h2.fontSize,
          fontWeight: styles.elements.h2.fontWeight,
          color: styles.elements.h2.color || styles.global.textColor,
          marginTop: styles.elements.h2.marginTop || "32px",
          marginBottom: styles.elements.h2.marginBottom || "16px",
          paddingBottom: styles.elements.h2.padding || (divider ? "8px" : "0"),
          borderBottomColor: divider ? styles.global.borderColor : "transparent",
          borderBottomWidth: divider ? "1px" : "0",
        }}
      >
        {title}
      </h2>
      <div className="space-y-4 print:space-y-3">{children}</div>
    </section>
  );
}


