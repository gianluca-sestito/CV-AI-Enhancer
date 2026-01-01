"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCVStyleContext } from "./CVStyleProvider";

interface CvLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function CvLayout({ children, className }: CvLayoutProps) {
  const { styles } = useCVStyleContext();

  return (
    <div
      className={cn(
        "container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8",
        "print:max-w-full print:px-0 print:py-4",
        className
      )}
      style={{
        backgroundColor: styles.global.backgroundColor,
        color: styles.global.textColor,
        fontFamily: styles.global.fontFamily,
        fontSize: styles.global.baseFontSize,
        lineHeight: styles.global.lineHeight,
      }}
    >
      <div>{children}</div>
    </div>
  );
}


