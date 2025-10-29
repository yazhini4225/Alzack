import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';

interface AddMemoryDialogProps {
  session: any;
  memory?: any;
  onClose: () => void;
}

export function AddMemoryDialog({ session, memory, onClose }: AddMemoryDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    image: '',
    story: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (memory) {
      setFormData({
        name: memory.name || '',
        relationship: memory.relationship || '',
        image: memory.image || '',
        story: memory.story || ''
      });
    }
  }, [memory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = memory
        ? `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/memory-book/${memory.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/memory-book`;

      const response = await fetch(url, {
        method: memory ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save memory');
      }
    } catch (err) {
      console.error('Error saving memory:', err);
      setError('Failed to save memory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0">{memory ? 'Edit Memory' : 'Add New Memory'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
              placeholder="Person's name"
            />
          </div>

          <div>
            <label className="block mb-2">Relationship *</label>
            <input
              type="text"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
              placeholder="e.g., Daughter, Friend, Doctor"
            />
          </div>

          <div>
            <label className="block mb-2">Image URL (Optional)</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Paste an image URL or leave empty
            </p>
          </div>

          <div>
            <label className="block mb-2">Story / Memory (Optional)</label>
            <textarea
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              rows={6}
              placeholder="Share a special memory or story about this person..."
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Saving...' : memory ? 'Update Memory' : 'Add Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
