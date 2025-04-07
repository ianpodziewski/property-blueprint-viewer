
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface SaveNotificationProps {
  status: 'saved' | 'error' | 'reset' | null;
  onClose: () => void;
}

const SaveNotification = ({ status, onClose }: SaveNotificationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (!status) return null;

  const getContent = () => {
    switch (status) {
      case 'saved':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'Changes saved',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          text: 'Error saving changes',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'reset':
        return {
          icon: <RotateCcw className="h-4 w-4 text-blue-500" />,
          text: 'All data reset',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'Operation complete',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const content = getContent();

  return (
    <div 
      className={`fixed bottom-4 right-4 flex items-center gap-2 ${content.bgColor} ${content.borderColor} 
      border px-3 py-2 rounded-md shadow-sm transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {content.icon}
      <span className="text-sm font-medium">{content.text}</span>
    </div>
  );
};

export default SaveNotification;
