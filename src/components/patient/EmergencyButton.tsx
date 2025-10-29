import { useState } from 'react';
import { AlertCircle, X, Phone, Heart } from 'lucide-react';

interface EmergencyButtonProps {
  user: any;
}

export function EmergencyButton({ user }: EmergencyButtonProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [showCalming, setShowCalming] = useState(false);

  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', type: 'emergency' },
    { name: 'Emergency Contact', number: user.emergencyContact, type: 'personal' },
    { name: user.physicianName || 'Physician', number: user.physicianContact || 'Not provided', type: 'doctor' }
  ];

  const calmingExercises = [
    {
      title: 'Deep Breathing',
      steps: [
        'Breathe in slowly through your nose for 4 counts',
        'Hold your breath for 4 counts',
        'Breathe out slowly through your mouth for 4 counts',
        'Repeat 5 times'
      ]
    },
    {
      title: '5-4-3-2-1 Grounding',
      steps: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ]
    },
    {
      title: 'Progressive Relaxation',
      steps: [
        'Tense your shoulders for 5 seconds, then release',
        'Tense your arms for 5 seconds, then release',
        'Tense your legs for 5 seconds, then release',
        'Take a deep breath and relax your whole body'
      ]
    }
  ];

  if (showCalming) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="m-0">Calming Exercises</h2>
            <button
              onClick={() => setShowCalming(false)}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {calmingExercises.map((exercise, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-[#fac5cd]" />
                  <h3 className="m-0">{exercise.title}</h3>
                </div>
                <ol className="space-y-2 ml-4">
                  {exercise.steps.map((step, i) => (
                    <li key={i} className="text-muted-foreground">{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowCalming(false)}
            className="w-full mt-6 px-4 py-3 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showPanel) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="m-0">I'm Here to Help You</h2>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                setShowPanel(false);
                setShowCalming(true);
              }}
              className="w-full p-4 border-2 border-[#c5d2fa] rounded-lg hover:bg-[#c5d2fa]/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-[#fac5cd]" />
                <div>
                  <h4 className="m-0">Calming Exercises</h4>
                  <p className="text-sm text-muted-foreground m-0">
                    Breathing and relaxation techniques
                  </p>
                </div>
              </div>
            </button>

            <div className="pt-4 border-t border-border">
              <h4 className="mb-3">Emergency Contacts</h4>
              <div className="space-y-2">
                {emergencyContacts.map((contact, index) => (
                  <a
                    key={index}
                    href={`tel:${contact.number}`}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="m-0">{contact.name}</p>
                      <p className="text-sm text-muted-foreground m-0">{contact.number}</p>
                    </div>
                    <Phone className="w-5 h-5 text-[#c5d2fa]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowPanel(true)}
      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
    >
      <AlertCircle className="w-5 h-5" />
      <span className="hidden sm:inline">I'm Here to Help You</span>
    </button>
  );
}
