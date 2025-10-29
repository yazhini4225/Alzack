import { useState, useEffect } from 'react';
import { Users, Activity, AlertTriangle, MapPin, Heart, Calendar, TrendingUp } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { LogoutDialog } from './LogoutDialog';
import { PatientLocationMap } from './caregiver/PatientLocationMap';
import { NotificationBell } from './caregiver/NotificationBell';

interface CaregiverDashboardProps {
  user: any;
  session: any;
  onLogout: () => void;
}

export function CaregiverDashboard({ user, session, onLogout }: CaregiverDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/caregiver/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        if (data.patients.length > 0 && !selectedPatient) {
          setSelectedPatient(data.patients[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      'Happy': 'text-green-500',
      'Neutral': 'text-yellow-500',
      'Sad': 'text-blue-500',
      'Anxious': 'text-purple-500',
      'Confused': 'text-orange-500',
      'Angry': 'text-red-500'
    };
    return moodColors[mood] || 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#fac5cd] border-t-[#c5d2fa] rounded-full animate-spin"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="m-0">Caregiver Dashboard</h1>
              <p className="text-white/90 m-0">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {dashboardData && dashboardData.alerts && (
                <NotificationBell alerts={dashboardData.alerts} />
              )}
              <button
                onClick={() => setShowLogout(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!dashboardData || dashboardData.patients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="mb-2">No Patients Linked</h2>
            <p className="text-muted-foreground">
              You haven't been linked to any patients yet. Ask your patient for their Patient ID to link accounts.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar - Patient Selection */}
            <div className="lg:col-span-1">
              <div className="border border-border rounded-lg p-4">
                <h3 className="mb-4">Your Patients</h3>
                <div className="space-y-2">
                  {dashboardData.patients.map((patient: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedPatient === patient
                          ? 'bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white'
                          : 'border border-border hover:bg-muted'
                      }`}
                    >
                      <p className={`m-0 ${selectedPatient === patient ? 'text-white' : ''}`}>
                        {patient.patientInfo.name}
                      </p>
                      <p className={`text-sm m-0 ${
                        selectedPatient === patient ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {patient.patientInfo.healthCondition}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Alerts */}
                {dashboardData.alerts && dashboardData.alerts.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <h3 className="m-0">Alerts</h3>
                    </div>
                    <div className="space-y-2">
                      {dashboardData.alerts.slice(0, 5).map((alert: any) => (
                        <div key={alert.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm m-0">{alert.message}</p>
                          <p className="text-xs text-muted-foreground m-0 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {selectedPatient && (
                <>
                  {/* Patient Overview */}
                  <div className="border border-border rounded-lg p-6">
                    <h2 className="mb-4">{selectedPatient.patientInfo.name}'s Overview</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground m-0">Age</p>
                        <p className="m-0">{selectedPatient.patientInfo.age}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground m-0">Condition</p>
                        <p className="m-0">{selectedPatient.patientInfo.healthCondition}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground m-0">Blood Group</p>
                        <p className="m-0">{selectedPatient.patientInfo.bloodGroup}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground m-0">Patient ID</p>
                        <p className="m-0 font-mono text-sm">{selectedPatient.patientInfo.patientId}</p>
                      </div>
                    </div>

                    {selectedPatient.location && (
                      <PatientLocationMap
                        location={selectedPatient.location}
                        patientName={selectedPatient.patientInfo.name}
                      />
                    )}
                  </div>

                  {/* Daily Routines */}
                  <div className="border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-[#c5d2fa]" />
                      <h3 className="m-0">Daily Routines</h3>
                    </div>
                    
                    {selectedPatient.routines.length === 0 ? (
                      <p className="text-muted-foreground m-0">No routines set</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPatient.routines.map((task: any) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border ${
                              task.completed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-border'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className={`m-0 ${task.completed ? 'line-through' : ''}`}>
                                  {task.taskName}
                                </p>
                                <p className="text-sm text-muted-foreground m-0">{task.time}</p>
                              </div>
                              {task.completed && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mood Tracker */}
                  <div className="border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-[#fac5cd]" />
                      <h3 className="m-0">Recent Mood Patterns</h3>
                    </div>
                    
                    {selectedPatient.recentMood.length === 0 ? (
                      <p className="text-muted-foreground m-0">No mood entries yet</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPatient.recentMood.slice().reverse().map((mood: any) => (
                          <div key={mood.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className={`${getMoodColor(mood.mood)}`}>
                                {mood.mood}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(mood.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {mood.notes && (
                              <p className="text-sm text-muted-foreground m-0 mt-1">{mood.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Dialog */}
      {showLogout && (
        <LogoutDialog
          onConfirm={onLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}
