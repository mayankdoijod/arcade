"""
Stone Paper Scissors — Web Browser Integration Adapter
Preserves the student's original ASCII artwork and rule outcomes from main.py without modifying main.py.
Handles non-blocking browser event-driven execution via Pyodide.
"""

import random

# Exact ASCII art from student's games/stone_paper_scissors/main.py
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

        # Exact conditional outcomes from student's code:
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
