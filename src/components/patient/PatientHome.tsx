import { useState, useEffect } from 'react';
import { Plus, Heart, BookOpen, Smile, Clock, Check, Bell } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { AddTaskDialog } from './AddTaskDialog';
import { HealthInfoModal } from './HealthInfoModal';
import { JournalModal } from './JournalModal';
import { MoodTrackerModal } from './MoodTrackerModal';
import { notificationService } from '../../utils/notificationService';

interface PatientHomeProps {
  user: any;
  session: any;
}

export function PatientHome({ user, session }: PatientHomeProps) {
  const [routines, setRoutines] = useState<any[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showHealthInfo, setShowHealthInfo] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchRoutines();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Request notification permission on mount
    if (notificationService.isSupported()) {
      notificationService.requestPermission().then(granted => {
        setNotificationsEnabled(granted);
      });
    }
    
    return () => {
      clearInterval(timer);
      notificationService.stopTaskReminders();
    };
  }, []);

  useEffect(() => {
    // Start task reminders when routines are loaded
    if (routines.length > 0 && notificationsEnabled) {
      notificationService.startTaskReminders(routines);
    }
  }, [routines, notificationsEnabled]);

  const fetchRoutines = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/routines`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoutines(data.routines.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/routines/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ completed: true })
        }
      );

      if (response.ok) {
        fetchRoutines();
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getUpcomingTask = () => {
    const now = currentTime;
    const today = routines.filter(r => !r.completed);
    
    return today.sort((a, b) => {
      const timeA = new Date(`${now.toDateString()} ${a.time}`);
      const timeB = new Date(`${now.toDateString()} ${b.time}`);
      return timeA.getTime() - timeB.getTime();
    })[0];
  };

  const upcomingTask = getUpcomingTask();

  const quickLinks = [
    { icon: Heart, label: 'Health Info', onClick: () => setShowHealthInfo(true), color: 'from-pink-400 to-pink-300' },
    { icon: BookOpen, label: 'Journal', onClick: () => setShowJournal(true), color: 'from-purple-400 to-purple-300' },
    { icon: Smile, label: 'Mood Track', onClick: () => setShowMoodTracker(true), color: 'from-blue-400 to-blue-300' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Greeting */}
      <div className="mb-8 text-center">
        <h1 className="mb-2">Hi there, {user.name}!</h1>
        <p className="text-xl text-muted-foreground">I'm here with you!</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <button
              key={index}
              onClick={link.onClick}
              className={`p-4 rounded-lg bg-gradient-to-br ${link.color} text-white hover:opacity-90 transition-opacity`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{link.label}</p>
            </button>
          );
        })}
      </div>

      {/* Upcoming Task */}
      {upcomingTask && (
        <div className="mb-6 p-4 bg-gradient-to-r from-[#fac5cd]/20 to-[#c5d2fa]/20 border-2 border-[#c5d2fa] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-[#c5d2fa]" />
            <h3 className="m-0">Next Task</h3>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="m-0">{upcomingTask.taskName}</p>
              <p className="text-sm text-muted-foreground m-0">
                <Clock className="w-4 h-4 inline mr-1" />
                {upcomingTask.time}
              </p>
            </div>
            <button
              onClick={() => handleTaskComplete(upcomingTask.id)}
              className="px-4 py-2 bg-white rounded-lg hover:bg-muted transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Daily Routine Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="m-0">Daily Routine</h2>
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading routines...</div>
        ) : routines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks yet. Click "Add Task" to create your first routine!
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-muted/50 border-border opacity-60'
                    : 'bg-white border-border hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className={task.completed ? 'line-through' : ''}>{task.time}</span>
                    </div>
                    <h4 className={`m-0 ${task.completed ? 'line-through' : ''}`}>
                      {task.taskName}
                    </h4>
                    {task.details && (
                      <p className="text-sm text-muted-foreground m-0 mt-1">{task.details}</p>
                    )}
                  </div>
                  {!task.completed && (
                    <button
                      onClick={() => handleTaskComplete(task.id)}
                      className="ml-4 p-2 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddTask && (
        <AddTaskDialog
          session={session}
          onClose={() => {
            setShowAddTask(false);
            fetchRoutines();
          }}
        />
      )}

      {showHealthInfo && (
        <HealthInfoModal
          user={user}
          session={session}
          onClose={() => setShowHealthInfo(false)}
        />
      )}

      {showJournal && (
        <JournalModal
          user={user}
          session={session}
          onClose={() => setShowJournal(false)}
        />
      )}

      {showMoodTracker && (
        <MoodTrackerModal
          user={user}
          session={session}
          onClose={() => setShowMoodTracker(false)}
        />
      )}
    </div>
  );
}
