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

// Convert results array to a string key for grouping
function resultsToKey(results: LetterResult[]): string {
  return results.map(r => r.state[0]).join(''); // e.g., "acpaa" for absent/correct/present/absent/absent
}

// Find the most adversarial response - the feedback pattern that keeps the most words
export function findAdversarialResponse(
  guess: string,
  validWords: string[]
): { results: LetterResult[]; remainingWords: string[] } {
  // Group words by the feedback pattern they would produce
  const groups = new Map<string, { results: LetterResult[]; words: string[] }>();

  for (const word of validWords) {
    const results = evaluateGuess(guess, word);
    const key = resultsToKey(results);

    if (!groups.has(key)) {
      groups.set(key, { results, words: [] });
    }
    groups.get(key)!.words.push(word);
  }

  // Find the group with the most words (most adversarial choice)
  let bestGroup = { results: [] as LetterResult[], words: [] as string[] };
  for (const group of groups.values()) {
    if (group.words.length > bestGroup.words.length) {
      bestGroup = group;
    }
  }

  return { results: bestGroup.results, remainingWords: bestGroup.words };
}

// Create initial game state (EVIL VERSION - no fixed target)
export function createInitialState(allWords: string[]): GameState {
  return {
    guesses: [],
    currentGuess: '',
    validWords: allWords,
    targetWord: '', // No target until player wins
    gameOver: false,
    won: false,
    maxGuesses: Infinity, // No limit - play until you corner it
  };
}

// Process a guess and return the new game state (EVIL VERSION)
export function processGuess(state: GameState, guess: string): GameState {
  const upperGuess = guess.toUpperCase();

  // Find the most adversarial response - keeps the most words possible
  const { results, remainingWords } = findAdversarialResponse(upperGuess, state.validWords);
  const guessResult: GuessResult = { guess: upperGuess, results };

  const newGuesses = [...state.guesses, guessResult];

  // Check if the player won (narrowed down to 1 word and guessed it)
  const won = results.every(r => r.state === 'correct');

  if (won) {
    return {
      ...state,
      guesses: newGuesses,
      currentGuess: '',
      validWords: remainingWords,
      targetWord: remainingWords[0] || upperGuess,
      gameOver: true,
      won: true,
    };
  }

  // The "target" is now just representative - any word from remaining pool
  const newTarget = remainingWords[0] || state.targetWord;

  return {
    ...state,
    guesses: newGuesses,
    currentGuess: '',
    validWords: remainingWords,
    targetWord: newTarget,
    gameOver: false,
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
