import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface PatientChatProps {
  user: any;
  session: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function PatientChat({ user, session }: PatientChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${user.name}! I'm here to chat with you. I'm a friendly companion who's always ready to listen and help. Feel free to ask me anything or just tell me about your day!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response (in a real app, this would call an AI API)
    setTimeout(() => {
      const responses = [
        "That sounds wonderful! Tell me more about that.",
        "I understand. How does that make you feel?",
        "That's interesting! I'm here if you want to talk more about it.",
        "Thank you for sharing that with me. Is there anything else on your mind?",
        "I'm glad you told me about that. How has your day been otherwise?",
        "That's great to hear! What else would you like to talk about?",
        "I see. Remember, I'm always here to listen and help.",
        "That's quite something! Would you like to share anything else?",
        "Thank you for opening up to me. I'm here for you anytime."
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-12rem)] flex flex-col">
      <div className="mb-6">
        <h2 className="m-0">Chat with Your Companion</h2>
        <p className="text-muted-foreground m-0">I'm here to listen and help you anytime</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white'
                  : 'bg-muted'
              }`}
            >
              <p className="m-0 whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-2 m-0 ${message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5d2fa] bg-white"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
