import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Heart } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { AddMemoryDialog } from './AddMemoryDialog';

interface MemoryBookProps {
  user: any;
  session: any;
}

export function MemoryBook({ user, session }: MemoryBookProps) {
  const [memories, setMemories] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingMemory, setEditingMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/memory-book`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMemories(data.memoryBook.entries || []);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memoryId: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/memory-book/${memoryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (response.ok) {
        fetchMemories();
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2">Memory Book</h1>
        <p className="text-muted-foreground">
          Photos, names, and stories about your loved ones
        </p>
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-4 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
      >
        <Plus className="w-5 h-5" />
        Add Memory
      </button>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading memories...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No memories yet. Start adding people and moments you cherish!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMemory(memory)}
            >
              {memory.image && (
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={memory.image}
                    alt={memory.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!memory.image && (
                <div className="aspect-video bg-gradient-to-br from-[#fac5cd] to-[#c5d2fa] flex items-center justify-center">
                  <Heart className="w-12 h-12 text-white opacity-50" />
                </div>
              )}
              <div className="p-4">
                <h3 className="m-0 mb-1">{memory.name}</h3>
                <p className="text-sm text-muted-foreground m-0 mb-2">{memory.relationship}</p>
                {memory.story && (
                  <p className="text-sm m-0 line-clamp-3">{memory.story}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMemory(memory);
                      setShowAdd(true);
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(memory.id);
                    }}
                    className="flex-1 px-3 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddMemoryDialog
          session={session}
          memory={editingMemory}
          onClose={() => {
            setShowAdd(false);
            setEditingMemory(null);
            fetchMemories();
          }}
        />
      )}

      {selectedMemory && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMemory(null)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            {selectedMemory.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={selectedMemory.image}
                  alt={selectedMemory.name}
                  className="w-full h-auto"
                />
              </div>
            )}
            <h2 className="mb-1">{selectedMemory.name}</h2>
            <p className="text-muted-foreground mb-4 m-0">{selectedMemory.relationship}</p>
            {selectedMemory.story && (
              <p className="whitespace-pre-wrap">{selectedMemory.story}</p>
            )}
            <button
              onClick={() => setSelectedMemory(null)}
              className="w-full mt-4 px-4 py-3 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
