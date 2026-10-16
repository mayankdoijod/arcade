"""
Higher or Lower — Web Browser Integration Adapter
Preserves the student's original logic from main.py without modifying main.py.
Handles non-blocking browser event-driven execution via Pyodide.
"""

import random

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
        self.reset()
        if diff == "hard":
            self.difficulty = "hard"
            self.total_attempts = 5
            self.attempts_remaining = 5
        else:
            self.difficulty = "easy"
            self.total_attempts = 10
            self.attempts_remaining = 10
        self.message = f"Difficulty set to {self.difficulty.upper()}. You have {self.attempts_remaining} attempts remaining."
        return self.get_state()

    def guess(self, user_guess):
        if self.game_over:
            return self.get_state()

        try:
            val = int(user_guess)
        except (ValueError, TypeError):
            return {"error": "Please enter a valid integer between 1 and 100."}

        if val < 1 or val > 100:
            return {"error": "Guess must be between 1 and 100."}

        self.attempts_remaining -= 1
        hint = ""

        # Original student game rules comparison:
        if val > self.num:
            hint = "HIGH"
            self.message = "HIGH"
        elif val < self.num:
            hint = "LOW"
            self.message = "LOW"
        elif val == self.num:
            hint = "You guessed the number"
            self.won = True
            self.game_over = True
            self.message = f"Brilliant! You guessed the number {self.num}!"

        self.guesses.append({
            "guess": val,
            "hint": hint,
            "remaining": self.attempts_remaining
        })

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
