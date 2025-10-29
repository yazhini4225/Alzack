import { useState } from 'react';
import { Check } from 'lucide-react';

export function WordSearchGame() {
  const words = ['HAPPY', 'SMILE', 'LOVE', 'CARE', 'HOPE'];
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState('');

  const handleWordClick = (word: string) => {
    if (!foundWords.includes(word)) {
      setFoundWords([...foundWords, word]);
      setSelectedWord(word);
      setTimeout(() => setSelectedWord(''), 500);
    }
  };

  const isGameComplete = foundWords.length === words.length;

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="mb-2">Word Game</h2>
        <p className="text-muted-foreground">Find and tap the positive words!</p>
      </div>

      <div className="mb-6 p-6 border-2 border-border rounded-lg">
        <div className="grid grid-cols-5 gap-4">
          {words.map((word) => {
            const isFound = foundWords.includes(word);
            const isSelected = selectedWord === word;

            return (
              <button
                key={word}
                onClick={() => handleWordClick(word)}
                disabled={isFound}
                className={`p-4 rounded-lg transition-all ${
                  isFound
                    ? 'bg-gradient-to-r from-green-400 to-green-300 text-white'
                    : isSelected
                    ? 'bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white scale-105'
                    : 'bg-muted hover:bg-muted/80 hover:scale-105'
                }`}
              >
                {isFound && <Check className="w-5 h-5 mx-auto mb-1" />}
                <p className="m-0">{word}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3">Words to Find:</h3>
        <div className="flex flex-wrap gap-2">
          {words.map((word) => (
            <span
              key={word}
              className={`px-3 py-1 rounded-full ${
                foundWords.includes(word)
                  ? 'bg-green-100 text-green-700 line-through'
                  : 'bg-muted'
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {isGameComplete && (
        <div className="p-4 bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white rounded-lg text-center">
          <h3 className="text-white mb-2 m-0">Great Job! 🎉</h3>
          <p className="text-white m-0">You found all the words!</p>
        </div>
      )}
    </div>
  );
}
