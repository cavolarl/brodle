export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface LetterResult {
  letter: string;
  state: LetterState;
}

export interface GuessResult {
  guess: string;
  results: LetterResult[];
}

export interface GameState {
  guesses: GuessResult[];
  currentGuess: string;
  validWords: string[];
  targetWord: string;
  gameOver: boolean;
  won: boolean;
  maxGuesses: number;
}

// Evaluate a guess against a target word
export function evaluateGuess(guess: string, target: string): LetterResult[] {
  const results: LetterResult[] = [];
  const targetLetters = target.split('');
  const guessLetters = guess.split('');

  // Track which target letters have been matched
  const matched = new Array(5).fill(false);

  // First pass: mark correct letters (green)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      results[i] = { letter: guessLetters[i], state: 'correct' };
      matched[i] = true;
    }
  }

  // Second pass: mark present letters (yellow) and absent letters (gray)
  for (let i = 0; i < 5; i++) {
    if (results[i]) continue; // Skip already matched

    const letter = guessLetters[i];
    let found = false;

    for (let j = 0; j < 5; j++) {
      if (!matched[j] && targetLetters[j] === letter) {
        results[i] = { letter, state: 'present' };
        matched[j] = true;
        found = true;
        break;
      }
    }

    if (!found) {
      results[i] = { letter, state: 'absent' };
    }
  }

  return results;
}

// Check if a word is consistent with all previous guesses and their results
export function isWordConsistent(word: string, guesses: GuessResult[]): boolean {
  for (const { guess, results } of guesses) {
    const hypotheticalResults = evaluateGuess(guess, word);

    // Check if the results match
    for (let i = 0; i < 5; i++) {
      if (hypotheticalResults[i].state !== results[i].state) {
        return false;
      }
    }
  }
  return true;
}

// Filter the word pool to only include words consistent with all guesses
export function filterValidWords(allWords: string[], guesses: GuessResult[]): string[] {
  if (guesses.length === 0) return allWords;
  return allWords.filter(word => isWordConsistent(word, guesses));
}

// Pick a new random target word from valid words
export function pickNewTarget(validWords: string[]): string {
  if (validWords.length === 0) {
    throw new Error('No valid words remaining!');
  }
  return validWords[Math.floor(Math.random() * validWords.length)];
}

// Create initial game state
export function createInitialState(allWords: string[]): GameState {
  const targetWord = allWords[Math.floor(Math.random() * allWords.length)];
  return {
    guesses: [],
    currentGuess: '',
    validWords: allWords,
    targetWord,
    gameOver: false,
    won: false,
    maxGuesses: 6,
  };
}

// Process a guess and return the new game state
export function processGuess(state: GameState, guess: string): GameState {
  const upperGuess = guess.toUpperCase();

  // Evaluate the guess against current target
  const results = evaluateGuess(upperGuess, state.targetWord);
  const guessResult: GuessResult = { guess: upperGuess, results };

  const newGuesses = [...state.guesses, guessResult];

  // Check if the player won (all correct)
  const won = results.every(r => r.state === 'correct');

  if (won) {
    return {
      ...state,
      guesses: newGuesses,
      currentGuess: '',
      gameOver: true,
      won: true,
    };
  }

  // Filter remaining valid words based on all guesses
  const newValidWords = filterValidWords(state.validWords, newGuesses);

  // Check if game is over (no guesses left or no valid words)
  const gameOver = newGuesses.length >= state.maxGuesses || newValidWords.length === 0;

  // Pick a new target from remaining valid words (the sneaky part!)
  const newTarget = newValidWords.length > 0
    ? pickNewTarget(newValidWords)
    : state.targetWord;

  return {
    ...state,
    guesses: newGuesses,
    currentGuess: '',
    validWords: newValidWords,
    targetWord: newTarget,
    gameOver,
    won: false,
  };
}

// Get keyboard letter states based on all guesses
export function getKeyboardStates(guesses: GuessResult[]): Map<string, LetterState> {
  const states = new Map<string, LetterState>();

  for (const { results } of guesses) {
    for (const { letter, state } of results) {
      const current = states.get(letter);

      // Priority: correct > present > absent
      if (state === 'correct') {
        states.set(letter, 'correct');
      } else if (state === 'present' && current !== 'correct') {
        states.set(letter, 'present');
      } else if (state === 'absent' && !current) {
        states.set(letter, 'absent');
      }
    }
  }

  return states;
}
