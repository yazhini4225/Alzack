import { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface PatientLocationMapProps {
  location: {
    latitude: number;
    longitude: number;
    enabled: boolean;
    lastUpdated: string;
  };
  patientName: string;
}

export function PatientLocationMap({ location, patientName }: PatientLocationMapProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      reverseGeocode(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Alzack-App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const openInAppleMaps = () => {
    const url = `https://maps.apple.com/?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  if (!location.enabled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800 m-0">
            {patientName} has not enabled location sharing.
          </p>
        </div>
      </div>
    );
  }

  // Create static map URL using OpenStreetMap
  const mapImageUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01},${location.latitude - 0.01},${location.longitude + 0.01},${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#fac5cd]/10 to-[#c5d2fa]/10 border border-[#c5d2fa]/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-5 h-5 text-green-600" />
          <h4 className="m-0">Live Location</h4>
        </div>

        {/* Map Frame */}
        <div className="bg-white rounded-lg overflow-hidden border border-border mb-4">
          <iframe
            width="100%"
            height="300"
            frameBorder="0"
            scrolling="no"
            src={mapImageUrl}
            style={{ border: 0 }}
            title={`${patientName}'s location`}
          />
        </div>

        {/* Location Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground m-0">Coordinates</p>
              <p className="font-mono text-sm m-0">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openInGoogleMaps}
                className="p-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors"
                title="Open in Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-[#c5d2fa] border-t-transparent rounded-full animate-spin"></div>
              Getting address...
            </div>
          ) : address ? (
            <div>
              <p className="text-sm text-muted-foreground m-0">Address</p>
              <p className="text-sm m-0">{address}</p>
            </div>
          ) : null}

          <div>
            <p className="text-sm text-muted-foreground m-0">Last Updated</p>
            <p className="text-sm m-0">{new Date(location.lastUpdated).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800 m-0">
          <strong>Note:</strong> Location updates automatically every 30 seconds when enabled by the patient.
        </p>
      </div>
    </div>
  );
}
