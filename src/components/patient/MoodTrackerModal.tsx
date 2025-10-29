import { useState, useEffect } from 'react';
import { X, Smile, Frown, Meh, Angry, Heart } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';

interface MoodTrackerModalProps {
  user: any;
  session: any;
  onClose: () => void;
}

export function MoodTrackerModal({ user, session, onClose }: MoodTrackerModalProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const moods = [
    { value: 'Happy', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
    { value: 'Neutral', icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { value: 'Sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: 'Anxious', icon: Heart, color: 'text-purple-500', bg: 'bg-purple-50' },
    { value: 'Confused', icon: Meh, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: 'Angry', icon: Angry, color: 'text-red-500', bg: 'bg-red-50' }
  ];

  useEffect(() => {
    fetchMood();
  }, []);

  const fetchMood = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/mood`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEntries(data.moodTracker.entries || []);
      }
    } catch (error) {
      console.error('Error fetching mood:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/mood`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mood: selectedMood,
            source: 'manual',
            notes
          })
        }
      );

      if (response.ok) {
        setSelectedMood('');
        setNotes('');
        setShowAdd(false);
        fetchMood();
      }
    } catch (error) {
      console.error('Error adding mood entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodIcon = (moodValue: string) => {
    const mood = moods.find(m => m.value === moodValue);
    return mood || moods[1];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0">Mood Tracker</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full mb-6 px-4 py-3 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
          >
            Track My Mood
          </button>
        )}

        {showAdd && (
          <div className="mb-6 p-4 border-2 border-[#c5d2fa] rounded-lg">
            <h3 className="mb-4">How are you feeling?</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {moods.map((mood) => {
                const Icon = mood.icon;
                return (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMood === mood.value
                        ? `${mood.bg} border-current ${mood.color}`
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${selectedMood === mood.value ? mood.color : ''}`} />
                    <p className="text-sm m-0">{mood.value}</p>
                  </button>
                );
              })}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white mb-3"
              rows={3}
              placeholder="Any notes about how you're feeling? (optional)"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAdd(false);
                  setSelectedMood('');
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedMood || submitting}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Mood'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No mood entries yet. Start tracking how you feel!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="mb-3">Recent Moods</h3>
            {entries.slice().reverse().slice(0, 10).map((entry) => {
              const moodInfo = getMoodIcon(entry.mood);
              const Icon = moodInfo.icon;
              return (
                <div key={entry.id} className={`p-4 rounded-lg border ${moodInfo.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${moodInfo.color}`} />
                      <span>{entry.mood}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground m-0">{entry.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
