import { useState, useEffect } from 'react';
import { X, Heart, Pill, Phone, User } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';

interface HealthInfoModalProps {
  user: any;
  session: any;
  onClose: () => void;
}

export function HealthInfoModal({ user, session, onClose }: HealthInfoModalProps) {
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthInfo();
  }, []);

  const fetchHealthInfo = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/health-info`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHealthInfo(data.healthInfo);
      }
    } catch (error) {
      console.error('Error fetching health info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0">Health Information</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : healthInfo ? (
          <div className="space-y-6">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#c5d2fa]" />
                <h3 className="m-0">Personal Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground m-0">Name</p>
                  <p className="m-0">{healthInfo.personalInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground m-0">Age</p>
                  <p className="m-0">{healthInfo.personalInfo.age}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground m-0">Gender</p>
                  <p className="m-0">{healthInfo.personalInfo.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground m-0">Blood Group</p>
                  <p className="m-0">{healthInfo.personalInfo.bloodGroup}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-[#c5d2fa]" />
                <h3 className="m-0">Medical Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground m-0">Health Condition</p>
                  <p className="m-0">{healthInfo.medicalInfo.healthCondition}</p>
                </div>
                {healthInfo.medicalInfo.medications && (
                  <div>
                    <p className="text-sm text-muted-foreground m-0">Medications</p>
                    <p className="m-0">{healthInfo.medicalInfo.medications}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground m-0">Physician</p>
                  <p className="m-0">{healthInfo.medicalInfo.physicianName}</p>
                  {healthInfo.medicalInfo.physicianContact && (
                    <p className="text-sm text-muted-foreground m-0">
                      {healthInfo.medicalInfo.physicianContact}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-[#c5d2fa]" />
                <h3 className="m-0">Emergency Contacts</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground m-0">Emergency Contact</p>
                  <p className="m-0">{healthInfo.emergencyContacts.emergency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground m-0">Phone Number</p>
                  <p className="m-0">{healthInfo.emergencyContacts.phoneNumber}</p>
                </div>
                {healthInfo.emergencyContacts.caregivers && healthInfo.emergencyContacts.caregivers.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 m-0">Caregivers</p>
                    {healthInfo.emergencyContacts.caregivers.map((cg: any, index: number) => (
                      <div key={index} className="mb-2 p-2 bg-muted/50 rounded">
                        <p className="m-0">{cg.name} ({cg.relationship})</p>
                        <p className="text-sm text-muted-foreground m-0">{cg.phoneNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#c5d2fa]" />
                <h3 className="m-0">IDs</h3>
              </div>
              <div>
                <p className="text-sm text-muted-foreground m-0">Patient ID</p>
                <p className="m-0 font-mono">{healthInfo.ids.patientId}</p>
                <p className="text-xs text-muted-foreground m-0 mt-1">
                  Share this ID with caregivers to link accounts
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No health information available
          </div>
        )}
      </div>
    </div>
  );
}
