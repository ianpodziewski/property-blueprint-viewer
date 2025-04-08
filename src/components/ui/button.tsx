
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Track button interactions for debugging
let buttonClickCounter = 0;
const buttonEventLog = new Map<string, number>();
const MAX_EVENT_LOG_SIZE = 50;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Utility function to log button interactions
const logButtonInteraction = (action: string, props: any) => {
  try {
    buttonClickCounter++;
    const buttonId = props.id || `button-${buttonClickCounter}`;
    const timestamp = Date.now();
    
    // Limit the log size to avoid memory leaks
    if (buttonEventLog.size > MAX_EVENT_LOG_SIZE) {
      const oldestKey = buttonEventLog.keys().next().value;
      if (oldestKey) buttonEventLog.delete(oldestKey);
    }
    
    buttonEventLog.set(`${buttonId}-${timestamp}`, timestamp);
    
    console.log(`Button interaction: ${action}`, {
      buttonId,
      children: props.children,
      disabled: props.disabled,
      timestamp
    });
  } catch (e) {
    // Silent catch to avoid errors in production
  }
};

// Enhanced button with robust click handling
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, disabled, ...props }, ref) => {
    // Generate a unique ref for this button instance
    const buttonRef = React.useRef<string>(`button-${Math.random().toString(36).substring(2, 9)}`);
    const [isRecentlyClicked, setIsRecentlyClicked] = React.useState(false);

    // Enhanced click handler to prevent duplicate clicks and ensure events fire properly
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isRecentlyClicked) {
        event.preventDefault();
        event.stopPropagation();
        logButtonInteraction("clicked-prevented", { ...props, disabled, id: buttonRef.current });
        return;
      }

      try {
        // Stop propagation by default to prevent parent handlers from firing
        event.stopPropagation();
        logButtonInteraction("clicked", { ...props, id: buttonRef.current });
        
        // Set a brief debounce to prevent double-clicks
        setIsRecentlyClicked(true);
        setTimeout(() => {
          setIsRecentlyClicked(false);
        }, 300);
        
        // Ensure the click handler runs in its own execution context
        setTimeout(() => {
          if (onClick) {
            onClick(event);
          }
        }, 0);

      } catch (error) {
        console.error("Error in button click handler:", error);
        setIsRecentlyClicked(false);
      }
    }, [onClick, disabled, isRecentlyClicked, props]);

    // Track button mount/unmount for debugging
    React.useEffect(() => {
      logButtonInteraction("mounted", { ...props, id: buttonRef.current });
      return () => {
        logButtonInteraction("unmounted", { ...props, id: buttonRef.current });
      };
    }, [props]);

    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }), 
          isRecentlyClicked ? "pointer-events-none opacity-90" : ""
        )}
        ref={ref}
        onClick={handleClick}
        disabled={disabled || isRecentlyClicked}
        data-button-id={buttonRef.current}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

// Export a utility to check if buttons are actually clickable
export const checkButtonsClickable = () => {
  try {
    const buttons = document.querySelectorAll('button');
    const clickableButtons = Array.from(buttons).filter(button => {
      const style = window.getComputedStyle(button);
      return !button.disabled && 
             style.pointerEvents !== 'none' && 
             style.display !== 'none' && 
             style.visibility !== 'hidden';
    });
    
    console.log(`Found ${clickableButtons.length} clickable buttons out of ${buttons.length} total buttons`);
    return { total: buttons.length, clickable: clickableButtons.length };
  } catch (e) {
    console.error("Error checking button clickability:", e);
    return { total: 0, clickable: 0 };
  }
};

export { Button, buttonVariants };
