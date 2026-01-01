"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCVStyleContext } from "./CVStyleProvider";
import type { CVHeader as CVHeaderType } from "./types";

interface CvHeaderProps {
  header: CVHeaderType;
}

export default function CvHeader({ header }: CvHeaderProps) {
  const { styles } = useCVStyleContext();
  const sectionStyles = styles.sections.header;
  const initials = header.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="mb-8 print:mb-6"
      style={{
        marginBottom: sectionStyles.marginBottom || styles.global.sectionSpacing,
        color: sectionStyles.color || styles.global.textColor,
        backgroundColor: sectionStyles.backgroundColor || "transparent",
        padding: sectionStyles.padding || "0",
      }}
    >
      {/* Desktop: Two-column grid */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto] md:gap-8 md:items-start">
        {/* Left: Name, role, contacts */}
        <div className="space-y-2">
          <h1
            style={{
              fontSize: styles.elements.h1.fontSize,
              fontWeight: styles.elements.h1.fontWeight,
              color: styles.elements.h1.color || styles.global.textColor,
              marginTop: styles.elements.h1.marginTop || "0",
              marginBottom: styles.elements.h1.marginBottom || "8px",
              lineHeight: "1.2",
            }}
          >
            {header.name}
          </h1>
          {header.role && (
            <p
              style={{
                fontSize: "18pt",
                fontWeight: "600",
                color: sectionStyles.color || styles.global.secondaryColor,
              }}
            >
              {header.role}
            </p>
          )}
          <div
            className="flex flex-wrap gap-3"
            style={{
              fontSize: "14pt",
              color: sectionStyles.color || styles.global.secondaryColor,
            }}
          >
            {header.location && <span>{header.location}</span>}
            {header.email && (
              <span className="before:content-['·'] before:mr-3">
                {header.email}
              </span>
            )}
            {header.phone && (
              <span className="before:content-['·'] before:mr-3">
                {header.phone}
              </span>
            )}
          </div>
        </div>

        {/* Right: Profile image */}
        {header.imageUrl && (
          <div className="flex items-start">
            <Avatar className="h-24 w-24 lg:h-28 lg:w-28 border-2 border-gray-200">
              <AvatarImage src={header.imageUrl} alt={header.name} />
              <AvatarFallback className="text-xl font-semibold bg-gray-100 text-gray-700">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>

      {/* Mobile: Stacked layout */}
      <div className="md:hidden space-y-4 text-center">
        {header.imageUrl && (
          <div className="flex justify-center">
            <Avatar className="h-20 w-20 border-2 border-gray-200">
              <AvatarImage src={header.imageUrl} alt={header.name} />
              <AvatarFallback className="text-lg font-semibold bg-gray-100 text-gray-700">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        <div className="space-y-2">
          <h1
            style={{
              fontSize: styles.elements.h1.fontSize,
              fontWeight: styles.elements.h1.fontWeight,
              color: styles.elements.h1.color || styles.global.textColor,
            }}
          >
            {header.name}
          </h1>
          {header.role && (
            <p
              style={{
                fontSize: "16pt",
                fontWeight: "600",
                color: sectionStyles.color || styles.global.secondaryColor,
              }}
            >
              {header.role}
            </p>
          )}
          <div
            className="flex flex-col gap-1"
            style={{
              fontSize: "14pt",
              color: sectionStyles.color || styles.global.secondaryColor,
            }}
          >
            {header.location && <span>{header.location}</span>}
            {header.email && <span>{header.email}</span>}
            {header.phone && <span>{header.phone}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}


