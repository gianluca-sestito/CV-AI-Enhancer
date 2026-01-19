"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
  showPercentage?: boolean
  variant?: "default" | "match"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    value = 0,
    max = 100,
    showLabel = false,
    showPercentage = false,
    variant = "default",
    ...props
  }, ref) => {
    const percentage = max === 0 ? 0 : Math.round((value / max) * 100)

    // Determine color based on percentage for match variant
    const getMatchColor = (pct: number) => {
      if (pct >= 70) return "bg-cv-match-high"
      if (pct >= 50) return "bg-cv-match-medium"
      return "bg-cv-match-low"
    }

    const fillColor = variant === "match"
      ? getMatchColor(percentage)
      : "bg-primary"

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(showLabel || showPercentage) && (
          <div className="flex items-center justify-between mb-2">
            {showLabel && (
              <span className="text-sm font-medium text-foreground">
                Progress
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-semibold text-foreground">
                {percentage}%
              </span>
            )}
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className="relative h-3 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              fillColor
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
