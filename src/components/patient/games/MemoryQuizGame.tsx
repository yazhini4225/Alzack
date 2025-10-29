import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface MemoryQuizGameProps {
  user: any;
}

export function MemoryQuizGame({ user }: MemoryQuizGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  const questions = [
    {
      question: "What is your name?",
      options: [user.name, "John Doe", "Jane Smith", "Bob Johnson"],
      correct: user.name
    },
    {
      question: "What is your blood group?",
      options: [user.bloodGroup, "A+", "B+", "O+"],
      correct: user.bloodGroup
    },
    {
      question: "What time of day is it good to take a walk?",
      options: ["Morning", "Midnight", "During a storm", "Never"],
      correct: "Morning"
    },
    {
      question: "Which activity is good for the brain?",
      options: ["Reading", "Staying isolated", "Skipping meals", "Not sleeping"],
      correct: "Reading"
    },
    {
      question: "What should you do if you feel confused?",
      options: ["Ask for help", "Hide it", "Get upset", "Give up"],
      correct: "Ask for help"
    }
  ];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    
    if (answer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      setAnsweredQuestions(answeredQuestions + 1);
      
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnsweredQuestions(0);
  };

  if (showResult) {
    const percentage = (score / questions.length) * 100;
    
    return (
      <div className="text-center">
        <h2 className="mb-4">Quiz Complete! 🎉</h2>
        <div className="mb-6 p-8 bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white rounded-lg">
          <p className="text-6xl mb-4 m-0">{score}/{questions.length}</p>
          <p className="text-2xl m-0">
            {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
          </p>
        </div>
        <button
          onClick={resetQuiz}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] text-white hover:opacity-90 transition-opacity"
        >
          Play Again
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="mb-2">Memory Lane Quiz</h2>
        <p className="text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#fac5cd] to-[#c5d2fa] transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6 p-6 border-2 border-border rounded-lg">
        <h3 className="text-center mb-6">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correct;
            const showFeedback = selectedAnswer !== null;

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  showFeedback
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : isSelected
                      ? 'border-red-500 bg-red-50'
                      : 'border-border'
                    : 'border-border hover:border-[#c5d2fa] hover:bg-[#c5d2fa]/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showFeedback && isCorrect && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-muted-foreground">
        <p className="m-0">Score: {score} / {answeredQuestions}</p>
      </div>
    </div>
  );
}
