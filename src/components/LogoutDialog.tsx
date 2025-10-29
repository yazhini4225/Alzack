import { useState } from 'react';
import { X } from 'lucide-react';

interface LogoutDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutDialog({ onConfirm, onCancel }: LogoutDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === 'confirm') {
      onConfirm();
    } else {
      setError('Please type "confirm" to logout');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3>Confirm Logout</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mb-4 text-muted-foreground">
          Are you sure you want to logout? You will need to sign in again to access your account.
        </p>

        <div className="mb-4">
          <label className="block mb-2">Type "confirm" to logout</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
            placeholder="confirm"
          />
          {error && (
            <p className="text-destructive text-sm mt-1">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
