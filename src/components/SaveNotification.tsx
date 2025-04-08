
import React, { useEffect, useState, useRef } from 'react';
import { Check, AlertCircle, Upload, Download, RefreshCw } from 'lucide-react';
import { Toast, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

interface SaveNotificationProps {
  status: 'saved' | 'error' | 'reset' | 'exported' | 'imported' | null;
  onClose: () => void;
}

const SaveNotification: React.FC<SaveNotificationProps> = ({ status, onClose }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use centralized toast system for notifications
  const { toast } = useToast();
  
  // Only show important notifications as toasts
  useEffect(() => {
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
  }, [status, toast]);
  
  // Handle visibility of notification
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
