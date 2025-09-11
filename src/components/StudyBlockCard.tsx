import { format } from "date-fns";
import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface StudyBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

interface StudyBlockCardProps {
  block: StudyBlock;
  onEdit?: (block: StudyBlock) => void;
  onDelete?: (blockId: string) => void;
}

const StudyBlockCard = ({ block, onEdit, onDelete }: StudyBlockCardProps) => {
  const duration = Math.round((block.endTime.getTime() - block.startTime.getTime()) / (1000 * 60));
  const isUpcoming = block.startTime > new Date();
  const isActive = new Date() >= block.startTime && new Date() <= block.endTime;

  return (
    <Card className={`study-block group ${isActive ? 'border-success shadow-glow' : isUpcoming ? 'border-primary/30' : 'border-border'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
            {block.title}
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-success/10 text-success' 
              : isUpcoming 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
          }`}>
            {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(block.startTime, 'MMM dd')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{duration} mins</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-sm font-medium text-foreground mb-1">
            {format(block.startTime, 'h:mm a')} - {format(block.endTime, 'h:mm a')}
          </div>
          {block.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {block.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Reminder: {format(new Date(block.startTime.getTime() - 10 * 60000), 'h:mm a')}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit?.(block)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete?.(block.id)}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StudyBlockCard;