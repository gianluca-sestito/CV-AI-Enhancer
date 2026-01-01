"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EditableText from "./EditableText";
import type { CVHeader as CVHeaderType } from "./types";

interface EditableHeaderProps {
  header: CVHeaderType;
  onChange: (header: CVHeaderType) => void;
  isEditing: boolean;
}

export default function EditableHeader({
  header,
  onChange,
  isEditing,
}: EditableHeaderProps) {
  const initials = header.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFieldChange = (field: keyof CVHeaderType, value: string) => {
    onChange({
      ...header,
      [field]: value || null,
    });
  };

  return (
    <div className="mb-8 print:mb-6">
      {/* Desktop: Two-column grid */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto] md:gap-8 md:items-start">
        {/* Left: Name, role, contacts */}
        <div className="space-y-2">
          {isEditing ? (
            <EditableText
              value={header.name}
              onChange={(value) => handleFieldChange("name", value)}
              className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight"
              placeholder="Full Name"
            />
          ) : (
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {header.name}
            </h1>
          )}

          {isEditing ? (
            <EditableText
              value={header.role || ""}
              onChange={(value) => handleFieldChange("role", value)}
              className="text-lg font-semibold text-gray-700"
              placeholder="Job Title / Role"
            />
          ) : (
            header.role && (
              <p className="text-lg font-semibold text-gray-700">{header.role}</p>
            )
          )}

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {isEditing ? (
              <>
                <EditableText
                  value={header.location || ""}
                  onChange={(value) => handleFieldChange("location", value)}
                  className="text-sm text-gray-600"
                  placeholder="Location"
                />
                <span className="before:content-['·'] before:mr-3">
                  <EditableText
                    value={header.email || ""}
                    onChange={(value) => handleFieldChange("email", value)}
                    className="text-sm text-gray-600"
                    placeholder="email@example.com"
                  />
                </span>
                <span className="before:content-['·'] before:mr-3">
                  <EditableText
                    value={header.phone || ""}
                    onChange={(value) => handleFieldChange("phone", value)}
                    className="text-sm text-gray-600"
                    placeholder="Phone"
                  />
                </span>
              </>
            ) : (
              <>
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
              </>
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
          {isEditing ? (
            <EditableText
              value={header.name}
              onChange={(value) => handleFieldChange("name", value)}
              className="text-2xl font-bold text-gray-900"
              placeholder="Full Name"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{header.name}</h1>
          )}

          {isEditing ? (
            <EditableText
              value={header.role || ""}
              onChange={(value) => handleFieldChange("role", value)}
              className="text-base font-semibold text-gray-700"
              placeholder="Job Title / Role"
            />
          ) : (
            header.role && (
              <p className="text-base font-semibold text-gray-700">{header.role}</p>
            )
          )}

          <div className="flex flex-col gap-1 text-sm text-gray-600">
            {isEditing ? (
              <>
                <EditableText
                  value={header.location || ""}
                  onChange={(value) => handleFieldChange("location", value)}
                  className="text-sm text-gray-600"
                  placeholder="Location"
                />
                <EditableText
                  value={header.email || ""}
                  onChange={(value) => handleFieldChange("email", value)}
                  className="text-sm text-gray-600"
                  placeholder="email@example.com"
                />
                <EditableText
                  value={header.phone || ""}
                  onChange={(value) => handleFieldChange("phone", value)}
                  className="text-sm text-gray-600"
                  placeholder="Phone"
                />
              </>
            ) : (
              <>
                {header.location && <span>{header.location}</span>}
                {header.email && <span>{header.email}</span>}
                {header.phone && <span>{header.phone}</span>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


