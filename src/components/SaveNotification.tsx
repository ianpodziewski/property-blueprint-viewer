
import React, { useEffect, useState, useRef } from 'react';
import { Check, AlertCircle, Upload, Download, RefreshCw } from 'lucide-react';
import { Toast, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { useFloorExpansion } from '@/contexts/FloorExpansionContext';

interface SaveNotificationProps {
  status: 'saved' | 'error' | 'reset' | 'exported' | 'imported' | null;
  onClose: () => void;
}

// Enhanced notification tracking with longer cooldown periods
const notificationTracker = {
  recentNotifications: new Map<string, number>(),
  isProcessing: false,
  NOTIFICATION_EXPIRY: 10000, // Increased to 10 seconds
  consecutiveNotifications: 0,
  lastNotificationType: null as string | null,
  CIRCUIT_BREAKER_THRESHOLD: 3, // Break after 3 consecutive notifications
  
  // Check if notification is a duplicate with enhanced logic
  isDuplicate(type: string): boolean {
    // Circuit breaker logic - force suppression after threshold
    if (this.consecutiveNotifications >= this.CIRCUIT_BREAKER_THRESHOLD) {
      console.warn('Notification circuit breaker activated - suppressing notifications');
      return true;
    }
    
    const now = Date.now();
    const lastShown = this.recentNotifications.get(type);
    
    // Track consecutive notifications of the same type
    if (this.lastNotificationType === type) {
      this.consecutiveNotifications++;
    } else {
      this.consecutiveNotifications = 1;
      this.lastNotificationType = type;
    }
    
    return lastShown !== undefined && now - lastShown < this.NOTIFICATION_EXPIRY;
  },
  
  // Record a notification with console logging
  trackNotification(type: string): void {
    const now = Date.now();
    this.recentNotifications.set(type, now);
    console.log(`Notification tracked: ${type} at ${new Date(now).toISOString()}`);
    
    // Clean up old notifications
    for (const [key, timestamp] of this.recentNotifications.entries()) {
      if (now - timestamp > this.NOTIFICATION_EXPIRY) {
        this.recentNotifications.delete(key);
      }
    }
  },
  
  // Reset circuit breaker
  resetCircuitBreaker(): void {
    this.consecutiveNotifications = 0;
    this.lastNotificationType = null;
  }
};

// Mutex for synchronization
const notificationMutex = {
  locked: false,
  
  async acquire(): Promise<boolean> {
    if (this.locked) return false;
    this.locked = true;
    return true;
  },
  
  release(): void {
    this.locked = false;
  }
};

const SaveNotification: React.FC<SaveNotificationProps> = ({ status, onClose }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  
  // Use centralized toast system for notifications
  const { toast } = useToast();
  
  // Access the floor expansion context to check if UI interaction is in progress
  const { isInteracting } = useFloorExpansion();
  
  // Only show important notifications as toasts with enhanced deduplication
  useEffect(() => {
    // Skip if no status, already processing, or couldn't acquire mutex
    if (!status) return;
    
    // Skip notifications during UI interactions to prevent feedback loops
    if (isInteracting) {
      console.log('UI interaction in progress - suppressing notification for:', status);
      return;
    }
    
    const processNotification = async () => {
      if (notificationTracker.isProcessing || !(await notificationMutex.acquire())) {
        console.log('Skipping notification - mutex locked or already processing');
        return;
      }
      
      try {
        // Create a unique key for this notification type
        const notificationKey = `notification-${status}-${Date.now()}`;
        notificationIdRef.current = notificationKey;
        
        // Skip if this is a duplicate notification
        if (notificationTracker.isDuplicate(status)) {
          console.log(`Suppressing duplicate notification: ${status}`);
          return;
        }
        
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
      } finally {
        // Always release mutex
        setTimeout(() => {
          notificationTracker.isProcessing = false;
          notificationMutex.release();
        }, 2000); // Force minimum 2s between operations
      }
    };
    
    processNotification();
  }, [status, toast, isInteracting]);
  
  // Handle visibility of notification with debouncing
  useEffect(() => {
    if (status) {
      setVisible(true);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Set auto-hide timer with longer duration
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onClose();
          // Reset circuit breaker when notification closes
          notificationTracker.resetCircuitBreaker();
        }, 300); // Wait for fade out animation
      }, 5000); // Extended to 5s from 3s
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
