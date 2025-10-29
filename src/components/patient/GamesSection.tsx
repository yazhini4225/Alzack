import { useState } from 'react';
import { Brain, Heart, Puzzle, Grid3x3, Image, Type, ArrowLeft } from 'lucide-react';
import { MatchingPairsGame } from './games/MatchingPairsGame';
import { WordSearchGame } from './games/WordSearchGame';
import { MemoryQuizGame } from './games/MemoryQuizGame';

interface GamesSectionProps {
  user: any;
}

export function GamesSection({ user }: GamesSectionProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const cognitiveGames = [
    {
      id: 'matching-pairs',
      title: 'Matching Pairs',
      description: 'Find matching pairs of cards',
      icon: Grid3x3,
      color: 'from-pink-400 to-pink-300'
    },
    {
      id: 'word-search',
      title: 'Word Game',
      description: 'Find words in the puzzle',
      icon: Type,
      color: 'from-purple-400 to-purple-300'
    },
    {
      id: 'spot-difference',
      title: 'Spot the Difference',
      description: 'Coming soon!',
      icon: Image,
      color: 'from-blue-400 to-blue-300',
      disabled: true
    }
  ];

  const memoryGames = [
    {
      id: 'memory-quiz',
      title: 'Memory Lane Quiz',
      description: 'Answer questions about your memories',
      icon: Heart,
      color: 'from-red-400 to-red-300'
    },
    {
      id: 'routine-puzzle',
      title: 'Routine Puzzle',
      description: 'Coming soon!',
      icon: Puzzle,
      color: 'from-green-400 to-green-300',
      disabled: true
    }
  ];

  if (activeGame === 'matching-pairs') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => setActiveGame(null)}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Games
        </button>
        <MatchingPairsGame />
      </div>
    );
  }

  if (activeGame === 'word-search') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => setActiveGame(null)}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Games
        </button>
        <WordSearchGame />
      </div>
    );
  }

  if (activeGame === 'memory-quiz') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => setActiveGame(null)}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Games
        </button>
        <MemoryQuizGame user={user} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2">Brain Games</h1>
        <p className="text-muted-foreground">
          Fun activities to keep your mind sharp and engaged
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-[#c5d2fa]" />
          <h2 className="m-0">Cognitive Games</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Games to improve memory, focus, and cognitive skills
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cognitiveGames.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => !game.disabled && setActiveGame(game.id)}
                disabled={game.disabled}
                className={`p-6 rounded-lg bg-gradient-to-br ${game.color} text-white hover:opacity-90 transition-opacity text-left disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Icon className="w-12 h-12 mb-3" />
                <h3 className="text-white mb-1 m-0">{game.title}</h3>
                <p className="text-white/90 text-sm m-0">{game.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-[#fac5cd]" />
          <h2 className="m-0">Memory Games</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Games based on your personal memories and experiences
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {memoryGames.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => !game.disabled && setActiveGame(game.id)}
                disabled={game.disabled}
                className={`p-6 rounded-lg bg-gradient-to-br ${game.color} text-white hover:opacity-90 transition-opacity text-left disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Icon className="w-12 h-12 mb-3" />
                <h3 className="text-white mb-1 m-0">{game.title}</h3>
                <p className="text-white/90 text-sm m-0">{game.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
