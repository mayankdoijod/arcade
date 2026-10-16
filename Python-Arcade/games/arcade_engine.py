"""
Python Arcade — Unified Engine & Pyodide Bridge
Provides a clean, JSON-based dispatch interface between the web frontend and Python game adapters.
"""

import json
import sys
import os

# Ensure current directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from higher_lower.adapter import HigherLowerGame
    from blackjack.adapter import BlackjackGame
    from hangman.adapter import HangmanGame
    from stone_paper_scissors.adapter import StonePaperScissorsGame
except ImportError:
    from games.higher_lower.adapter import HigherLowerGame
    from games.blackjack.adapter import BlackjackGame
    from games.hangman.adapter import HangmanGame
    from games.stone_paper_scissors.adapter import StonePaperScissorsGame

# Global aliases to handle JS-to-Python JSON literal tokens gracefully
null = None
true = True
false = False


class ArcadeEngine:
    def __init__(self):
        self.games = {
            "higher_lower": HigherLowerGame(),
            "blackjack": BlackjackGame(),
            "hangman": HangmanGame(),
            "stone_paper_scissors": StonePaperScissorsGame()
        }

    def dispatch(self, game_name, action, payload=None):
        if game_name not in self.games:
            return json.dumps({"error": f"Unknown game: {game_name}"})

        game = self.games[game_name]

        try:
            if action == "get_state":
                result = game.get_state()
            elif action == "reset":
                result = game.reset()
            
            # Higher or Lower actions
            elif game_name == "higher_lower":
                if action == "set_difficulty":
                    diff = payload if isinstance(payload, str) else "easy"
                    result = game.set_difficulty(diff)
                elif action == "guess":
                    result = game.guess(payload)
                else:
                    result = {"error": f"Unknown action: {action}"}

            # Blackjack actions
            elif game_name == "blackjack":
                if action == "hit":
                    result = game.hit()
                elif action == "stand":
                    result = game.stand()
                else:
                    result = {"error": f"Unknown action: {action}"}

            # Hangman actions
            elif game_name == "hangman":
                if action == "guess":
                    result = game.guess(payload)
                else:
                    result = {"error": f"Unknown action: {action}"}

            # Stone Paper Scissors actions
            elif game_name == "stone_paper_scissors":
                if action == "play_round":
                    result = game.play_round(payload)
                else:
                    result = {"error": f"Unknown action: {action}"}

            else:
                result = {"error": f"Unsupported action {action} for {game_name}"}

            return json.dumps(result)

        except Exception as e:
            return json.dumps({"error": str(e)})

# Global engine instance for Pyodide access
engine = ArcadeEngine()

def dispatch(game_name, action, payload=None):
    return engine.dispatch(game_name, action, payload)
