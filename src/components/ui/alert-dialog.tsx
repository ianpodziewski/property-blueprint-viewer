
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Track active dialogs
const activeDialogs = new Set<string>();

// Store a unique ID for each dialog instance
const getDialogId = (() => {
  let counter = 0;
  return () => `alert-dialog-${counter++}`;
})();

const AlertDialog = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>
>(({ open, onOpenChange, ...props }, ref) => {
  const dialogId = React.useRef(getDialogId()).current;
  
  React.useEffect(() => {
    if (open) {
      activeDialogs.add(dialogId);
      console.log(`Dialog ${dialogId} opened. Active dialogs:`, Array.from(activeDialogs));
    } else if (activeDialogs.has(dialogId)) {
      activeDialogs.delete(dialogId);
      console.log(`Dialog ${dialogId} closed. Active dialogs:`, Array.from(activeDialogs));
    }
    
    return () => {
      if (activeDialogs.has(dialogId)) {
        activeDialogs.delete(dialogId);
        console.log(`Dialog ${dialogId} unmounted. Active dialogs:`, Array.from(activeDialogs));
      }
    };
  }, [open, dialogId]);
  
  return (
    <AlertDialogPrimitive.Root 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Ensure we always process the onOpenChange
          setTimeout(() => {
            if (onOpenChange) onOpenChange(isOpen);
          }, 0);
        } else {
          if (onOpenChange) onOpenChange(isOpen);
        }
      }}
      {...props}
    />
  );
});
AlertDialog.displayName = "AlertDialog";

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

// Custom portal component that ensures proper cleanup
const AlertDialogPortal = ({ children, ...props }: AlertDialogPrimitive.AlertDialogPortalProps) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  // Use React's createPortal to ensure proper event handling
  return createPortal(
    <AlertDialogPrimitive.Portal {...props}>
      {children}
    </AlertDialogPrimitive.Portal>,
    document.body
  );
};

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
    onClick={(e) => {
      // Always prevent default and stop propagation
      e.preventDefault();
      e.stopPropagation();
      
      // Call the original onClick handler if provided
      if (props.onClick) props.onClick(e);
    }}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      onClick={(e) => {
        // Always stop propagation
        e.stopPropagation();
        
        // Call the original onClick handler if provided
        if (props.onClick) props.onClick(e);
      }}
      onPointerDownOutside={(e) => {
        // Prevent dismissing when clicking outside
        e.preventDefault();
      }}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
    onClick={(e) => {
      e.stopPropagation();
      if (props.onClick) props.onClick(e);
    }}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
    onClick={(e) => {
      e.stopPropagation();
      if (props.onClick) props.onClick(e);
    }}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, children, ...props }, ref) => (
  // Fix for the DOM nesting warning - use div for content that might contain block elements
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    asChild={React.isValidElement(children)}
    {...props}
  >
    {React.isValidElement(children) ? children : <div>{children}</div>}
  </AlertDialogPrimitive.Description>
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, onClick, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Always stop propagation to prevent closing parent dialogs
    e.preventDefault();
    e.stopPropagation();
    
    // Add a small delay to ensure the dialog has time to process the click
    setTimeout(() => {
      // Call the original onClick if provided
      if (onClick) {
        onClick(e);
      }
      
      // Force a focus reset to ensure no stale focus state
      document.body.focus();
    }, 10);
  };
  
  return (
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(buttonVariants(), className)}
      onClick={handleClick}
      {...props}
    />
  );
})
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, onClick, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Always stop propagation to prevent closing parent dialogs
    e.preventDefault();
    e.stopPropagation();
    
    // Add a small delay to ensure the dialog has time to process the click
    setTimeout(() => {
      // Call the original onClick if provided
      if (onClick) {
        onClick(e);
      }
      
      // Force a focus reset to ensure no stale focus state
      document.body.focus();
    }, 10);
  };
  
  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
})
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

// Function to close all open dialogs (emergency recovery)
export const closeAllDialogs = () => {
  console.log("Emergency close of all dialogs triggered");
  document.querySelectorAll('[role="dialog"]').forEach(dialog => {
    dialog.setAttribute('data-state', 'closed');
    setTimeout(() => {
      if (dialog.parentNode) {
        dialog.parentNode.removeChild(dialog);
      }
    }, 300);
  });
  activeDialogs.clear();
};

// Utility to check if any dialogs are currently open
export const hasOpenDialogs = () => activeDialogs.size > 0;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
