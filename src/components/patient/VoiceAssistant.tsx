import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';

interface VoiceAssistantProps {
  session: any;
  patientName: string;
}

export function VoiceAssistant({ session, patientName }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          
          // Check for wake word "Hey Alzack" or "Alzack"
          const lowerTranscript = finalTranscript.toLowerCase();
          if (lowerTranscript.includes('hey alzack') || lowerTranscript.includes('alzack')) {
            setIsActive(true);
            handleCommand(finalTranscript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart if no speech detected
          if (isListening) {
            recognition.start();
          }
        }
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();
    let responseText = '';

    // Remove wake words
    const cleanCommand = lowerCommand
      .replace('hey alzack', '')
      .replace('alzack', '')
      .trim();

    // Command processing
    if (cleanCommand.includes('time') || cleanCommand.includes('what time')) {
      const now = new Date();
      responseText = `It's ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (cleanCommand.includes('date') || cleanCommand.includes('what day')) {
      const now = new Date();
      responseText = `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
    } else if (cleanCommand.includes('how are you')) {
      responseText = `I'm doing great, ${patientName}! How can I help you today?`;
    } else if (cleanCommand.includes('hello') || cleanCommand.includes('hi')) {
      responseText = `Hello ${patientName}! I'm here to help you. What do you need?`;
    } else if (cleanCommand.includes('remind') || cleanCommand.includes('task')) {
      responseText = 'You can check your daily tasks on the home page. Would you like me to read them to you?';
    } else if (cleanCommand.includes('memory') || cleanCommand.includes('remember')) {
      responseText = 'Your memory book contains photos and stories of your loved ones. You can access it from the main menu.';
    } else if (cleanCommand.includes('help')) {
      responseText = `I can help you with time, date, reminders, and general questions. Just say "Hey Alzack" followed by your question.`;
    } else if (cleanCommand.includes('emergency')) {
      responseText = 'Activating emergency help. Please press the emergency button on your screen for assistance.';
    } else if (cleanCommand.includes('mood') || cleanCommand.includes('feel')) {
      responseText = 'How are you feeling today? You can track your mood using the mood tracker in the menu.';
    } else if (cleanCommand.includes('game') || cleanCommand.includes('play')) {
      responseText = 'I have several games to help keep your mind sharp! Check out the games section.';
    } else if (cleanCommand === '' || cleanCommand === ' ') {
      responseText = `Yes, ${patientName}? How can I help you?`;
    } else {
      responseText = `I heard you say "${cleanCommand}". I'm still learning, but I can help with time, date, reminders, and general questions!`;
    }

    setResponse(responseText);
    speak(responseText);

    // Auto-deactivate after response
    setTimeout(() => {
      setIsActive(false);
      setTranscript('');
    }, 5000);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsActive(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  if (!supported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Voice assistant is not supported in your browser. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#fac5cd]/10 to-[#c5d2fa]/10 rounded-lg p-4 border border-[#c5d2fa]/30">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleListening}
            className={`p-4 rounded-full transition-all ${
              isListening
                ? 'bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white shadow-lg'
                : 'bg-white border-2 border-[#c5d2fa] hover:bg-[#c5d2fa]/10'
            }`}
          >
            {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          <div>
            <p className="font-medium">
              {isListening ? 'Voice Assistant Active' : 'Voice Assistant Inactive'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isListening ? 'Say "Hey Alzack" to activate' : 'Click to start listening'}
            </p>
          </div>
        </div>
        {isActive && (
          <div className="flex items-center gap-2 text-green-600">
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span className="text-sm">Active</span>
          </div>
        )}
      </div>

      {transcript && (
        <div className="bg-white rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">You said:</p>
          <p className="text-foreground">{transcript}</p>
        </div>
      )}

      {response && (
        <div className="bg-gradient-to-r from-[#fac5cd]/20 to-[#c5d2fa]/20 rounded-lg p-4 border border-[#c5d2fa]/30">
          <p className="text-sm text-muted-foreground mb-1">Alzack says:</p>
          <p className="text-foreground">{response}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm mb-2">
          <strong>Try saying:</strong>
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• "Hey Alzack, what time is it?"</li>
          <li>• "Hey Alzack, what's the date?"</li>
          <li>• "Hey Alzack, remind me about my tasks"</li>
          <li>• "Hey Alzack, help"</li>
        </ul>
      </div>
    </div>
  );
}
