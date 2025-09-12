import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, Target, Filter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StudyBlockCard from "./StudyBlockCard";
import CreateBlockModal from "./CreateBlockModal";
import { UserMenu } from "./UserMenu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface StudyBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

interface SchedulerDashboardProps {
  onBackToHero?: () => void;
}

const SchedulerDashboard = ({ onBackToHero }: SchedulerDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  const activeBlocks = blocks.filter(block => {
    const now = new Date();
    return now >= block.startTime && now <= block.endTime;
  });

  const upcomingBlocks = blocks.filter(block => block.startTime > new Date());
  const completedBlocks = blocks.filter(block => block.endTime < new Date());

  const filteredBlocks = blocks.filter(block => {
    const now = new Date();
    switch (filterType) {
      case 'active':
        return now >= block.startTime && now <= block.endTime;
      case 'upcoming':
        return block.startTime > now;
      case 'completed':
        return block.endTime < now;
      default:
        return true;
    }
  });

  // Load study blocks from Supabase
  useEffect(() => {
    if (user) {
      loadStudyBlocks();
    }
  }, [user]);

  const loadStudyBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('study_blocks')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;

      const formattedBlocks: StudyBlock[] = data.map(block => ({
        id: block.id,
        title: block.title,
        startTime: new Date(block.start_time),
        endTime: new Date(block.end_time),
        description: block.description
      }));

      setBlocks(formattedBlocks);
    } catch (error) {
      console.error('Error loading study blocks:', error);
      toast({
        title: "Error",
        description: "Failed to load your study blocks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlock = async (newBlock: Omit<StudyBlock, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_blocks')
        .insert({
          user_id: user.id,
          title: newBlock.title,
          start_time: newBlock.startTime.toISOString(),
          end_time: newBlock.endTime.toISOString(),
          description: newBlock.description
        })
        .select()
        .single();

      if (error) throw error;

      const formattedBlock: StudyBlock = {
        id: data.id,
        title: data.title,
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        description: data.description
      };

      setBlocks([...blocks, formattedBlock]);
      toast({
        title: "Success!",
        description: "Study block created successfully. You'll receive an email reminder 10 minutes before it starts."
      });
    } catch (error) {
      console.error('Error creating study block:', error);
      toast({
        title: "Error",
        description: "Failed to create study block",
        variant: "destructive"
      });
    }
  };

  const handleEditBlock = (block: StudyBlock) => {
    // TODO: Implement edit functionality
    console.log('Edit block:', block);
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('study_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      setBlocks(blocks.filter(b => b.id !== blockId));
      toast({
        title: "Deleted",
        description: "Study block deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting study block:', error);
      toast({
        title: "Error",
        description: "Failed to delete study block",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-calm">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            {onBackToHero && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onBackToHero}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">
                Focus Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your quiet study sessions and stay productive
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => setIsCreateModalOpen(true)}
              className="shadow-focus"
            >
              <Plus className="w-5 h-5 mr-2" />
              Schedule Block
            </Button>
            <UserMenu />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-primary text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Active Now</p>
                  <p className="text-3xl font-bold">{activeBlocks.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Upcoming</p>
                  <p className="text-3xl font-bold text-primary">{upcomingBlocks.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold text-success">{completedBlocks.length}</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          {[
            { key: 'all', label: 'All Blocks' },
            { key: 'active', label: 'Active' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filterType === key ? 'focus' : 'outline'}
              size="sm"
              onClick={() => setFilterType(key as typeof filterType)}
              className="transition-focus"
            >
              <Filter className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Study Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlocks.map(block => (
            <StudyBlockCard
              key={block.id}
              block={block}
              onEdit={handleEditBlock}
              onDelete={handleDeleteBlock}
            />
          ))}
        </div>

        {filteredBlocks.length === 0 && (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No study blocks found</h3>
              <p className="text-muted-foreground mb-6">
                {filterType === 'all' 
                  ? 'Create your first study block to get started with focused learning.'
                  : `No ${filterType} study blocks at the moment.`
                }
              </p>
              <Button 
                variant="focus" 
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Study Block
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Block Modal */}
      <CreateBlockModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateBlock}
      />
    </div>
  );
};

export default SchedulerDashboard;