import { useState } from 'react';
import { PatientLogin } from './auth/PatientLogin';
import { PatientSignup } from './auth/PatientSignup';
import { CaregiverLogin } from './auth/CaregiverLogin';
import { CaregiverSignup } from './auth/CaregiverSignup';

interface AuthScreenProps {
  supabase: any;
}

export function AuthScreen({ supabase }: AuthScreenProps) {
  const [mode, setMode] = useState<'select' | 'patient-login' | 'patient-signup' | 'caregiver-login' | 'caregiver-signup'>('select');

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="mb-4 bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] bg-clip-text text-transparent">
              Welcome to Alzack
            </h1>
            <p className="text-muted-foreground">
              Your companion for Alzheimer's care and support
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
              <h2 className="mb-4 text-center">Patient</h2>
              <p className="text-center text-muted-foreground mb-6">
                Access your personalized care tools
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setMode('patient-login')}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
                >
                  Login
                </button>
                <button
                  onClick={() => setMode('patient-signup')}
                  className="w-full py-3 px-6 rounded-lg border-2 border-[#fac5cd] hover:bg-[#fac5cd]/10 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div className="border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
              <h2 className="mb-4 text-center">Caregiver</h2>
              <p className="text-center text-muted-foreground mb-6">
                Monitor and support your loved ones
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setMode('caregiver-login')}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
                >
                  Login
                </button>
                <button
                  onClick={() => setMode('caregiver-signup')}
                  className="w-full py-3 px-6 rounded-lg border-2 border-[#c5d2fa] hover:bg-[#c5d2fa]/10 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => setMode('select')}
          className="mb-6 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        
        {mode === 'patient-login' && <PatientLogin supabase={supabase} />}
        {mode === 'patient-signup' && <PatientSignup supabase={supabase} />}
        {mode === 'caregiver-login' && <CaregiverLogin supabase={supabase} />}
        {mode === 'caregiver-signup' && <CaregiverSignup supabase={supabase} />}
      </div>
    </div>
  );
}
