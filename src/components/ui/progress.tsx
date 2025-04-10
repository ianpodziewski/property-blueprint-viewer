
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  variant?: "default" | "red" | "yellow" | "green"
  showValue?: boolean
  size?: "sm" | "md" | "lg"
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", showValue = false, size = "md", ...props }, ref) => {
  // Determine the color based on variant
  const getIndicatorColor = () => {
    switch (variant) {
      case "red":
        return "bg-red-500"
      case "yellow":
        return "bg-amber-500"
      case "green":
        return "bg-emerald-500"
      default:
        return "bg-primary"
    }
  }

  // Determine height based on size
  const getHeight = () => {
    switch (size) {
      case "sm":
        return "h-2"
      case "lg":
        return "h-6"
      default:
        return "h-4"
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-secondary",
          getHeight(),
          "w-full"
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all",
            getIndicatorColor()
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <div className="text-xs text-center font-medium">{value?.toFixed(1)}%</div>
      )}
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
