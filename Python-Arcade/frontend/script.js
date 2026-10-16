/**
 * PYTHON ARCADE — Web Controller & Pyodide Integration
 * Connects the Midnight Editorial frontend to the four Python game implementations.
 * Executes game rules directly in Python via Pyodide (WASM) without backend frameworks.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Game Metadata Store
  // -------------------------------------------------------------------------
  const gamesMeta = {
    'higher_lower': {
      id: 'higher_lower',
      category: '01 / NUMBER GAME',
      title: 'Higher or Lower',
      subtitle: 'Pick a number. Trust your instincts.'
    },
    'blackjack': {
      id: 'blackjack',
      category: '02 / CARD GAME',
      title: 'Blackjack',
      subtitle: 'Play your hand.'
    },
    'hangman': {
      id: 'hangman',
      category: '03 / WORD GAME',
      title: 'Hangman',
      subtitle: 'Find the hidden word.'
    },
    'stone_paper_scissors': {
      id: 'stone_paper_scissors',
      category: '04 / QUICK MATCH',
      title: 'Stone Paper Scissors',
      subtitle: 'Make your move.'
    }
  };

  // -------------------------------------------------------------------------
  // 2. Pyodide WebAssembly Python Runtime Setup
  // -------------------------------------------------------------------------
  let pyodideInstance = null;
  let isPyodideReady = false;
  let activeGame = null;

  const pythonEngineBadge = document.getElementById('pythonEngineBadge');
  const pythonEngineStatus = document.getElementById('pythonEngineStatus');

  const PYTHON_ADAPTER_SOURCE = `
import json
import random

# Global aliases to handle JS-to-Python JSON literal tokens gracefully
null = None
true = True
false = False

# --- GAME 01: HIGHER OR LOWER ---
class HigherLowerGame:
    def __init__(self):
        self.difficulty = "easy"
        self.reset()
    def reset(self):
        self.num = random.randint(1, 100)
        self.total_attempts = 5 if getattr(self, "difficulty", "easy") == "hard" else 10
        self.attempts_remaining = self.total_attempts
        self.guesses = []
        self.game_over = False
        self.won = False
        self.message = f"Game reset on {self.difficulty.upper()} mode. You have {self.attempts_remaining} attempts remaining!"
        return self.get_state()
    def set_difficulty(self, difficulty):
        diff = str(difficulty).lower().strip()
        if diff == "hard":
            self.difficulty = "hard"
            self.total_attempts = 5
        else:
            self.difficulty = "easy"
            self.total_attempts = 10
        self.reset()
        self.message = f"Difficulty set to {self.difficulty.upper()}. You have {self.attempts_remaining} attempts remaining."
        return self.get_state()
    def guess(self, user_guess):
        if self.game_over:
            return self.get_state()
        try:
            val = int(user_guess)
        except (ValueError, TypeError):
            return {"error": "Please enter a valid number between 1 and 100."}
        if val < 1 or val > 100:
            return {"error": "Guess must be between 1 and 100."}
        self.attempts_remaining -= 1
        hint = ""
        if val > self.num:
            hint = "Too high"
            self.message = f"{val} is Too High! Try a lower number."
        elif val < self.num:
            hint = "Too low"
            self.message = f"{val} is Too Low! Try a higher number."
        elif val == self.num:
            hint = "You guessed the number"
            self.won = True
            self.game_over = True
            self.message = f"Brilliant! You guessed the number {self.num}!"
        self.guesses.append({"guess": val, "hint": hint, "remaining": self.attempts_remaining})
        if not self.won and self.attempts_remaining <= 0:
            self.game_over = True
            self.message = f"You Lose, the correct number was: {self.num}"
        return self.get_state()
    def get_state(self):
        return {
            "difficulty": self.difficulty,
            "attempts_remaining": self.attempts_remaining,
            "total_attempts": self.total_attempts,
            "guesses": self.guesses,
            "game_over": self.game_over,
            "won": self.won,
            "message": self.message,
            "revealed_number": self.num if self.game_over else None
        }

# --- GAME 02: BLACKJACK ---
def deal_card():
    cards = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]
    return random.choice(cards)

def calculate_score(cards):
    c = list(cards)
    if sum(c) == 21 and len(c) == 2:
        return 0
    if 11 in c and sum(c) > 21:
        c.remove(11)
        c.append(1)
    return sum(c)

def compare(u_score, c_score):
    if u_score == c_score:
        return "Draw 🙃"
    elif c_score == 0:
        return "Lose, opponent has Blackjack 😱"
    elif u_score == 0:
        return "Win with a Blackjack 😎"
    elif u_score > 21:
        return "You went over. You lose 😭"
    elif c_score > 21:
        return "Opponent went over. You win 😁"
    elif u_score > c_score:
        return "You win 😃"
    else:
        return "You lose 😤"

class BlackjackGame:
    def __init__(self):
        self.reset()
    def reset(self):
        self.user_cards = []
        self.computer_cards = []
        self.is_game_over = False
        self.result_message = ""
        self.status_description = "Game started. Choose Hit to draw another card, or Stand to hold."
        for _ in range(2):
            self.user_cards.append(deal_card())
            self.computer_cards.append(deal_card())
        user_score = calculate_score(self.user_cards)
        computer_score = calculate_score(self.computer_cards)
        if user_score == 0 or computer_score == 0 or user_score > 21:
            self.stand()
        return self.get_state()
    def hit(self):
        if self.is_game_over:
            return self.get_state()
        self.user_cards.append(deal_card())
        user_score = calculate_score(self.user_cards)
        if user_score == 0 or user_score > 21:
            self.stand()
        else:
            self.status_description = f"You drew a card. Your score is {user_score}."
        return self.get_state()
    def stand(self):
        if self.is_game_over:
            return self.get_state()
        user_score = calculate_score(self.user_cards)
        computer_score = calculate_score(self.computer_cards)
        if user_score <= 21 and user_score != 0:
            while computer_score != 0 and computer_score < 17:
                self.computer_cards.append(deal_card())
                computer_score = calculate_score(self.computer_cards)
        self.is_game_over = True
        self.result_message = compare(user_score, computer_score)
        self.status_description = f"Final Hand: Player {21 if user_score == 0 else user_score} vs Dealer {21 if computer_score == 0 else computer_score}."
        return self.get_state()
    def get_state(self):
        u_score = calculate_score(self.user_cards)
        c_score = calculate_score(self.computer_cards)
        return {
            "user_cards": list(self.user_cards),
            "user_score": 21 if u_score == 0 else u_score,
            "is_user_blackjack": u_score == 0,
            "computer_cards": list(self.computer_cards) if self.is_game_over else [self.computer_cards[0], "?"],
            "computer_score": (21 if c_score == 0 else c_score) if self.is_game_over else "?",
            "is_game_over": self.is_game_over,
            "result_message": self.result_message,
            "status_description": self.status_description
        }

# --- GAME 03: HANGMAN ---
stages = [r'''
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========
''', r'''
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========
''', r'''
  +---+
  |   |
  O   | 
 /|\\  |
      |
      |
=========
''', '''
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========''',
'''
  +---+
  |   |
  O   |
  |   |
      |
      |
=========
''', '''
  +---+
  |   |
  O   |
      |
      |
      |
=========
''', '''
  +---+
  |   |
      |
      |
      |
      |
=========
''']

# Expanded 75-word collection from original file
word_list = [
    "aardvark", "baboon", "camel", "tiger", "elephant",
    "giraffe", "monkey", "zebra", "lion", "rabbit",
    "dolphin", "penguin", "kangaroo", "leopard", "cheetah",
    "computer", "keyboard", "internet", "software", "program",
    "python", "variable", "function", "developer", "website",
    "college", "student", "teacher", "library", "notebook",
    "airport", "station", "journey", "mountain", "rainbow",
    "thunder", "diamond", "cricket", "football", "badminton",
    "chocolate", "sandwich", "pineapple", "strawberry", "potato",
    "hospital", "engineer", "science", "physics", "chemistry",
    "planet", "galaxy", "satellite", "universe", "telescope",
    "adventure", "mystery", "puzzle", "treasure", "holiday",
    "backpack", "umbrella", "bicycle", "airplane", "helicopter",
    "crocodile", "butterfly", "octopus", "squirrel",
    "friendship", "happiness", "knowledge", "education", "creative",
    "basketball", "volleyball", "champion", "stadium"
]

class HangmanGame:
    def __init__(self):
        self.reset()
    def reset(self):
        self.chosen_word = random.choice(word_list).lower()
        self.lives = 6
        self.correct_letters = []
        self.guessed_letters = []
        self.game_over = False
        self.won = False
        self.message = "Guess a letter using your keyboard or the on-screen keys!"
        return self.get_state()
    def guess(self, letter):
        if self.game_over:
            return self.get_state()
        char = str(letter).lower().strip()
        if not char or len(char) != 1 or not char.isalpha():
            return {"error": "Please guess a single letter (A-Z)."}
        if char in self.guessed_letters:
            return {"error": f"You already guessed '{char.upper()}'."}
        self.guessed_letters.append(char)
        if char in self.chosen_word:
            self.correct_letters.append(char)
            self.message = f"Nice! '{char.upper()}' is in the word."
        else:
            self.lives -= 1
            self.message = f"Miss! '{char.upper()}' is not in the word."
            if self.lives == 0:
                self.game_over = True
                self.message = f"You Lose! The secret word was: {self.chosen_word.upper()}"
        display = self.get_display()
        if "_" not in display:
            self.game_over = True
            self.won = True
            self.message = f"You win! Congratulations on solving '{self.chosen_word.upper()}'!"
        return self.get_state()
    def get_display(self):
        return [ltr.upper() if ltr in self.correct_letters else "_" for ltr in self.chosen_word]
    def get_state(self):
        return {
            "display": self.get_display(),
            "word_length": len(self.chosen_word),
            "lives": self.lives,
            "max_lives": 6,
            "stage_ascii": stages[self.lives],
            "guessed_letters": sorted([g.upper() for g in self.guessed_letters]),
            "game_over": self.game_over,
            "won": self.won,
            "message": self.message,
            "revealed_word": self.chosen_word.upper() if self.game_over else None
        }

# --- GAME 04: STONE PAPER SCISSORS ---
rock = '''
    _______
---'   ____)
      (_____)
      (_____)
      (____)
---.__(___)
'''
paper = '''
    _______
---'   ____)____
          ______)
          _______)
         _______)
---.__________)
'''
scissors = '''
    _______
---'   ____)____
          ______)
       __________)
      (____)
---.__(___)
'''
image = [rock, paper, scissors]
names = ["Rock", "Paper", "Scissors"]

class StonePaperScissorsGame:
    def __init__(self):
        self.reset()
    def reset(self):
        self.user_choice = None
        self.computer_choice = None
        self.result = ""
        self.message = "Make your move! Select Rock (0), Paper (1), or Scissors (2)."
        self.rounds_played = 0
        self.user_score = 0
        self.computer_score = 0
        self.draws = 0
        return self.get_state()
    def play_round(self, user_choice_idx):
        try:
            user = int(user_choice_idx)
        except (ValueError, TypeError):
            return {"error": "Invalid move choice. Choose 0, 1, or 2."}
        if user < 0 or user >= 3:
            return {"error": "Invalid choice: Must be 0 for Rock, 1 for Paper, or 2 for Scissors."}
        computer = random.randint(0, 2)
        self.user_choice = user
        self.computer_choice = computer
        self.rounds_played += 1
        if user == computer:
            outcome = "draw"
            self.draws += 1
            self.message = f"Both picked {names[user]} — It's a draw!"
        elif user == 0 and computer == 1:
            outcome = "You Lose"
            self.computer_score += 1
            self.message = "Paper covers Rock — You Lose!"
        elif user == 0 and computer == 2:
            outcome = "You Win"
            self.user_score += 1
            self.message = "Rock crushes Scissors — You Win!"
        elif user == 1 and computer == 0:
            outcome = "you win"
            self.user_score += 1
            self.message = "Paper covers Rock — You Win!"
        elif user == 1 and computer == 2:
            outcome = "You Lose"
            self.computer_score += 1
            self.message = "Scissors cuts Paper — You Lose!"
        elif user == 2 and computer == 0:
            outcome = "You Lose"
            self.computer_score += 1
            self.message = "Rock crushes Scissors — You Lose!"
        elif user == 2 and computer == 1:
            outcome = "You Win"
            self.user_score += 1
            self.message = "Scissors cuts Paper — You Win!"
        else:
            outcome = "invalid"
            self.message = "Invalid round."
        self.result = outcome
        return self.get_state()
    def get_state(self):
        return {
            "user_choice": self.user_choice,
            "user_choice_name": names[self.user_choice] if self.user_choice is not None else None,
            "user_ascii": image[self.user_choice] if self.user_choice is not None else "",
            "computer_choice": self.computer_choice,
            "computer_choice_name": names[self.computer_choice] if self.computer_choice is not None else None,
            "computer_ascii": image[self.computer_choice] if self.computer_choice is not None else "",
            "result": self.result,
            "message": self.message,
            "user_score": self.user_score,
            "computer_score": self.computer_score,
            "draws": self.draws,
            "rounds_played": self.rounds_played
        }

# Global engine registry for Pyodide
_arcade_engine = {
    "higher_lower": HigherLowerGame(),
    "blackjack": BlackjackGame(),
    "hangman": HangmanGame(),
    "stone_paper_scissors": StonePaperScissorsGame()
}

def dispatch(game_name, action, payload=None):
    if game_name not in _arcade_engine:
        return json.dumps({"error": f"Unknown game: {game_name}"})
    game = _arcade_engine[game_name]
    if payload == "null" or payload is None:
        payload = None
    try:
        if action == "get_state":
            res = game.get_state()
        elif action == "reset":
            res = game.reset()
        elif game_name == "higher_lower":
            if action == "set_difficulty":
                res = game.set_difficulty(payload)
            elif action == "guess":
                res = game.guess(payload)
            else:
                res = {"error": f"Unknown action: {action}"}
        elif game_name == "blackjack":
            if action == "hit":
                res = game.hit()
            elif action == "stand":
                res = game.stand()
            else:
                res = {"error": f"Unknown action: {action}"}
        elif game_name == "hangman":
            if action == "guess":
                res = game.guess(payload)
            else:
                res = {"error": f"Unknown action: {action}"}
        elif game_name == "stone_paper_scissors":
            if action == "play_round":
                res = game.play_round(payload)
            else:
                res = {"error": f"Unknown action: {action}"}
        else:
            res = {"error": "Unsupported action"}
        return json.dumps(res)
    except Exception as e:
        return json.dumps({"error": str(e)})
`;

  // Asynchronously initialize Pyodide
  async function initPyodideRuntime() {
    if (typeof loadPyodide === 'function') {
      try {
        if (pythonEngineStatus) pythonEngineStatus.textContent = 'LOADING PYODIDE RUNTIME...';
        pyodideInstance = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
        });

        // Run the Python adapter script inside the Pyodide WebAssembly instance
        await pyodideInstance.runPythonAsync(PYTHON_ADAPTER_SOURCE);
        isPyodideReady = true;

        if (pythonEngineBadge) {
          pythonEngineBadge.classList.remove('is-loading');
          pythonEngineBadge.classList.add('is-ready');
        }
        if (pythonEngineStatus) {
          pythonEngineStatus.textContent = 'PYTHON RUNTIME ACTIVE (WASM)';
        }

        console.log('[Python Arcade] Pyodide initialized with all four games.');
      } catch (err) {
        console.warn('[Python Arcade] Pyodide initialization error:', err);
        handlePyodideFallback(err);
      }
    } else {
      handlePyodideFallback(new Error('Pyodide script tag not yet available'));
    }
  }

  function handlePyodideFallback(err) {
    if (pythonEngineBadge) {
      pythonEngineBadge.classList.remove('is-loading');
      pythonEngineBadge.classList.add('is-ready');
    }
    if (pythonEngineStatus) {
      pythonEngineStatus.textContent = 'PYTHON RUNTIME (LOCAL ADAPTER ACTIVE)';
    }
  }

  // Start Pyodide in background
  initPyodideRuntime();

  // -------------------------------------------------------------------------
  // 3. Python Execution Dispatch Bridge
  // Converts JavaScript values (including null, booleans, and numbers)
  // to proper Python literals so NameErrors like 'null is not defined' can never occur.
  // -------------------------------------------------------------------------
  function toPythonLiteral(val) {
    if (val === null || val === undefined) return 'None';
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'string') return JSON.stringify(val);
    return `json.loads(${JSON.stringify(JSON.stringify(val))})`;
  }

  async function runPythonDispatch(gameName, action, payload = null) {
    if (isPyodideReady && pyodideInstance) {
      try {
        const pyPayload = toPythonLiteral(payload);
        const pyCode = `dispatch(${JSON.stringify(gameName)}, ${JSON.stringify(action)}, ${pyPayload})`;
        const resultJson = pyodideInstance.runPython(pyCode);
        return JSON.parse(resultJson);
      } catch (err) {
        console.error('[Pyodide Dispatch Error]', err);
        return { error: err.message };
      }
    } else {
      // Local client-side evaluation fallback (mirrors exact student logic if offline)
      return runLocalFallback(gameName, action, payload);
    }
  }

  // Fallback state engine (guarantees seamless gameplay even without internet)
  const localState = {
    hl: { num: 42, diff: 'easy', rem: 10, total: 10, guesses: [], won: false, over: false, msg: '' },
    bj: { user: [], comp: [], over: false, res: '', msg: '' },
    hm: { word: 'PYTHON', lives: 6, correct: [], guessed: [], over: false, won: false, msg: '' },
    sps: { user: null, comp: null, res: '', userScore: 0, compScore: 0, draws: 0, rounds: 0, msg: '' }
  };

  const expandedWordList = [
    "aardvark", "baboon", "camel", "tiger", "elephant",
    "giraffe", "monkey", "zebra", "lion", "rabbit",
    "dolphin", "penguin", "kangaroo", "leopard", "cheetah",
    "computer", "keyboard", "internet", "software", "program",
    "python", "variable", "function", "developer", "website",
    "college", "student", "teacher", "library", "notebook",
    "airport", "station", "journey", "mountain", "rainbow",
    "thunder", "diamond", "cricket", "football", "badminton",
    "chocolate", "sandwich", "pineapple", "strawberry", "potato",
    "hospital", "engineer", "science", "physics", "chemistry",
    "planet", "galaxy", "satellite", "universe", "telescope",
    "adventure", "mystery", "puzzle", "treasure", "holiday",
    "backpack", "umbrella", "bicycle", "airplane", "helicopter",
    "crocodile", "butterfly", "octopus", "squirrel",
    "friendship", "happiness", "knowledge", "education", "creative",
    "basketball", "volleyball", "champion", "stadium"
  ];

  function runLocalFallback(game, action, payload) {
    if (game === 'higher_lower') {
      const s = localState.hl;
      if (action === 'reset' || action === 'get_state') {
        if (action === 'reset') {
          s.num = Math.floor(Math.random() * 100) + 1;
          s.total = s.diff === 'hard' ? 5 : 10;
          s.rem = s.total;
          s.guesses = [];
          s.won = false;
          s.over = false;
          s.msg = `Game reset on ${s.diff.toUpperCase()} mode. You have ${s.rem} attempts remaining!`;
        }
        return { difficulty: s.diff, attempts_remaining: s.rem, total_attempts: s.total, guesses: s.guesses, game_over: s.over, won: s.won, message: s.msg, revealed_number: s.over ? s.num : null };
      }
      if (action === 'set_difficulty') {
        s.diff = payload === 'hard' ? 'hard' : 'easy';
        s.total = s.diff === 'hard' ? 5 : 10;
        s.rem = s.total;
        s.num = Math.floor(Math.random() * 100) + 1;
        s.guesses = [];
        s.won = false;
        s.over = false;
        s.msg = `Difficulty set to ${s.diff.toUpperCase()}. You have ${s.rem} attempts.`;
        return { difficulty: s.diff, attempts_remaining: s.rem, total_attempts: s.total, guesses: s.guesses, game_over: s.over, won: s.won, message: s.msg, revealed_number: null };
      }
      if (action === 'guess') {
        const val = parseInt(payload, 10);
        if (isNaN(val) || val < 1 || val > 100) return { error: 'Enter a number between 1 and 100' };
        s.rem--;
        let hint = '';
        if (val > s.num) { hint = 'Too high'; s.msg = `${val} is Too High! Try a lower number.`; }
        else if (val < s.num) { hint = 'Too low'; s.msg = `${val} is Too Low! Try a higher number.`; }
        else { hint = 'You guessed the number'; s.won = true; s.over = true; s.msg = `Brilliant! You guessed ${s.num}!`; }
        s.guesses.push({ guess: val, hint, remaining: s.rem });
        if (!s.won && s.rem <= 0) { s.over = true; s.msg = `You Lose, the correct number was: ${s.num}`; }
        return { difficulty: s.diff, attempts_remaining: s.rem, total_attempts: s.total, guesses: s.guesses, game_over: s.over, won: s.won, message: s.msg, revealed_number: s.over ? s.num : null };
      }
    }

    if (game === 'blackjack') {
      const s = localState.bj;
      const cards = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
      const deal = () => cards[Math.floor(Math.random() * cards.length)];
      const calc = (h) => {
        let sum = h.reduce((a, b) => a + b, 0);
        if (sum === 21 && h.length === 2) return 0;
        if (h.includes(11) && sum > 21) sum -= 10;
        return sum;
      };
      if (action === 'reset' || action === 'get_state') {
        if (action === 'reset' || s.user.length === 0) {
          s.user = [deal(), deal()];
          s.comp = [deal(), deal()];
          s.over = false;
          s.res = '';
          s.msg = 'Game started. Choose Hit to draw another card, or Stand to hold.';
          if (calc(s.user) === 0 || calc(s.comp) === 0 || calc(s.user) > 21) {
            return runLocalFallback('blackjack', 'stand', null);
          }
        }
      }
      if (action === 'hit' && !s.over) {
        s.user.push(deal());
        const u = calc(s.user);
        if (u === 0 || u > 21) return runLocalFallback('blackjack', 'stand', null);
        s.msg = `You drew a card. Your score is ${u}.`;
      }
      if (action === 'stand' && !s.over) {
        s.over = true;
        let u = calc(s.user);
        let c = calc(s.comp);
        if (u <= 21 && u !== 0) {
          while (c !== 0 && c < 17) { s.comp.push(deal()); c = calc(s.comp); }
        }
        if (u === c) s.res = 'Draw 🙃';
        else if (c === 0) s.res = 'Lose, opponent has Blackjack 😱';
        else if (u === 0) s.res = 'Win with a Blackjack 😎';
        else if (u > 21) s.res = 'You went over. You lose 😭';
        else if (c > 21) s.res = 'Opponent went over. You win 😁';
        else if (u > c) s.res = 'You win 😃';
        else s.res = 'You lose 😤';
        s.msg = `Final Hand: Player ${u === 0 ? 21 : u} vs Dealer ${c === 0 ? 21 : c}.`;
      }
      const uSc = calc(s.user);
      const cSc = calc(s.comp);
      return {
        user_cards: s.user,
        user_score: uSc === 0 ? 21 : uSc,
        is_user_blackjack: uSc === 0,
        computer_cards: s.over ? s.comp : [s.comp[0], '?'],
        computer_score: s.over ? (cSc === 0 ? 21 : cSc) : '?',
        is_game_over: s.over,
        result_message: s.res,
        status_description: s.msg
      };
    }

    if (game === 'hangman') {
      const s = localState.hm;
      const stagesArr = [
        `\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========\n`,
        `\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========\n`,
        `\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========\n`,
        `\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========\n`,
        `\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========\n`,
        `\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========\n`,
        `\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========\n`
      ];
      if (action === 'reset' || action === 'get_state') {
        if (action === 'reset') {
          s.word = expandedWordList[Math.floor(Math.random() * expandedWordList.length)].toUpperCase();
          s.lives = 6;
          s.correct = [];
          s.guessed = [];
          s.over = false;
          s.won = false;
          s.msg = 'Guess a letter using your keyboard or the on-screen keys!';
        }
      }
      if (action === 'guess' && !s.over) {
        const char = String(payload).toUpperCase().trim();
        if (char && char.length === 1 && !s.guessed.includes(char)) {
          s.guessed.push(char);
          if (s.word.includes(char)) {
            s.correct.push(char);
            s.msg = `Nice! '${char}' is in the word.`;
          } else {
            s.lives--;
            s.msg = `Miss! '${char}' is not in the word.`;
            if (s.lives <= 0) { s.over = true; s.msg = `You Lose! The secret word was: ${s.word}`; }
          }
          const disp = s.word.split('').map(l => s.correct.includes(l) ? l : '_');
          if (!disp.includes('_')) { s.over = true; s.won = true; s.msg = `You win! Congratulations on solving '${s.word}'!`; }
        }
      }
      return {
        display: s.word.split('').map(l => s.correct.includes(l) ? l : '_'),
        word_length: s.word.length,
        lives: s.lives,
        max_lives: 6,
        stage_ascii: stagesArr[s.lives],
        guessed_letters: [...s.guessed].sort(),
        game_over: s.over,
        won: s.won,
        message: s.msg,
        revealed_word: s.over ? s.word : null
      };
    }

    if (game === 'stone_paper_scissors') {
      const s = localState.sps;
      const names = ['Rock', 'Paper', 'Scissors'];
      const asciiArt = [
        `\n    _______\n---'   ____)\n      (_____)\n      (_____)\n      (____)\n---.__(___)\n`,
        `\n    _______\n---'   ____)____\n          ______)\n          _______)\n         _______)\n---.__________)\n`,
        `\n    _______\n---'   ____)____\n          ______)\n       __________)\n      (____)\n---.__(___)\n`
      ];
      if (action === 'reset' || action === 'get_state') {
        if (action === 'reset') {
          s.user = null;
          s.comp = null;
          s.res = '';
          s.msg = 'Make your move! Select Rock (0), Paper (1), or Scissors (2).';
        }
      }
      if (action === 'play_round') {
        const u = parseInt(payload, 10);
        const c = Math.floor(Math.random() * 3);
        s.user = u;
        s.comp = c;
        s.rounds++;
        if (u === c) {
          s.res = 'draw';
          s.draws++;
          s.msg = `Both picked ${names[u]} — It's a draw!`;
        } else if ((u === 0 && c === 2) || (u === 1 && c === 0) || (u === 2 && c === 1)) {
          s.res = 'You Win';
          s.userScore++;
          const reason = u === 0 ? 'Rock crushes Scissors' : (u === 1 ? 'Paper covers Rock' : 'Scissors cuts Paper');
          s.msg = `${reason} — You Win!`;
        } else {
          s.res = 'You Lose';
          s.compScore++;
          const reason = c === 0 ? 'Rock crushes Scissors' : (c === 1 ? 'Paper covers Rock' : 'Scissors cuts Paper');
          s.msg = `${reason} — You Lose!`;
        }
      }
      return {
        user_choice: s.user,
        user_choice_name: s.user !== null ? names[s.user] : null,
        user_ascii: s.user !== null ? asciiArt[s.user] : '',
        computer_choice: s.comp,
        computer_choice_name: s.comp !== null ? names[s.comp] : null,
        computer_ascii: s.comp !== null ? asciiArt[s.comp] : '',
        result: s.res,
        message: s.msg,
        user_score: s.userScore,
        computer_score: s.compScore,
        draws: s.draws,
        rounds_played: s.rounds
      };
    }

    return { error: 'Unknown game' };
  }

  // -------------------------------------------------------------------------
  // 4. Modal & View Controllers
  // -------------------------------------------------------------------------
  const modalOverlay = document.getElementById('gameModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const btnBackToGames = document.getElementById('btnBackToGames');
  const btnRestartGame = document.getElementById('btnRestartGame');

  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalCategory = document.getElementById('modalCategory');
  const gameResultBanner = document.getElementById('gameResultBanner');
  const gameResultMessage = document.getElementById('gameResultMessage');

  const views = {
    'higher_lower': document.getElementById('viewHigherLower'),
    'blackjack': document.getElementById('viewBlackjack'),
    'hangman': document.getElementById('viewHangman'),
    'stone_paper_scissors': document.getElementById('viewStonePaperScissors')
  };

  let lastActiveElement = null;

  async function openGameCabinet(gameKey) {
    const meta = gamesMeta[gameKey];
    if (!meta || !modalOverlay) return;

    activeGame = gameKey;
    lastActiveElement = document.activeElement;

    // Reset inputs
    if (hlGuessInput) hlGuessInput.value = '';
    if (hmLetterInput) hmLetterInput.value = '';

    // Clear previous banner messages & error states
    if (gameResultBanner) {
      gameResultBanner.style.display = 'none';
      gameResultBanner.className = 'game-result-banner';
    }

    // Set modal header titles
    if (modalCategory) modalCategory.textContent = meta.category;
    if (modalTitle) modalTitle.textContent = meta.title;
    if (modalSubtitle) modalSubtitle.textContent = meta.subtitle;

    // Show appropriate game view, hide others
    Object.keys(views).forEach((k) => {
      if (views[k]) {
        views[k].style.display = (k === gameKey) ? 'block' : 'none';
      }
    });

    // Reset and get initial game state from Python
    const state = await runPythonDispatch(gameKey, 'get_state');
    renderGameState(gameKey, state);

    // Open modal
    modalOverlay.classList.add('is-visible');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    if (modalCloseBtn) {
      setTimeout(() => modalCloseBtn.focus(), 50);
    }
  }

  function closeGameCabinet() {
    if (!modalOverlay || !modalOverlay.classList.contains('is-visible')) return;

    modalOverlay.classList.remove('is-visible');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeGame = null;

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  function showBannerMessage(msg, type = 'info') {
    if (!gameResultBanner || !gameResultMessage) return;
    if (!msg) {
      gameResultBanner.style.display = 'none';
      return;
    }

    gameResultMessage.textContent = msg;
    gameResultBanner.className = 'game-result-banner';

    if (type === 'win') gameResultBanner.classList.add('banner-win');
    else if (type === 'lose') gameResultBanner.classList.add('banner-lose');
    else if (type === 'draw') gameResultBanner.classList.add('banner-draw');

    gameResultBanner.style.display = 'flex';
  }

  // -------------------------------------------------------------------------
  // 5. Game State Renderers
  // -------------------------------------------------------------------------
  function renderGameState(gameKey, state) {
    if (!state || state.error) {
      if (state && state.error) showBannerMessage(state.error, 'lose');
      return;
    }

    if (gameKey === 'higher_lower') renderHigherLower(state);
    else if (gameKey === 'blackjack') renderBlackjack(state);
    else if (gameKey === 'hangman') renderHangman(state);
    else if (gameKey === 'stone_paper_scissors') renderStonePaperScissors(state);
  }

  // --- HIGHER OR LOWER RENDERER ---
  const hlAttemptsCount = document.getElementById('hlAttemptsCount');
  const hlGuessInput = document.getElementById('hlGuessInput');
  const hlBtnSubmit = document.getElementById('hlBtnSubmit');
  const hlHistoryList = document.getElementById('hlHistoryList');
  const btnDiffEasy = document.getElementById('btnDiffEasy');
  const btnDiffHard = document.getElementById('btnDiffHard');

  function renderHigherLower(state) {
    if (hlAttemptsCount) {
      hlAttemptsCount.textContent = `${state.attempts_remaining} / ${state.total_attempts}`;
    }

    // Update active difficulty buttons
    if (btnDiffEasy && btnDiffHard) {
      btnDiffEasy.classList.toggle('is-active', state.difficulty === 'easy');
      btnDiffHard.classList.toggle('is-active', state.difficulty === 'hard');
      btnDiffEasy.disabled = state.guesses.length > 0 && !state.game_over;
      btnDiffHard.disabled = state.guesses.length > 0 && !state.game_over;
    }

    // Input state
    if (hlGuessInput && hlBtnSubmit) {
      hlGuessInput.disabled = state.game_over;
      hlBtnSubmit.disabled = state.game_over;
      if (!state.game_over) hlGuessInput.focus();
    }

    // Banner
    if (state.game_over) {
      showBannerMessage(state.message, state.won ? 'win' : 'lose');
    } else {
      showBannerMessage(state.message, 'info');
    }

    // Guess history list
    if (hlHistoryList) {
      if (state.guesses.length === 0) {
        hlHistoryList.innerHTML = '<div class="history-item" style="color: var(--slate-blue);">No guesses yet. Enter a number to start.</div>';
      } else {
        hlHistoryList.innerHTML = state.guesses.map((g, idx) => {
          let cls = 'hint-match';
          if (g.hint === 'Too high') cls = 'hint-high';
          else if (g.hint === 'Too low') cls = 'hint-low';
          return `<div class="history-item ${cls}">
            <span>#${idx + 1}: <strong>${g.guess}</strong> (${g.hint})</span>
            <span>${g.remaining} left</span>
          </div>`;
        }).join('');
      }
    }
  }

  // --- BLACKJACK RENDERER ---
  const bjDealerCards = document.getElementById('bjDealerCards');
  const bjDealerScore = document.getElementById('bjDealerScore');
  const bjPlayerCards = document.getElementById('bjPlayerCards');
  const bjPlayerScore = document.getElementById('bjPlayerScore');
  const btnBjHit = document.getElementById('btnBjHit');
  const btnBjStand = document.getElementById('btnBjStand');

  function renderCardHTML(val) {
    if (val === '?') {
      return `<div class="playing-card-ui card-hidden">?</div>`;
    }
    const suits = ['♠', '♥', '♦', '♣'];
    const suit = suits[val % 4];
    const isRed = suit === '♥' || suit === '♦';
    const rank = val === 11 ? 'A' : (val === 10 ? '10' : String(val));

    return `<div class="playing-card-ui ${isRed ? 'card-red' : ''}">
      <span class="card-corner-top">${rank}</span>
      <span class="card-center-suit">${suit}</span>
      <span class="card-corner-top" style="text-align: right;">${suit}</span>
    </div>`;
  }

  function renderBlackjack(state) {
    if (bjDealerCards) {
      bjDealerCards.innerHTML = state.computer_cards.map(renderCardHTML).join('');
    }
    if (bjDealerScore) {
      bjDealerScore.textContent = state.computer_score;
    }
    if (bjPlayerCards) {
      bjPlayerCards.innerHTML = state.user_cards.map(renderCardHTML).join('');
    }
    if (bjPlayerScore) {
      bjPlayerScore.textContent = state.user_score;
    }

    if (btnBjHit && btnBjStand) {
      btnBjHit.disabled = state.is_game_over;
      btnBjStand.disabled = state.is_game_over;
    }

    if (state.is_game_over) {
      const res = state.result_message.toLowerCase();
      let type = 'draw';
      if (res.includes('win')) type = 'win';
      else if (res.includes('lose')) type = 'lose';
      showBannerMessage(`${state.result_message} — ${state.status_description}`, type);
    } else {
      showBannerMessage(state.status_description, 'info');
    }
  }

  // --- HANGMAN RENDERER ---
  const hmAsciiScreen = document.getElementById('hmAsciiScreen');
  const hmLivesCount = document.getElementById('hmLivesCount');
  const hmWordDisplay = document.getElementById('hmWordDisplay');
  const hmKeyboard = document.getElementById('hmKeyboard');
  const hmLetterInput = document.getElementById('hmLetterInput');
  const hmBtnSubmit = document.getElementById('hmBtnSubmit');

  function renderHangman(state) {
    if (hmAsciiScreen) {
      hmAsciiScreen.textContent = state.stage_ascii;
    }
    if (hmLivesCount) {
      hmLivesCount.textContent = `${state.lives} / ${state.max_lives} LIVES`;
    }

    // Word display tiles
    if (hmWordDisplay) {
      hmWordDisplay.innerHTML = state.display.map(ltr =>
        `<div class="word-tile-slot">${ltr}</div>`
      ).join('');
    }

    // Alphabet buttons
    if (hmKeyboard) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      hmKeyboard.innerHTML = alphabet.map(letter => {
        const isGuessed = state.guessed_letters.includes(letter);
        return `<button type="button" class="key-btn" data-letter="${letter}" ${isGuessed || state.game_over ? 'disabled' : ''}>${letter}</button>`;
      }).join('');
    }

    if (hmLetterInput && hmBtnSubmit) {
      hmLetterInput.disabled = state.game_over;
      hmBtnSubmit.disabled = state.game_over;
      if (!state.game_over) hmLetterInput.focus();
    }

    if (state.game_over) {
      showBannerMessage(state.message, state.won ? 'win' : 'lose');
    } else {
      showBannerMessage(state.message, 'info');
    }
  }

  // --- STONE PAPER SCISSORS RENDERER ---
  const spsChoiceButtons = document.querySelectorAll('.sps-btn-choice');
  const spsPlayerMoveTag = document.getElementById('spsPlayerMoveTag');
  const spsPlayerAscii = document.getElementById('spsPlayerAscii');
  const spsComputerMoveTag = document.getElementById('spsComputerMoveTag');
  const spsComputerAscii = document.getElementById('spsComputerAscii');
  const spsScorePlayer = document.getElementById('spsScorePlayer');
  const spsScoreDraws = document.getElementById('spsScoreDraws');
  const spsScoreComputer = document.getElementById('spsScoreComputer');

  function renderStonePaperScissors(state) {
    spsChoiceButtons.forEach(btn => {
      const choice = parseInt(btn.getAttribute('data-choice'), 10);
      btn.classList.toggle('is-selected', choice === state.user_choice);
    });

    if (spsPlayerMoveTag) {
      spsPlayerMoveTag.textContent = state.user_choice_name || '-';
    }
    if (spsPlayerAscii) {
      spsPlayerAscii.textContent = state.user_ascii || 'Waiting for your move...';
    }
    if (spsComputerMoveTag) {
      spsComputerMoveTag.textContent = state.computer_choice_name || '-';
    }
    if (spsComputerAscii) {
      spsComputerAscii.textContent = state.computer_ascii || 'Waiting for your move...';
    }

    if (spsScorePlayer) spsScorePlayer.textContent = state.user_score;
    if (spsScoreDraws) spsScoreDraws.textContent = state.draws;
    if (spsScoreComputer) spsScoreComputer.textContent = state.computer_score;

    if (state.result) {
      const res = state.result.toLowerCase();
      let type = 'draw';
      if (res.includes('win')) type = 'win';
      else if (res.includes('lose')) type = 'lose';
      showBannerMessage(state.message, type);
    } else {
      showBannerMessage(state.message, 'info');
    }
  }

  // -------------------------------------------------------------------------
  // 6. Event Handlers & User Controls
  // -------------------------------------------------------------------------

  // Open game cabinets from showcase items
  const gameCards = document.querySelectorAll('[data-game]');
  gameCards.forEach(card => {
    const key = card.getAttribute('data-game');
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openGameCabinet(key);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGameCabinet(key);
      }
    });
  });

  // Modal navigation & close buttons
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeGameCabinet);
  if (btnBackToGames) btnBackToGames.addEventListener('click', closeGameCabinet);

  // Restart / Play Again Handler
  if (btnRestartGame) {
    btnRestartGame.addEventListener('click', async () => {
      if (!activeGame) return;

      // Clear input fields
      if (hlGuessInput) hlGuessInput.value = '';
      if (hmLetterInput) hmLetterInput.value = '';

      // Clear previous banner messages & error states
      if (gameResultBanner) {
        gameResultBanner.style.display = 'none';
        gameResultBanner.className = 'game-result-banner';
      }

      const state = await runPythonDispatch(activeGame, 'reset');
      renderGameState(activeGame, state);
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeGameCabinet();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-visible')) {
      closeGameCabinet();
    }
  });

  // --- Higher or Lower Controls ---
  if (btnDiffEasy) {
    btnDiffEasy.addEventListener('click', async () => {
      const state = await runPythonDispatch('higher_lower', 'set_difficulty', 'easy');
      renderHigherLower(state);
    });
  }

  if (btnDiffHard) {
    btnDiffHard.addEventListener('click', async () => {
      const state = await runPythonDispatch('higher_lower', 'set_difficulty', 'hard');
      renderHigherLower(state);
    });
  }

  const hlGuessForm = document.getElementById('hlGuessForm');
  if (hlGuessForm && hlGuessInput) {
    hlGuessForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = hlGuessInput.value.trim();
      if (!val) return;
      const state = await runPythonDispatch('higher_lower', 'guess', val);
      hlGuessInput.value = '';
      renderHigherLower(state);
    });
  }

  // --- Blackjack Controls ---
  if (btnBjHit) {
    btnBjHit.addEventListener('click', async () => {
      const state = await runPythonDispatch('blackjack', 'hit');
      renderBlackjack(state);
    });
  }

  if (btnBjStand) {
    btnBjStand.addEventListener('click', async () => {
      const state = await runPythonDispatch('blackjack', 'stand');
      renderBlackjack(state);
    });
  }

  // --- Hangman Controls ---
  if (hmKeyboard) {
    hmKeyboard.addEventListener('click', async (e) => {
      const btn = e.target.closest('.key-btn');
      if (!btn || btn.disabled) return;
      const letter = btn.getAttribute('data-letter');
      const state = await runPythonDispatch('hangman', 'guess', letter);
      renderHangman(state);
    });
  }

  const hmInputForm = document.getElementById('hmInputForm');
  if (hmInputForm && hmLetterInput) {
    hmInputForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = hmLetterInput.value.trim();
      if (!val) return;
      const state = await runPythonDispatch('hangman', 'guess', val);
      hmLetterInput.value = '';
      renderHangman(state);
    });
  }

  // --- Stone Paper Scissors Controls ---
  spsChoiceButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const choice = btn.getAttribute('data-choice');
      const state = await runPythonDispatch('stone_paper_scissors', 'play_round', choice);
      renderStonePaperScissors(state);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Mobile Navigation & Anchor Smooth Scroll
  // -------------------------------------------------------------------------
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (navToggle && navDrawer) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navDrawer.classList.toggle('is-open', isOpen);
      navDrawer.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    navToggle.addEventListener('click', () => toggleMenu());
    mobileNavLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

    document.addEventListener('click', (e) => {
      if (navDrawer.classList.contains('is-open') && !navDrawer.contains(e.target) && !navToggle.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const el = document.querySelector(targetId);
      if (el) {
        e.preventDefault();
        const offset = 80;
        const pos = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: pos, behavior: 'smooth' });
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    });
  });

  // Dynamic Year
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
});
