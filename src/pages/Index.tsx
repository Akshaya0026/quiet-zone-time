import { useState } from "react";
import FocusHero from "../components/FocusHero";
import SchedulerDashboard from "../components/SchedulerDashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<'hero' | 'dashboard'>('hero');

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBackToHero = () => {
    setCurrentView('hero');
  };

  if (currentView === 'dashboard') {
    return <SchedulerDashboard onBackToHero={handleBackToHero} />;
  }

  return (
    <div>
      <FocusHero 
        onNavigateToDashboard={handleNavigateToDashboard}
        onScheduleBlock={handleNavigateToDashboard}
      />
    </div>
  );
};

export default Index;
