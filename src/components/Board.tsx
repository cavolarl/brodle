'use client';

import { GuessResult, LetterState } from '@/lib/game';

interface BoardProps {
  guesses: GuessResult[];
  currentGuess: string;
  maxGuesses: number;
}

function getTileColor(state: LetterState): string {
  switch (state) {
    case 'correct':
      return 'bg-green-500 border-green-500 text-white';
    case 'present':
      return 'bg-yellow-500 border-yellow-500 text-white';
    case 'absent':
      return 'bg-gray-500 border-gray-500 text-white';
    default:
      return 'bg-transparent border-gray-300';
  }
}

function Tile({ letter, state }: { letter: string; state: LetterState }) {
  return (
    <div
      className={`
        w-14 h-14 sm:w-16 sm:h-16
        border-2
        flex items-center justify-center
        text-2xl sm:text-3xl font-bold uppercase
        transition-all duration-300
        ${getTileColor(state)}
        ${letter && state === 'empty' ? 'border-gray-400 animate-pop' : ''}
      `}
    >
      {letter}
    </div>
  );
}

function Row({ guess, results }: { guess?: GuessResult; results?: null }) {
  if (guess) {
    return (
      <div className="flex gap-1.5">
        {guess.results.map((result, i) => (
          <Tile key={i} letter={result.letter} state={result.state} />
        ))}
      </div>
    );
  }

  // Empty row
  return (
    <div className="flex gap-1.5">
      {Array(5).fill(null).map((_, i) => (
        <Tile key={i} letter="" state="empty" />
      ))}
    </div>
  );
}

function CurrentRow({ guess }: { guess: string }) {
  const letters = guess.split('');
  return (
    <div className="flex gap-1.5">
      {Array(5).fill(null).map((_, i) => (
        <Tile key={i} letter={letters[i] || ''} state="empty" />
      ))}
    </div>
  );
}

export function Board({ guesses, currentGuess, maxGuesses }: BoardProps) {
  const emptyRows = maxGuesses - guesses.length - 1;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Completed guesses */}
      {guesses.map((guess, i) => (
        <Row key={i} guess={guess} />
      ))}

      {/* Current guess (if game not over) */}
      {guesses.length < maxGuesses && (
        <CurrentRow guess={currentGuess} />
      )}

      {/* Empty rows */}
      {Array(Math.max(0, emptyRows)).fill(null).map((_, i) => (
        <Row key={`empty-${i}`} />
      ))}
    </div>
  );
}
