# 🥊 BattleFit

**BattleFit** is a browser-based fitness game developed for the **TerraHacks 2025** hackathon. It gamifies health and exercise through interactive voice-driven menus, user feedback mechanisms, and exercise tracking — all built with pure **HTML**, **CSS**, and **JavaScript**.

> No frameworks. No dependencies. Just raw code and creative design.

---

## 🚀 Project Overview

- 🗣️ **Voice-Controlled Navigation** – Interact hands-free using basic voice commands like “start,” “menu,” or “next.”
- 💪 **Gamified Fitness Flow** – Transforms workout steps into structured, battle-like challenges.
- 🧠 **Accessible Design** – Built for simplicity, speed, and cross-device support (desktop & mobile).

---

## 🎯 Core Features

### ✅ 1. Voice Command Menu (`menuVoiceControllerFree.js`)
- Listens for voice inputs like:
  - `menu`, `start`, `next`, `repeat`, `exit`
- Guides users through app sections
- Modular and extendable command-based architecture

### ✅ 2. Feedback Collection (`feedback.js`)
- Gives encouraging feedback to the user based on their form
- Modular architecture

### ✅ 3. App Orchestration (`main.js`)
- Handles core app flow:
  - Navigating from intro → menu → feedback
  - Plays audio assets
  - Manages UI visibility and resets between states

---

## 🧪 Technologies Used

| Technology     | Purpose                          |
| -------------- | -------------------------------- |
| HTML5          | UI structure                     |
| CSS3           | Retro-styled theme (not included in JS files) |
| JavaScript     | App logic, interactivity         |
| Web Speech API | Voice recognition (in-browser)  |
| Audio API      | Feedback and navigation sounds   |

---

## 🛠️ Getting Started

1. Clone the repo:

    ```bash
    git clone https://github.com/your-username/battlefit.git
    cd battlefit
    ```

2. Open `index.html` in any modern browser (Chrome recommended for voice features).

3. Grant microphone and camera access when prompted.

---

## 🧑‍⚕️ Why It Matters

Sedentary lifestyles are increasingly common, especially in work-from-home or tech-heavy environments. BattleFit aims to reduce friction in staying active — no wearables, no app installs — just open your browser and move.

---

## 🧠 What We Learned

- How to use the Web Speech API for basic voice command support
- Structuring multi-file vanilla JS projects with modular design
- Designing gamified feedback loops to improve user engagement

---

## 📈 Future Improvements

- 📱 Fully responsive mobile layout
- 🏆 Leaderboards or PvP-style competitive challenges
- 🗣️ More advanced natural language commands

---

## 🙌 Built At

**TerraHacks 2025**  
Category: Healthcare
Time: 36 hours  
Team Size: 4 developers
