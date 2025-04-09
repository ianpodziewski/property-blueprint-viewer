
import React, { useEffect, useState, useRef } from 'react';
import { Check, AlertCircle, Upload, Download, RefreshCw } from 'lucide-react';
import { Toast, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

interface SaveNotificationProps {
  status: 'saved' | 'error' | 'reset' | 'exported' | 'imported' | null;
  onClose: () => void;
}

// Global notification tracking with stronger deduplication
const notificationTracker = {
  recentNotifications: new Map<string, number>(),
  isProcessing: false,
  NOTIFICATION_EXPIRY: 5000, // 5 seconds
  
  // Check if notification is a duplicate
  isDuplicate(type: string): boolean {
    const now = Date.now();
    const lastShown = this.recentNotifications.get(type);
    return lastShown !== undefined && now - lastShown < this.NOTIFICATION_EXPIRY;
  },
  
  // Record a notification
  trackNotification(type: string): void {
    this.recentNotifications.set(type, Date.now());
    
    // Clean up old notifications
    const now = Date.now();
    for (const [key, timestamp] of this.recentNotifications.entries()) {
      if (now - timestamp > this.NOTIFICATION_EXPIRY) {
        this.recentNotifications.delete(key);
      }
    }
  }
};

const SaveNotification: React.FC<SaveNotificationProps> = ({ status, onClose }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  
  // Use centralized toast system for notifications
  const { toast } = useToast();
  
  // Only show important notifications as toasts with enhanced deduplication
  useEffect(() => {
    // Skip if no status or already processing a notification
    if (!status || notificationTracker.isProcessing) return;
    
    // Create a unique key for this notification type
    const notificationKey = `notification-${status}`;
    notificationIdRef.current = notificationKey;
    
    // Skip if this is a duplicate notification
    if (notificationTracker.isDuplicate(status)) {
      return;
    }
    
    // Set processing flag to prevent overlapping notifications
    notificationTracker.isProcessing = true;
    
    // Track this notification
    notificationTracker.trackNotification(status);
    
    // Only show toast for important events
    if (status === 'error' || status === 'reset' || status === 'exported' || status === 'imported') {
      const title = {
        error: 'Error',
        reset: 'Reset Complete',
        exported: 'Export Complete',
        imported: 'Import Complete'
      }[status];
      
      const description = {
        error: 'An error occurred while saving',
        reset: 'All data has been reset',
        exported: 'Data successfully exported',
        imported: 'Data successfully imported'
      }[status];
      
      toast({
        title,
        description,
        variant: status === 'error' ? 'destructive' : 'default',
        duration: 3000,
      });
    }
    
    // Release processing lock after a delay
    setTimeout(() => {
      notificationTracker.isProcessing = false;
    }, 1000);
  }, [status, toast]);
  
  // Handle visibility of notification with debouncing
  useEffect(() => {
    if (status) {
      setVisible(true);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Set auto-hide timer
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onClose();
        }, 300); // Wait for fade out animation
      }, 3000);
    } else {
      setVisible(false);
    }
    
    // Cleanup on unmount or status change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [status, onClose]);

  // Don't render if no status
  if (!status) return null;
  
  // Different UI based on status
  const getStatusUI = () => {
    switch (status) {
      case 'saved':
        return {
          icon: <Check className="h-4 w-4" />,
          message: 'Saved',
          color: 'bg-green-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          message: 'Error saving',
          color: 'bg-red-600'
        };
      case 'reset':
        return {
          icon: <RefreshCw className="h-4 w-4" />,
          message: 'Reset complete',
          color: 'bg-blue-600'
        };
      case 'exported':
        return {
          icon: <Download className="h-4 w-4" />,
          message: 'Export complete',
          color: 'bg-blue-600'
        };
      case 'imported':
        return {
          icon: <Upload className="h-4 w-4" />,
          message: 'Import complete',
          color: 'bg-blue-600'
        };
      default:
        return {
          icon: <Check className="h-4 w-4" />,
          message: 'Saved',
          color: 'bg-green-600'
        };
    }
  };

  const { icon, message, color } = getStatusUI();

  return (
    <ToastProvider>
      <Toast
        className={`fixed bottom-4 right-4 z-50 flex items-center ${color} text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {icon}
        <ToastTitle className="ml-2">{message}</ToastTitle>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
};

export default SaveNotification;
