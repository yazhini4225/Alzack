import { useState } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface PatientSignupProps {
  supabase: any;
}

export function PatientSignup({ supabase }: PatientSignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    caregiverId: '',
    phoneNumber: '',
    healthCondition: 'Stage 1 (Mild)',
    physicianName: '',
    physicianContact: '',
    medications: '',
    emergencyContact: '',
    bloodGroup: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/signup/patient`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            age: parseInt(formData.age),
            gender: formData.gender,
            email: formData.email,
            password: formData.password,
            caregiverId: formData.caregiverId || null,
            phoneNumber: formData.phoneNumber,
            healthCondition: formData.healthCondition,
            physicianName: formData.physicianName,
            physicianContact: formData.physicianContact || null,
            medications: formData.medications || null,
            emergencyContact: formData.emergencyContact,
            bloodGroup: formData.bloodGroup
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Now log in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        setError('Account created but login failed. Please try logging in manually.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="mb-2">Patient Sign Up</h2>
        <p className="text-muted-foreground">Create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
              min="1"
              max="120"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Blood Group *</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block mb-2">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Emergency Contact *</label>
            <input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Health Condition *</label>
          <select
            name="healthCondition"
            value={formData.healthCondition}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
            required
          >
            <option value="Stage 1 (Mild)">Stage 1 (Mild)</option>
            <option value="Stage 2 (Moderate)">Stage 2 (Moderate)</option>
            <option value="Stage 3 (Severe)">Stage 3 (Severe)</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Physician Name *</label>
            <input
              type="text"
              name="physicianName"
              value={formData.physicianName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Physician Contact (Optional)</label>
            <input
              type="tel"
              name="physicianContact"
              value={formData.physicianContact}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Medications (Optional)</label>
          <textarea
            name="medications"
            value={formData.medications}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-2">Caregiver ID (Optional)</label>
          <input
            type="text"
            name="caregiverId"
            value={formData.caregiverId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
            placeholder="Enter if you have a caregiver ID"
          />
          <p className="text-sm text-muted-foreground mt-1">
            If your caregiver has already signed up, enter their ID to link accounts
          </p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
