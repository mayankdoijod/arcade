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
import random
user=int(input("Type 0 for Rock, 1 for Paper, 2 for Scissors: "))
image=[rock,paper,scissors]
computer=random.randint(0,2)
if user<0 or user>=3:
    print("invalid")
elif user==computer:
    print(image[user])
    print(image[computer])
    print("draw")
elif user==0 and computer==1:
    print(image[user])
    print(image[computer])
    print("You Lose")
elif user==0 and computer==2:
    print(image[user])
    print(image[computer])
    print("You Win")
elif user==1 and computer==0:
    print(image[user])
    print(image[computer])
    print("you win")
elif user==1 and computer==2:
    print(image[user])
    print(image[computer])
    print("You Lose")
elif user==2 and computer==0:
    print(image[user])
    print(image[computer])
    print("You Lose")
elif user==2 and computer==1:
    print(image[user])
    print(image[computer])
    print("You Win")
