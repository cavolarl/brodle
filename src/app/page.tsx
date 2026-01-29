'use client';

import { useCallback, useEffect, useState } from 'react';
import { Board } from '@/components/Board';
import { Keyboard } from '@/components/Keyboard';
import { WORDS } from '@/lib/words';
import {
  GameState,
  createInitialState,
  processGuess,
  getKeyboardStates,
} from '@/lib/game';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [message, setMessage] = useState<string>('');
  const [shake, setShake] = useState(false);

  // Initialize game on client side
  useEffect(() => {
    setGameState(createInitialState(WORDS));
  }, []);

  const showMessage = useCallback((msg: string, duration = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (!gameState || gameState.gameOver) return;

      if (key === '⌫' || key === 'BACKSPACE') {
        setGameState((prev) =>
          prev
            ? { ...prev, currentGuess: prev.currentGuess.slice(0, -1) }
            : prev
        );
        return;
      }

      if (key === 'ENTER') {
        if (gameState.currentGuess.length !== 5) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          showMessage('Not enough letters');
          return;
        }

        // Check if it's a valid word
        if (!WORDS.includes(gameState.currentGuess.toUpperCase())) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          showMessage('Not in word list');
          return;
        }

        const newState = processGuess(gameState, gameState.currentGuess);
        setGameState(newState);

        if (newState.won) {
          showMessage('Genius!', 5000);
        } else if (newState.gameOver) {
          showMessage(`The word was ${newState.targetWord}`, 5000);
        } else {
          // Show how many words remain
          showMessage(`${newState.validWords.length} possible words remain`);
        }
        return;
      }

      // Regular letter
      if (/^[A-Z]$/i.test(key) && gameState.currentGuess.length < 5) {
        setGameState((prev) =>
          prev
            ? { ...prev, currentGuess: prev.currentGuess + key.toUpperCase() }
            : prev
        );
      }
    },
    [gameState, showMessage]
  );

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Enter') {
        handleKey('ENTER');
      } else if (e.key === 'Backspace') {
        handleKey('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKey]);

  const resetGame = () => {
    setGameState(createInitialState(WORDS));
    setMessage('');
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const keyboardStates = getKeyboardStates(gameState.guesses);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 py-4">
        <div className="max-w-lg mx-auto px-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-wide">BRODLE</h1>
          <button
            onClick={resetGame}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            New Game
          </button>
        </div>
      </header>

      {/* Message */}
      <div className="h-8 flex items-center justify-center mt-4">
        {message && (
          <div className="bg-white text-black px-4 py-2 rounded font-bold text-sm animate-fade-in">
            {message}
          </div>
        )}
      </div>

      {/* Game area */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-4">
        <div className={shake ? 'animate-shake' : ''}>
          <Board
            guesses={gameState.guesses}
            currentGuess={gameState.currentGuess}
            maxGuesses={gameState.maxGuesses}
          />
        </div>

        {/* Stats */}
        <div className="text-center text-gray-400 text-sm">
          {!gameState.gameOver && (
            <p>{gameState.validWords.length} possible words</p>
          )}
        </div>

        <Keyboard
          letterStates={keyboardStates}
          onKey={handleKey}
          disabled={gameState.gameOver}
        />
      </main>

      {/* Game over modal */}
      {gameState.gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-2">
              {gameState.won ? '🎉 You Won!' : '😔 Game Over'}
            </h2>
            <p className="text-gray-300 mb-4">
              {gameState.won
                ? `You got it in ${gameState.guesses.length} ${gameState.guesses.length === 1 ? 'try' : 'tries'}!`
                : `The word was ${gameState.targetWord}`}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {gameState.validWords.length} word{gameState.validWords.length !== 1 ? 's' : ''} remained possible
            </p>
            <button
              onClick={resetGame}
              className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded font-bold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
