'use client';

import { LetterState } from '@/lib/game';

interface KeyboardProps {
  letterStates: Map<string, LetterState>;
  onKey: (key: string) => void;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

function getKeyColor(letter: string, states: Map<string, LetterState>): string {
  const state = states.get(letter);

  switch (state) {
    case 'correct':
      return 'bg-green-500 text-white hover:bg-green-600';
    case 'present':
      return 'bg-yellow-500 text-white hover:bg-yellow-600';
    case 'absent':
      return 'bg-gray-500 text-white hover:bg-gray-600';
    default:
      return 'bg-gray-200 text-black hover:bg-gray-300';
  }
}

function Key({
  letter,
  states,
  onClick,
  disabled,
}: {
  letter: string;
  states: Map<string, LetterState>;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isWide = letter === 'ENTER' || letter === '⌫';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${isWide ? 'px-3 sm:px-4' : 'px-2 sm:px-3.5'}
        py-4 sm:py-5
        rounded
        font-bold
        text-sm sm:text-base
        transition-colors
        ${getKeyColor(letter, states)}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        select-none
      `}
    >
      {letter}
    </button>
  );
}

export function Keyboard({ letterStates, onKey, disabled }: KeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="flex gap-1.5">
          {row.map((letter) => (
            <Key
              key={letter}
              letter={letter}
              states={letterStates}
              onClick={() => onKey(letter)}
              disabled={disabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
