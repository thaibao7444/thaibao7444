import os
import time
from colorama import Fore, Style, init

init(autoreset=True)

def clear():
    os.system("clear")

def banner():
    print(Fore.YELLOW + Style.BRIGHT + """
████████╗ ██████╗  ██████╗ ██╗     
╚══██╔══╝██╔═══██╗██╔═══██╗██║     
   ██║   ██║   ██║██║   ██║██║     
   ██║   ██║   ██║██║   ██║██║     
   ██║   ╚██████╔╝╚██████╔╝███████╗
   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝
                                   
██████╗  ██████╗ ██████╗ ██╗      ██████╗ ██╗  ██╗
██╔══██╗██╔═══██╗██╔══██╗██║     ██╔═══██╗██║ ██╔╝
██████╔╝██║   ██║██████╔╝██║     ██║   ██║█████╔╝ 
██╔══██╗██║   ██║██╔══██╗██║     ██║   ██║██╔═██╗ 
██║  ██║╚██████╔╝██████╔╝███████╗╚██████╔╝██║  ██╗
╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝
""")
    print(Fore.GREEN + "         Coded By CyberAK")
    print(Fore.CYAN + "GitHub: https://github.com/tbao143/thaibao7444\n")
    print(Fore.GREEN + "[" + "-"*40 + "]\n")

def menu():
    print(Fore.CYAN + "[1] Package custom name")
    print(Fore.CYAN + "[2] Id game rejoin")
    print(Fore.CYAN + "[3] Start rejoin")
    print(Fore.RED  + "[4] Exit\n")

package_name = ""
game_id = ""

while True:
    clear()
    banner()
    menu()
    choice = input(Fore.YELLOW + "Select option ➜ ")

    if choice == "1":
        package_name = input(Fore.GREEN + "Enter custom package name ➜ ")
        print(Fore.GREEN + "✓ Package name saved!")
        input(Fore.WHITE + "Press Enter to continue...")

    elif choice == "2":
        game_id = input(Fore.GREEN + "Enter Roblox Game ID ➜ ")
        print(Fore.GREEN + "✓ Game ID saved!")
        input(Fore.WHITE + "Press Enter to continue...")

    elif choice == "3":
        if not package_name or not game_id:
            print(Fore.RED + "✗ Please set package name and game ID first!")
            input(Fore.WHITE + "Press Enter to continue...")
            continue

        print(Fore.GREEN + "\n[+] Starting auto rejoin...")
        print(Fore.RED + "Press CTRL + C to stop.\n")
        time.sleep(2)

        try:
            while True:
                os.system(f"am start -a android.intent.action.VIEW -d roblox://placeId={game_id}")
                time.sleep(5)
        except KeyboardInterrupt:
            print(Fore.RED + "\n[!] Rejoin stopped.")
            input(Fore.WHITE + "Press Enter to continue...")

    elif choice == "4":
        print(Fore.YELLOW + "Goodbye!")
        break

    else:
        print(Fore.RED + "Invalid option!")
        input(Fore.WHITE + "Press Enter to continue...")
