// Notification Service for Task Reminders
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  showNotification(title: string, options?: NotificationOptions) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  async startTaskReminders(tasks: any[], onTaskDue?: (task: any) => void) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Cannot start task reminders without notification permission');
      return;
    }

    // Clear existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every minute for upcoming tasks
    this.checkInterval = setInterval(() => {
      this.checkUpcomingTasks(tasks, onTaskDue);
    }, 60000);

    // Also check immediately
    this.checkUpcomingTasks(tasks, onTaskDue);
  }

  private checkUpcomingTasks(tasks: any[], onTaskDue?: (task: any) => void) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    tasks.forEach(task => {
      if (task.completed) return;

      // Check if task time matches current time
      if (task.time === currentTime) {
        this.showNotification('Task Reminder', {
          body: `Time for: ${task.taskName}`,
          tag: task.id,
          data: task
        });

        if (onTaskDue) {
          onTaskDue(task);
        }
      }

      // Check for snooze reminders (5 minutes before)
      if (task.snoozeTime) {
        const [hours, minutes] = task.time.split(':').map(Number);
        const taskTime = new Date(now);
        taskTime.setHours(hours, minutes, 0, 0);

        const snoozeMinutes = parseInt(task.snoozeTime);
        const snoozeTime = new Date(taskTime.getTime() - snoozeMinutes * 60000);

        const snoozeTimeString = `${snoozeTime.getHours().toString().padStart(2, '0')}:${snoozeTime.getMinutes().toString().padStart(2, '0')}`;

        if (snoozeTimeString === currentTime) {
          this.showNotification('Upcoming Task', {
            body: `In ${snoozeMinutes} minutes: ${task.taskName}`,
            tag: `${task.id}-snooze`,
            data: task
          });
        }
      }
    });
  }

  stopTaskReminders() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  showMoodAlert(patientName: string) {
    this.showNotification('Mood Alert', {
      body: `Unusual mood pattern detected for ${patientName}. Please check in with them.`,
      tag: 'mood-alert',
      requireInteraction: true
    });
  }

  showEmergencyAlert(patientName: string, location?: string) {
    this.showNotification('EMERGENCY ALERT', {
      body: `${patientName} has activated emergency help${location ? ` at ${location}` : ''}`,
      tag: 'emergency-alert',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300]
    });
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = NotificationService.getInstance();
