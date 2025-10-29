import { useState } from 'react';
import { Home, MessageCircle, BookHeart, Gamepad2, Mic, MapPin } from 'lucide-react';
import { PatientHome } from './patient/PatientHome';
import { PatientChat } from './patient/PatientChat';
import { MemoryBook } from './patient/MemoryBook';
import { GamesSection } from './patient/GamesSection';
import { EmergencyButton } from './patient/EmergencyButton';
import { VoiceAssistant } from './patient/VoiceAssistant';
import { LocationTracker } from './patient/LocationTracker';
import { LogoutDialog } from './LogoutDialog';

interface PatientDashboardProps {
  user: any;
  session: any;
  onLogout: () => void;
}

export function PatientDashboard({ user, session, onLogout }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [showLogout, setShowLogout] = useState(false);

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'memory', icon: BookHeart, label: 'Memory' },
    { id: 'games', icon: Gamepad2, label: 'Games' },
    { id: 'voice', icon: Mic, label: 'Voice' },
    { id: 'location', icon: MapPin, label: 'Location' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="m-0">Alzack</h1>
          </div>
          <div className="flex items-center gap-4">
            <EmergencyButton user={user} />
            <button
              onClick={() => setShowLogout(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {activeTab === 'home' && <PatientHome user={user} session={session} />}
        {activeTab === 'chat' && <PatientChat user={user} session={session} />}
        {activeTab === 'memory' && <MemoryBook user={user} session={session} />}
        {activeTab === 'games' && <GamesSection user={user} />}
        {activeTab === 'voice' && (
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h2 className="mb-6">Voice Assistant</h2>
            <VoiceAssistant session={session} patientName={user.name} />
          </div>
        )}
        {activeTab === 'location' && (
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h2 className="mb-6">Location Sharing</h2>
            <LocationTracker session={session} />
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-6 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                    isActive
                      ? 'text-[#c5d2fa]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

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
