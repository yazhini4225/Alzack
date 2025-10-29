import { useState, useEffect } from 'react';
import { Smile, Heart, Star, Sun, Moon, Cloud, Flower, Leaf } from 'lucide-react';

export function MatchingPairsGame() {
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const icons = [Smile, Heart, Star, Sun, Moon, Cloud, Flower, Leaf];

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].id === cards[second].id) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        
        if (matched.length + 2 === cards.length) {
          setIsWon(true);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
      setMoves(moves + 1);
    }
  }, [flipped]);

  const initializeGame = () => {
    const pairs = icons.map((Icon, index) => [
      { id: index, Icon },
      { id: index, Icon }
    ]).flat();

    const shuffled = pairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsWon(false);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }
    setFlipped([...flipped, index]);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="mb-2">Matching Pairs</h2>
        <p className="text-muted-foreground">Find all the matching pairs!</p>
        <p className="text-muted-foreground">Moves: {moves}</p>
      </div>

      {isWon && (
        <div className="mb-6 p-4 bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white rounded-lg text-center">
          <h3 className="text-white mb-2 m-0">Congratulations! 🎉</h3>
          <p className="text-white m-0">You completed the game in {moves} moves!</p>
          <button
            onClick={initializeGame}
            className="mt-4 px-6 py-2 bg-white text-foreground rounded-lg hover:bg-white/90 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.Icon;
          const isFlipped = flipped.includes(index) || matched.includes(index);
          const isMatched = matched.includes(index);

          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-lg transition-all transform ${
                isFlipped
                  ? isMatched
                    ? 'bg-gradient-to-r from-green-400 to-green-300'
                    : 'bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa]'
                  : 'bg-muted hover:bg-muted/80'
              } ${isFlipped ? 'scale-105' : ''}`}
              disabled={isFlipped && !isMatched}
            >
              {isFlipped ? (
                <Icon className="w-12 h-12 mx-auto text-white" />
              ) : (
                <div className="w-12 h-12 mx-auto flex items-center justify-center text-4xl">
                  ?
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={initializeGame}
        className="w-full mt-6 px-4 py-3 rounded-lg border-2 border-[#c5d2fa] hover:bg-[#c5d2fa]/10 transition-colors"
      >
        Reset Game
      </button>
    </div>
  );
}
