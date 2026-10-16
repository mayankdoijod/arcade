"""
Hangman — Web Browser Integration Adapter
Preserves the student's original word_list, stages, and logic from main.py without modifying main.py.
Handles non-blocking browser event-driven execution via Pyodide.
"""

import random

# Exact stages from student's games/hangman/main.py
stages = [r'''
  +---+
  |   |
  O   |
 /|\  |
 / \  |
      |
=========
''', r'''
  +---+
  |   |
  O   |
 /|\  |
 /    |
      |
=========
''', r'''
  +---+
  |   |
  O   | 
 /|\  |
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

# Exact expanded word list from student's games/hangman/main.py
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

# Support JS JSON literal tokens if evaluated in Python
null = None
true = True
false = False

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

        if letter is None or letter == "null":
            self.message = "Please enter a valid letter (A-Z)."
            return self.get_state()

        char = str(letter).lower().strip()
        if not char or len(char) != 1 or not char.isalpha():
            self.message = "Please enter a valid letter (A-Z)."
            return self.get_state()

        # If letter was already guessed, show friendly message without reducing lives
        if char in self.guessed_letters:
            self.message = f"You already guessed that letter! ('{char.upper()}')"
            return self.get_state()

        self.guessed_letters.append(char)

        if char in self.chosen_word:
            self.correct_letters.append(char)
            self.message = f"Nice! '{char.upper()}' is in the word."
        else:
            self.lives -= 1
            self.message = f"Miss! '{char.upper()}' is not in the word."
            if self.lives <= 0:
                self.lives = 0
                self.game_over = True
                self.message = f"You Lose! The secret word was: {self.chosen_word.upper()}"

        display = self.get_display()
        if "_" not in display:
            self.game_over = True
            self.won = True
            self.message = f"You win! Congratulations on solving '{self.chosen_word.upper()}'!"

        return self.get_state()

    def get_display(self):
        display = []
        for ltr in self.chosen_word:
            if ltr in self.correct_letters:
                display.append(ltr.upper())
            else:
                display.append("_")
        return display

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
