
import Header from "@/components/Header";
import ModelingTabs from "@/components/ModelingTabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <ModelingTabs />
      </main>
    </div>
  );
};

export default Index;
