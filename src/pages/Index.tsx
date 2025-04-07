
import Header from "@/components/Header";
import ModelingTabs from "@/components/ModelingTabs";
import SaveNotification from "@/components/SaveNotification";
import { useModelState } from "@/hooks/useModelState";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { saveStatus, clearSaveStatus, resetAllData } = useModelState();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-end mb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all model data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All saved data will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllData}>
                  Reset All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <ModelingTabs />
      </main>
      <SaveNotification status={saveStatus} onClose={clearSaveStatus} />
    </div>
  );
};

export default Index;
