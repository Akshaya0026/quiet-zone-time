import { Calendar, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-focus.jpg";

interface FocusHeroProps {
  onNavigateToDashboard?: () => void;
  onScheduleBlock?: () => void;
}

const FocusHero = ({ onNavigateToDashboard, onScheduleBlock }: FocusHeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-calm">
        <img 
          src={heroImage} 
          alt="Peaceful study environment"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-focus opacity-20" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-focus-in">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-8 animate-pulse-subtle">
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium">Focus-Driven Productivity</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
          Quiet Hours
          <span className="block text-gradient">Scheduler</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Schedule focused study blocks and receive gentle reminders. 
          Transform your productivity with intentional quiet time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="focus-button text-lg px-8 py-4"
            onClick={onScheduleBlock}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Study Block
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-4 border-primary/30 hover:bg-primary/10"
            onClick={onNavigateToDashboard}
          >
            <Clock className="w-5 h-5 mr-2" />
            View Dashboard
          </Button>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-sm text-muted-foreground">Plan focused study sessions that fit your schedule</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Gentle Reminders</h3>
            <p className="text-sm text-muted-foreground">Email notifications 10 minutes before your session</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-3">Deep Focus</h3>
            <p className="text-sm text-muted-foreground">Distraction-free environment for maximum productivity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusHero;