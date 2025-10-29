import { useState, useEffect } from 'react';
import { X, Plus, BookOpen } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';

interface JournalModalProps {
  user: any;
  session: any;
  onClose: () => void;
}

export function JournalModal({ user, session, onClose }: JournalModalProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJournal();
  }, []);

  const fetchJournal = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/journal`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEntries(data.journal.entries || []);
      }
    } catch (error) {
      console.error('Error fetching journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/journal`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        }
      );

      if (response.ok) {
        setContent('');
        setShowAdd(false);
        fetchJournal();
      }
    } catch (error) {
      console.error('Error adding journal entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0">My Journal</h2>
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
            className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        )}

        {showAdd && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border-2 border-[#c5d2fa] rounded-lg">
            <h3 className="mb-3">Write Your Thoughts</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white mb-3"
              rows={6}
              placeholder="What happened today? How are you feeling?"
              required
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setContent('');
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No journal entries yet. Start writing your first entry!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.slice().reverse().map((entry) => (
              <div key={entry.id} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                <p className="text-sm text-muted-foreground mb-2 m-0">
                  {formatDate(entry.createdAt)}
                </p>
                <p className="whitespace-pre-wrap m-0">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
