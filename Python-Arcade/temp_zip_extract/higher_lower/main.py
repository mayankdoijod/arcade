import random
num=random.randint(1,100)
print(num,"\n"*100)
logo = r"""
  / _ \_   _  ___  ___ ___  /__   \ |__   ___    /\ \ \_   _ _ __ ___ | |__   ___ _ __ 
 / /_\/ | | |/ _ \/ __/ __|   / /\/ '_ \ / _ \  /  \/ / | | | '_ ` _ \| '_ \ / _ \ '__|
/ /_\\| |_| |  __/\__ \__ \  / /  | | | |  __/ / /\  /| |_| | | | | | | | |_) |  __/ |   
\____/ \__,_|\___||___/___/  \/   |_| |_|\___| \_\ \/  \__,_|_| |_| |_|_.__/ \___|_| 
"""
print(logo)
a=True
while a:
    difficulty=input("Choose a difficulty: Type 'easy' or 'hard': ")
    if difficulty=="easy":
        print("You have 10 attempts remaining to guess the number")
        for i in range(10):
            guess = int(input("Guess the number: "))
            if guess>num: print("Too high")
            elif guess<num: print("Too low")
            elif guess==num:
                print("You guessed the number")
                a=False
    elif difficulty=="hard":
        print("You have 5 attempts remaining to guess the number")
        for i in range(5):
            guess = int(input("Guess the number: "))
            if guess>num: print("Too high")
            elif guess<num: print("Too low")
            elif guess==num:
                print("You guessed the number")
                a=False
    print(f"You Lose, the correct number: {num}")
    a=False
