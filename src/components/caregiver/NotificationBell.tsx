import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { notificationService } from '../../utils/notificationService';

interface NotificationBellProps {
  alerts: any[];
  onClearAlert?: (alertId: string) => void;
}

export function NotificationBell({ alerts, onClearAlert }: NotificationBellProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Request notification permission for caregivers
    if (notificationService.isSupported()) {
      notificationService.requestPermission().then(granted => {
        setHasPermission(granted);
      });
    }
  }, []);

  useEffect(() => {
    // Show browser notifications for new alerts
    if (hasPermission && alerts.length > 0) {
      const latestAlert = alerts[0];
      
      if (latestAlert.type === 'mood') {
        notificationService.showMoodAlert(latestAlert.patientName || 'Patient');
      } else if (latestAlert.type === 'emergency') {
        notificationService.showEmergencyAlert(latestAlert.patientName || 'Patient');
      }
    }
  }, [alerts, hasPermission]);

  const unreadCount = alerts.filter((a: any) => !a.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-border z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-border">
              <h3 className="m-0 text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground m-0">
                {unreadCount} unread
              </p>
            </div>

            {alerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm m-0">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !alert.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="m-0 text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground m-0 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {onClearAlert && (
                        <button
                          onClick={() => onClearAlert(alert.id)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!hasPermission && (
              <div className="p-4 border-t border-border bg-yellow-50">
                <p className="text-sm text-yellow-800 m-0">
                  Enable browser notifications to receive alerts even when the app is in the background.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
