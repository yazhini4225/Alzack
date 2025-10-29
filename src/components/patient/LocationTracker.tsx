import { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Switch } from '../ui/switch';
import { projectId } from '../../utils/supabase/info';

interface LocationTrackerProps {
  session: any;
}

export function LocationTracker({ session }: LocationTrackerProps) {
  const [enabled, setEnabled] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);
  const [address, setAddress] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setSupported(false);
      setError('Geolocation is not supported by your browser');
    }
  }, []);

  useEffect(() => {
    let watchId: number | null = null;

    if (enabled && supported) {
      // Start watching location
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setError('');
          updateLocationOnServer(latitude, longitude);
          reverseGeocode(latitude, longitude);
        },
        (err) => {
          setError(err.message);
          console.error('Location error:', err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled, supported]);

  const updateLocationOnServer = async (latitude: number, longitude: number) => {
    if (updating) return;
    
    setUpdating(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/location`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude,
            longitude,
            enabled: true
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating location on server:', errorData);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setUpdating(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    // Using OpenStreetMap's Nominatim API for reverse geocoding (free, no API key needed)
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
    }
  };

  const toggleLocationSharing = async (checked: boolean) => {
    if (!supported) return;

    if (checked) {
      // Request permission
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        
        if (permission.state === 'denied') {
          setError('Location permission denied. Please enable it in your browser settings.');
          return;
        }

        setEnabled(true);
      } catch (err) {
        // Fallback: just try to enable
        setEnabled(true);
      }
    } else {
      setEnabled(false);
      setLocation(null);
      setAddress('');
      
      // Update server to disable location sharing
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fb3b7dfe/location`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              latitude: 0,
              longitude: 0,
              enabled: false
            })
          }
        );
      } catch (error) {
        console.error('Error disabling location:', error);
      }
    }
  };

  const getCurrentLocation = () => {
    if (!supported) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setError('');
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setError(err.message);
      }
    );
  };

  if (!supported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Location services are not supported in your browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#fac5cd]/20 to-[#c5d2fa]/20 rounded-lg">
              <MapPin className="w-5 h-5 text-[#c5d2fa]" />
            </div>
            <div>
              <h3 className="font-medium">Location Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share your location with caregivers
              </p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={toggleLocationSharing} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {enabled && location && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-[#fac5cd]/10 to-[#c5d2fa]/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Location Active</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Latitude:</span>{' '}
                  <span className="font-mono">{location.latitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>{' '}
                  <span className="font-mono">{location.longitude.toFixed(6)}</span>
                </div>
                {address && (
                  <div>
                    <span className="text-muted-foreground">Address:</span>{' '}
                    <span>{address}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={getCurrentLocation}
              className="w-full py-2 px-4 bg-white border border-[#c5d2fa] rounded-lg hover:bg-[#c5d2fa]/10 transition-colors text-sm"
            >
              Refresh Location
            </button>
          </div>
        )}

        {enabled && !location && !error && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-[#c5d2fa] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground mt-2">Getting your location...</p>
          </div>
        )}

        {!enabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Enable location sharing to let your caregivers know where you are. Your location will update automatically.
            </p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-[#fac5cd]/10 to-[#c5d2fa]/10 border border-[#c5d2fa]/30 rounded-lg p-4">
        <h4 className="font-medium mb-2">Privacy & Safety</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✓ Your location is only shared when enabled</li>
          <li>✓ Only your linked caregivers can see your location</li>
          <li>✓ You can turn off sharing at any time</li>
          <li>✓ Location updates automatically every 30 seconds</li>
        </ul>
      </div>
    </div>
  );
}
