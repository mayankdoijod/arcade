import random
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
lives=6
chosen_word = random.choice(word_list)
print(chosen_word)
placeholder = ""
word_length = len(chosen_word)
for position in range(word_length): placeholder += "_"
print(placeholder)
game_over = False
correct_letters = []
while not game_over:
    guess = input("Guess a letter: ").lower()
    display = ""
    for letter in chosen_word:
        if letter == guess:
            display += letter
            correct_letters.append(guess)
        elif letter in correct_letters: display += letter
        else: display += "_"
    print(display)
    if guess not in chosen_word:
        lives -= 1
        if lives == 0:
            game_over = True
            print("You Lose!")
    print(stages[lives])
    if "_" not in display:
        game_over = True
        print("You win.")
