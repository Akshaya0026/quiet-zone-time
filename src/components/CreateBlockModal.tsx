import { useState } from "react";
import { Calendar, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (block: {
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
  }) => void;
}

const CreateBlockModal = ({ open, onOpenChange, onSubmit }: CreateBlockModalProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse the date and time inputs
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        alert("End time must be after start time");
        return;
      }

      // Validate that the session is in the future
      if (startDateTime <= new Date()) {
        alert("Study block must be scheduled for the future");
        return;
      }

      onSubmit({
        title,
        startTime: startDateTime,
        endTime: endDateTime,
        description: description || undefined,
      });

      // Reset form
      setTitle("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating study block:", error);
      alert("Please check your date and time inputs");
    } finally {
      setLoading(false);
    }
  };

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-gradient">
            Schedule Study Block
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a focused study session with email reminders
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Study Session Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deep Learning Review"
              required
              className="transition-focus focus:shadow-focus"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
              className="transition-focus focus:shadow-focus"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="transition-focus focus:shadow-focus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="transition-focus focus:shadow-focus"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you focus on during this session?"
              rows={3}
              className="transition-focus focus:shadow-focus resize-none"
            />
          </div>

          {/* Reminder Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground mb-1">
                  Email Reminder
                </p>
                <p className="text-sm text-muted-foreground">
                  You'll receive a gentle reminder 10 minutes before your study block begins.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="focus" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Creating..." : "Schedule Block"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBlockModal;