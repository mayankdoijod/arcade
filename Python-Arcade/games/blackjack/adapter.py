"""
Blackjack — Web Browser Integration Adapter
Preserves the student's original logic from main.py without modifying main.py.
Handles non-blocking browser event-driven execution via Pyodide.
"""

import random

# Re-use the student's exact deck definition and scoring algorithms
def deal_card():
    """Returns a random card from the deck (original student logic)"""
    cards = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]
    return random.choice(cards)

def calculate_score(cards):
    """Take a list of cards and return the score calculated from the cards (original student logic)"""
    c = list(cards)
    if sum(c) == 21 and len(c) == 2:
        return 0
    if 11 in c and sum(c) > 21:
        c.remove(11)
        c.append(1)
    return sum(c)

def compare(u_score, c_score):
    """Compares the user score u_score against the computer score c_score (original student logic)"""
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

        # Deal initial 2 cards to player and dealer
        for _ in range(2):
            self.user_cards.append(deal_card())
            self.computer_cards.append(deal_card())

        user_score = calculate_score(self.user_cards)
        computer_score = calculate_score(self.computer_cards)

        # Check for immediate initial Blackjack or bust
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
            self.status_description = f"You drew a card. Your current score is {user_score}."

        return self.get_state()

    def stand(self):
        if self.is_game_over:
            return self.get_state()

        user_score = calculate_score(self.user_cards)
        computer_score = calculate_score(self.computer_cards)

        # Dealer draws cards if player hasn't busted
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
