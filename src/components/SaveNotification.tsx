
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import { X } from "lucide-react";

type SaveNotificationProps = {
  status: "saved" | "error" | "reset" | "exported" | "imported" | null;
  onClose: () => void;
};

const SaveNotification = ({ status, onClose }: SaveNotificationProps) => {
  useEffect(() => {
    if (status === "saved") {
      toast.success("Changes saved", {
        description: "Your changes have been saved to local storage.",
        action: {
          label: "Dismiss",
          onClick: onClose,
        },
      });
    } else if (status === "error") {
      toast.error("Error saving changes", {
        description: "There was a problem saving your changes. Please try again.",
        action: {
          label: "Dismiss",
          onClick: onClose,
        },
      });
    } else if (status === "reset") {
      toast.info("Data reset", {
        description: "All model data has been reset to default values.",
        action: {
          label: "Dismiss",
          onClick: onClose,
        },
      });
    } else if (status === "exported") {
      toast.success("Data exported", {
        description: "Your model data has been exported successfully.",
        action: {
          label: "Dismiss",
          onClick: onClose,
        },
      });
    } else if (status === "imported") {
      toast.success("Data imported", {
        description: "Your model data has been imported successfully.",
        action: {
          label: "Dismiss",
          onClick: onClose,
        },
      });
    }
  }, [status, onClose]);

  return null;
};

export default SaveNotification;
