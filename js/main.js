// Exerbeasts - Complete Pokemon-style Battle Game
// Using Phaser.js for retro arcade battle system

import { Feedback } from './feedback.js';

console.log('Exerbeasts - Battle System Initializing...');

// Set your Gemini API key here (DO NOT use in production, for personal/local use only)
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key

// Initialize feedback system
const feedback = new Feedback(GEMINI_API_KEY);

const mole = document.getElementById("moleImage");

// Battle Game Configuration
const BATTLE_CONFIG = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: 800,
    height: 650,
    pixelArt: true,
    backgroundColor: '#000000',
    
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Enhanced Voice Command and Motivation System
class VoiceCommandController {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.motivationalPhrases = [
            "Amazing form!",
            "Great job!",
            "Perfect execution!",
            "You're crushing it!",
            "Fantastic technique!",
            "Keep it up, champion!",
            "Excellent work!",
            "Outstanding effort!",
            "You're on fire!",
            "Incredible power!",
            "Superb form!",
            "Way to go!",
            "Brilliant move!",
            "You're unstoppable!",
            "Phenomenal attack!"
        ];
        this.initializeSpeechRecognition();
        this.setupVoiceSettings();
    }

    initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            // Show a message to the user
            this.showSpeechRecognitionError();
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;

        this.recognition.onstart = () => {
            console.log('Voice command listening started');
            this.isListening = true;
            this.updateVoiceIndicator(true);
        };

        this.recognition.onend = () => {
            console.log('Voice command listening ended');
            this.isListening = false;
            this.updateVoiceIndicator(false);
            // Restart listening if battle is still active
            if (battleState && battleState.currentState === 'menu-selection' && !battleState.buttonsDisabled) {
                setTimeout(() => this.startListening(), 500);
            }
        };

        this.recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    const transcript = event.results[i][0].transcript.toLowerCase().trim();
                    console.log('Voice command heard:', transcript);
                    this.processVoiceCommand(transcript);
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.log('Speech recognition error:', event.error);
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                // Restart listening after a brief pause
                setTimeout(() => {
                    if (battleState && battleState.currentState === 'menu-selection' && !battleState.buttonsDisabled) {
                        this.startListening();
                    }
                }, 1000);
            } else if (event.error === 'not-allowed') {
                this.showMicrophonePermissionError();
            }
        };
    }

    setupVoiceSettings() {
        // Wait for voices to load
        const setupVoice = () => {
            const voices = speechSynthesis.getVoices();
            
            // Prefer female/child voices for a more cartoonish, happy sound
            const preferredVoices = voices.filter(voice => 
                voice.lang.startsWith('en') && (
                    voice.name.toLowerCase().includes('female') ||
                    voice.name.toLowerCase().includes('woman') ||
                    voice.name.toLowerCase().includes('girl') ||
                    voice.name.toLowerCase().includes('child') ||
                    voice.name.toLowerCase().includes('zira') ||
                    voice.name.toLowerCase().includes('hazel') ||
                    voice.name.toLowerCase().includes('karen') ||
                    voice.name.toLowerCase().includes('samantha')
                )
            );

            // If no preferred voices, fall back to any English voice
            this.selectedVoice = preferredVoices[0] || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            
            console.log('Selected voice:', this.selectedVoice?.name || 'Default');
        };

        // Setup immediately if voices are already loaded
        if (speechSynthesis.getVoices().length > 0) {
            setupVoice();
        } else {
            // Wait for voices to load
            speechSynthesis.addEventListener('voiceschanged', setupVoice, { once: true });
        }
    }

    processVoiceCommand(transcript) {
        if (!battleState || battleState.buttonsDisabled || battleState.currentState !== 'menu-selection') {
            return;
        }

        // Enhanced voice command mapping with more variations
        const commandMap = {
            'squat': ['squat', 'squad', 'squats', 'thunder stomp', 'thunder', 'stomp', 'attack', 'hit'],
            'lunge': ['lunge', 'lunch', 'lunges', 'swift strike', 'swift', 'strike', 'quick', 'fast'],
            'plank': ['plank', 'planks', 'iron defense', 'iron', 'defense', 'defend', 'block', 'shield'],
            'tpose': ['t pose', 'tpose', 't-pose', 'tea pose', 'intimidate', 'T pose', 'tee pose', 'teepose', 'intimidation']
        };

        // Check for command matches with improved matching
        for (const [moveType, commands] of Object.entries(commandMap)) {
            for (const command of commands) {
                if (transcript.includes(command)) {
                    console.log(`Voice command matched: ${command} -> ${moveType}`);
                    this.executeVoiceCommand(moveType);
                    return;
                }
            }
        }

        // Additional fuzzy matching for common variations
        const text = transcript.toLowerCase();
        if (text.includes('squat') || text.includes('thunder') || text.includes('stomp')) {
            console.log('Voice command matched: squat variation');
            this.executeVoiceCommand('squat');
            return;
        }
        if (text.includes('lunge') || text.includes('swift') || text.includes('strike')) {
            console.log('Voice command matched: lunge variation');
            this.executeVoiceCommand('lunge');
            return;
        }
        if (text.includes('plank') || text.includes('iron') || text.includes('defense')) {
            console.log('Voice command matched: plank variation');
            this.executeVoiceCommand('plank');
            return;
        }
        if (text.includes('t pose') || text.includes('tpose') || text.includes('intimidate')) {
            console.log('Voice command matched: tpose variation');
            this.executeVoiceCommand('tpose');
            return;
        }

        console.log('No matching voice command found for:', transcript);
    }

    executeVoiceCommand(moveType) {
        // Stop listening temporarily to prevent interference
        this.stopListening();

        // Trigger the button click effect
        const button = document.querySelector(`[data-move="${moveType}"]`);
        if (button) {
            // Visual feedback
            button.style.transform = 'scale(0.95)';
            button.style.filter = 'brightness(1.3)';
            
            setTimeout(() => {
                button.style.transform = '';
                button.style.filter = '';
            }, 200);

            // Execute the move
            if (battleState) {
                battleState.processPlayerMove(moveType);
            }
        }
        
        // Restart listening after a delay to allow the move to process
        setTimeout(() => {
            if (battleState && battleState.currentState === 'menu-selection' && !battleState.buttonsDisabled) {
                this.startListening();
            }
        }, 2000);
    }

    speakMotivation() {
        if (!speechSynthesis) return;

        // Stop any current speech
        speechSynthesis.cancel();

        // Random motivational phrase
        const phrase = this.motivationalPhrases[Math.floor(Math.random() * this.motivationalPhrases.length)];
        
        const utterance = new SpeechSynthesisUtterance(phrase);
        
        // Cartoonish, happy voice settings
        utterance.rate = 1.1; // Slightly faster for energy
        utterance.pitch = 1.4; // Higher pitch for cartoonish effect
        utterance.volume = 0.8;
        
        // Use the selected voice if available
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }

        // Add some enthusiasm with emphasis
        utterance.addEventListener('start', () => {
            console.log('Speaking motivation:', phrase);
        });

        speechSynthesis.speak(utterance);
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.log('Error starting voice recognition:', error);
            }
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    updateVoiceIndicator(isListening) {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            const pulseDot = indicator.querySelector('div[style*="animation: pulse"]');
            if (pulseDot) {
                pulseDot.style.background = isListening ? '#00FF00' : '#FF0000';
            }
        }
    }

    showSpeechRecognitionError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            z-index: 10000;
            text-align: center;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <h3>🎤 Voice Commands Not Available</h3>
            <p>Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari for voice commands.</p>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 8px 16px; border: none; border-radius: 5px; background: white; color: red; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(errorDiv);
    }

    showMicrophonePermissionError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 165, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            z-index: 10000;
            text-align: center;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <h3>🎤 Microphone Permission Required</h3>
            <p>Please allow microphone access to use voice commands. Click the microphone icon in your browser's address bar.</p>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 8px 16px; border: none; border-radius: 5px; background: white; color: orange; cursor: pointer;">OK</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Enhanced Battle State Management
class BattleState {
    constructor() {
        this.currentState = 'menu-selection';
        
        // Character stats
        this.playerHP = 100;
        this.enemyHP = 100;
        this.playerMaxHP = 100;
        this.enemyMaxHP = 100;
        
        // Status effects
        this.playerDefenseBoost = 0; // Turns remaining for Iron Defense
        this.enemyConfused = false; // Intimidate effect
        this.defenseMultiplier = 1.0;
        
        // Battle flow
        this.battleText = 'What will you do?';
        this.turnCount = 0;
        this.buttonsDisabled = false;
        
        // Move queue for Swift Strike priority
        this.playerMove = null;
        this.swiftStrikeUsed = false;
        
        // Pose confirmation system
        this.waitingForPose = false;
        this.requiredPose = null;
        this.selectedMove = null;
        
        // Pose confirmation system
        this.waitingForPose = false;
        this.requiredPose = null;
        this.selectedMove = null;
    }
    
    updateState(newState) {
        this.currentState = newState;
        console.log(`Battle state changed to: ${newState}`);
    }
    
    // Process player move selection
    processPlayerMove(moveType) {
        if (this.buttonsDisabled) return;
        
        // Store the selected move and prompt for pose
        this.selectedMove = moveType;
        this.waitingForPose = true;
        
        // Map moves to required poses and display names
        const moveData = {
            'squat': { pose: 'squat', name: 'Thunder Stomp', instruction: 'Perform a SQUAT to execute Thunder Stomp!' },
            'lunge': { pose: 'lunge', name: 'Swift Strike', instruction: 'Perform a LUNGE to execute Swift Strike!' },
            'plank': { pose: 'plank', name: 'Iron Defense', instruction: 'Perform a PLANK to execute Iron Defense!' },
            'tpose': { pose: 't-pose', name: 'Intimidate', instruction: 'Perform a T-POSE to execute Intimidate!' }
        };
        
        const moveInfo = moveData[moveType];
        if (moveInfo) {
            this.requiredPose = moveInfo.pose;
            this.updateBattleText(moveInfo.instruction);
            
            // Disable action buttons while waiting for pose
            this.disableActionButtons();
            
            console.log(`Waiting for ${moveInfo.pose} pose to execute ${moveInfo.name}`);
        }
    }
    
    // Execute player's move (called after pose confirmation)
    executePlayerMove() {
        const moveType = this.selectedMove;
        let damage = 0;
        let moveName = '';
        
        // Reset pose waiting state
        this.waitingForPose = false;
        this.requiredPose = null;
        this.playerMove = moveType;
        
        switch(moveType) {
            case 'squat': // Thunder Stomp
                damage = 20; // 20 damage
                moveName = 'Thunder Stomp';
                this.enemyHP = Math.max(0, this.enemyHP - damage);
                this.updateBattleText(`You used ${moveName}! Enemy took ${damage} damage!`);
                
                // Play player attack animation FIRST
                playPlayerSquatAttackAnimation(() => {
                    // After player animation completes, play enemy hurt animation
                    playEnemyHurtAnimation();
                    
                    // Add motivational speech after successful attack
                    setTimeout(() => {
                        if (window.voiceController) {
                            window.voiceController.speakMotivation();
                        }
                    }, 1000);
                    
                    setTimeout(() => {
                        this.animateEnemyHPDecrease();
                        
                        // Check for victory AFTER HP animation completes
                        setTimeout(() => {
                            if (this.enemyHP <= 0) {
                                this.handleVictory();
                                return;
                            }
                            // Proceed to enemy turn
                            this.updateState('enemy-turn');
                            setTimeout(() => this.processEnemyTurn(), 1000);
                        }, 1000); // Wait for HP animation to finish
                    }, 500); // Delay HP animation slightly
                });
                return; // Exit early since we handle turn progression in animation callback
                
            case 'lunge': // Swift Strike
                damage = 25; //25 damage 
                moveName = 'Swift Strike';
                this.enemyHP = Math.max(0, this.enemyHP - damage);
                this.updateBattleText(`You used ${moveName}! Enemy took ${damage} damage!`);
                
                // Play player lunge attack animation FIRST
                playPlayerLungeAttackAnimation(() => {
                    // After player animation completes, play enemy hurt animation
                    playEnemyHurtAnimation();
                    
                    // Add motivational speech after successful attack
                    setTimeout(() => {
                        if (window.voiceController) {
                            window.voiceController.speakMotivation();
                        }
                    }, 1000);
                    
                    setTimeout(() => {
                        this.animateEnemyHPDecrease();
                        
                        // Check for victory AFTER HP animation completes
                        setTimeout(() => {
                            if (this.enemyHP <= 0) {
                                this.handleVictory();
                                return;
                            }
                            // Proceed to enemy turn
                            this.updateState('enemy-turn');
                            setTimeout(() => this.processEnemyTurn(), 1000);
                        }, 1000); // Wait for HP animation to finish
                    }, 500); // Delay HP animation slightly
                });
                return; // Exit early since we handle turn progression in animation callback
                
            case 'plank': // Iron Defense
                moveName = 'Iron Defense';
                this.playerDefenseBoost = 2;
                this.defenseMultiplier = 0.5;
                this.updateBattleText(`You used ${moveName}! Defense increased!`);
                
                // Play player plank animation
                playPlayerPlankAnimation(() => {
                    // No enemy reaction for defensive move, just proceed
                    setTimeout(() => {
                        // Only proceed to enemy turn if enemy is still alive
                        if (this.enemyHP > 0) {
                            this.updateState('enemy-turn');
                            setTimeout(() => this.processEnemyTurn(), 1000);
                        }
                    }, 500);
                });
                return; // Exit early since we handle the turn progression in the animation callback
                
            case 'tpose': // Intimidate
                moveName = 'Intimidate';
                this.enemyConfused = true;
                this.updateBattleText(`You used ${moveName}! Enemy is confused!`);
                
                // Play player tpose animation
                playPlayerTposeAnimation(() => {
                    // No enemy reaction for intimidate move, just proceed
                    setTimeout(() => {
                        // Only proceed to enemy turn if enemy is still alive
                        if (this.enemyHP > 0) {
                            this.updateState('enemy-turn');
                            setTimeout(() => this.processEnemyTurn(), 1000);
                        }
                    }, 500);
                });
                return; // Exit early since we handle the turn progression in the animation callback
        }
    }
    
    // Process enemy turn
    processEnemyTurn() {
        // Check if enemy is confused (Intimidate effect)
        if (this.enemyConfused) {
            this.updateBattleText("Enemy's attack missed due to confusion!");
            this.enemyConfused = false; // Reset after one turn
            
            setTimeout(() => {
                this.endTurn();
            }, 2000);
            return;
        }
        
        // Enemy AI - random attack selection
        const enemyMoves = ['Tackle', 'Scratch', 'Bite'];
        const selectedMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
        
        // Calculate enemy damage
        let baseDamage = Math.floor(Math.random() * 15) + 10; // 10-24 damage range

        // Apply player's defense boost if active
        if (this.playerDefenseBoost > 0) {
            baseDamage = Math.floor(baseDamage * this.defenseMultiplier);
            this.playerDefenseBoost--;
            
            if (this.playerDefenseBoost <= 0) {
                this.defenseMultiplier = 1.0;
            }
        }

        // Apply damage to player
        this.playerHP = Math.max(0, this.playerHP - baseDamage);

         // Update battle text with enemy damage
        this.updateBattleText(`Enemy used ${selectedMove}! You took ${baseDamage} damage!`);
        
        // Play enemy attack animation FIRST, then player hurt animation
        playEnemyAttackAnimation(() => {
            // After enemy attack animation, play player hurt animation
            playPlayerHurtAnimation(() => {
                // Animate player HP decrease after hurt animation
                this.animatePlayerHPDecrease();
            });
        });
        
        // Check for defeat
        if (this.playerHP <= 0) {
            setTimeout(() => {
                this.handleDefeat();
            }, 1500); // Delay to let animations finish
            return;
        }
        
        // End turn after delay
        setTimeout(() => {
            this.endTurn();
        }, 3000); // Increased delay to account for enemy attack animation
    }
    
    // End turn and prepare for next player turn
    endTurn() {
        this.updateState('menu-selection');
        this.updateBattleText('What will you do?');
        
        // Reset pose confirmation state
        this.waitingForPose = false;
        this.requiredPose = null;
        this.selectedMove = null;
        
        // Re-enable action buttons after delay
        setTimeout(() => {
            this.enableActionButtons();
        }, 1000);
    }
    
    // Handle victory
    handleVictory() {
        this.updateState('victory');
        
        // Play death animation first, then show victory text
        playEnemyDeathAnimation(() => {
            this.updateBattleText('Enemy fainted! You win!');
            console.log('Player wins!');
        });
    }
    
    // Handle defeat
    handleDefeat() {
        this.updateState('defeat');
        
        // Play death animation first, then show defeat text
        playPlayerDeathAnimation(() => {
            this.updateBattleText('You fainted! Enemy wins!');
            console.log('Player defeated!');
        });
    }
    
    // Update battle text display
    updateBattleText(text) {
        this.battleText = text;
        const battleTextElement = document.getElementById('battle-text');
        if (battleTextElement) {
            battleTextElement.textContent = text;
        }
    }
    
    // Animate enemy HP bar decrease
    animateEnemyHPDecrease() {
        const targetPercentage = (this.enemyHP / this.enemyMaxHP) * 100;
        if (window.updateEnemyHPBar) {
            this.animateHPBar(window.updateEnemyHPBar, targetPercentage);
        }
        // Update HP text display
        if (window.updateEnemyHPText) {
            window.updateEnemyHPText(this.enemyHP, this.enemyMaxHP);
        }
    }
    
    // Animate player HP bar decrease
    animatePlayerHPDecrease() {
        const targetPercentage = (this.playerHP / this.playerMaxHP) * 100;
        if (window.updatePlayerHPBar) {
            this.animateHPBar(window.updatePlayerHPBar, targetPercentage);
        }
        // Update HP text display
        if (window.updatePlayerHPText) {
            window.updatePlayerHPText(this.playerHP, this.playerMaxHP);
        }
    }
    
    // Generic HP bar animation
    animateHPBar(updateFunction, targetPercentage) {
        // Get current HP percentage based on whether this is player or enemy
        let currentPercentage;
        if (updateFunction === window.updatePlayerHPBar) {
            currentPercentage = (this.playerHP / this.playerMaxHP) * 100;
        } else if (updateFunction === window.updateEnemyHPBar) {
            currentPercentage = (this.enemyHP / this.enemyMaxHP) * 100;
        } else {
            currentPercentage = 100; // fallback
        }
        
        const steps = 20;
        const difference = Math.abs(currentPercentage - targetPercentage);
        const stepSize = difference / steps;
        const isDecreasing = currentPercentage > targetPercentage;
        
        let animationPercentage = currentPercentage;
        
        const animate = () => {
            if (isDecreasing) {
                animationPercentage -= stepSize;
                if (animationPercentage <= targetPercentage) {
                    updateFunction(targetPercentage);
                    return;
                }
            } else {
                animationPercentage += stepSize;
                if (animationPercentage >= targetPercentage) {
                    updateFunction(targetPercentage);
                    return;
                }
            }
            updateFunction(animationPercentage);
            setTimeout(animate, 50);
        };
        
        animate();
    }
    
    // Disable action buttons
    disableActionButtons() {
        this.buttonsDisabled = true;
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.pointerEvents = 'none';
        });

        // Stop voice command listening
        if (window.voiceController) {
            window.voiceController.stopListening();
        }
    }
    
    // Enable action buttons
    enableActionButtons() {
        this.buttonsDisabled = false;
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
        });

        // Start voice command listening
        if (window.voiceController) {
            setTimeout(() => {
                window.voiceController.startListening();
            }, 500);
        }
    }
}

// Global variables
let battleState;
let game;
let gameScene;
let enemyHPBarGraphics;
let playerHPBarGraphics;
let enemySprite; // Added global enemy sprite variable
let playerSprite; // Added global player sprite variable

// Phaser.js Scene Functions
function preload() {
    console.log('Preloading assets...');
    this.load.image('forest-background', 'assets/forest-background.jpg');
    this.load.image('player-monster', 'assets/sprites/Pink_Monster/Pink_Monster.png');
    this.load.image('enemy-monster', 'assets/sprites/Owlet_Monster/Owlet_Monster.png');

    // Load player idle animation spritesheet
    this.load.spritesheet('player-idle-spritesheet', 'assets/sprites/Pink_Monster/Pink_Monster-idle.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load player squat attack animation spritesheet
    this.load.spritesheet('player-squat-attack-spritesheet', 'assets/sprites/Pink_Monster/Pink_Monster-squat-attack.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load player lunge attack animation spritesheet
    this.load.spritesheet('player-lunge-attack-spritesheet', 'assets/sprites/Pink_Monster/Pink_Monster-throw.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load player plank animation spritesheet (climb animation)
    this.load.spritesheet('player-plank-spritesheet', 'assets/sprites/Pink_Monster/Pink_Monster-climb.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load player t-pose animation spritesheet (jump animation)
    this.load.spritesheet('player-tpose-spritesheet', 'assets/sprites/Pink_Monster/Pink_Monster-jump.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load player hurt animation spritesheet
    this.load.spritesheet('player-hurt-spritesheet', 'assets/sprites/Pink_Monster/Pink_Monster-hurt.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load player death animation spritesheet
    this.load.spritesheet('player-death-spritesheet', 'assets/sprites/Pink_Monster/Pink_Monster-death.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load enemy idle animation spritesheet
    this.load.spritesheet('enemy-idle-spritesheet', 'assets/sprites/Owlet_Monster/Owlet_Monster-idle.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load enemy attack animation spritesheet
    this.load.spritesheet('enemy-attack-spritesheet', 'assets/sprites/Owlet_Monster/Owlet_Monster-attack.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load enemy hurt animation spritesheet
    this.load.spritesheet('enemy-hurt-spritesheet', 'assets/sprites/Owlet_Monster/Owlet_Monster-hurt.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    
    // Load enemy death animation spritesheet
    this.load.spritesheet('enemy-death-spritesheet', 'assets/sprites/Owlet_Monster/Owlet_Monster-death.png', {
        frameWidth: 32,
        frameHeight: 32
    });
}

function create() {
    console.log('Creating battle scene...');
    gameScene = this;
    
    // Initialize battle state
    battleState = new BattleState();
    
    // CREATE ANIMATIONS FIRST before creating monsters
    // Create the player idle animation (loops continuously)
    this.anims.create({
        key: 'player-idle',
        frames: this.anims.generateFrameNumbers('player-idle-spritesheet', { start: 0, end: 3 }),
        frameRate: 4, // Slow, peaceful idle animation
        repeat: -1 // Loop forever
    });

    // Create the player squat attack animation
    this.anims.create({
        key: 'player-squat-attack',
        frames: this.anims.generateFrameNumbers('player-squat-attack-spritesheet', { start: 0, end: 5 }),
        frameRate: 12, // Fast attack animation
        repeat: 0 // Play only once
    });

    // Create the player lunge attack animation (4 frames)
    this.anims.create({
        key: 'player-lunge-attack',
        frames: this.anims.generateFrameNumbers('player-lunge-attack-spritesheet', { start: 0, end: 3 }),
        frameRate: 10, // Medium speed attack animation
        repeat: 0 // Play only once
    });

    // Create the player plank animation (4 frames from climb spritesheet)
    this.anims.create({
        key: 'player-plank',
        frames: this.anims.generateFrameNumbers('player-plank-spritesheet', { start: 0, end: 3 }),
        frameRate: 6, // Slower, more controlled animation for defensive move
        repeat: 0 // Play only once
    });

    // Create the player t-pose animation (8 frames from jump spritesheet)
    this.anims.create({
        key: 'player-tpose',
        frames: this.anims.generateFrameNumbers('player-tpose-spritesheet', { start: 0, end: 7 }),
        frameRate: 8, // Medium speed for intimidating effect
        repeat: 0 // Play only once
    });

    // Create the player hurt animation (4 frames)
    this.anims.create({
        key: 'player-hurt',
        frames: this.anims.generateFrameNumbers('player-hurt-spritesheet', { start: 0, end: 3 }),
        frameRate: 8, // Medium speed hurt animation
        repeat: 0 // Play only once
    });
    
    // Create the player death animation (8 frames, slower animation)
    this.anims.create({
        key: 'player-death',
        frames: this.anims.generateFrameNumbers('player-death-spritesheet', { start: 0, end: 7 }),
        frameRate: 6, // Slower frame rate for dramatic effect
        repeat: 0 // Play only once
    });
    
    // Create the enemy idle animation (loops continuously)
    this.anims.create({
        key: 'enemy-idle',
        frames: this.anims.generateFrameNumbers('enemy-idle-spritesheet', { start: 0, end: 3 }),
        frameRate: 4, // Slow, peaceful idle animation
        repeat: -1 // Loop forever
    });
    
    // Create the enemy attack animation (6 frames)
    this.anims.create({
        key: 'enemy-attack',
        frames: this.anims.generateFrameNumbers('enemy-attack-spritesheet', { start: 0, end: 5 }),
        frameRate: 10, // Medium speed attack animation
        repeat: 0 // Play only once
    });
    
    // Create the enemy hurt animation
    this.anims.create({
        key: 'enemy-hurt',
        frames: this.anims.generateFrameNumbers('enemy-hurt-spritesheet', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
    });
    
    // Create the enemy death animation (8 frames, slower animation)
    this.anims.create({
        key: 'enemy-death',
        frames: this.anims.generateFrameNumbers('enemy-death-spritesheet', { start: 0, end: 7 }),
        frameRate: 6, // Slower frame rate for dramatic effect
        repeat: 0 // Play only once
    });
    
    createBackground(this);
    createPlatforms(this);
    createMonsters(this);
    createUI(this);
    
    console.log('Battle scene created successfully!');
}

function update() {
    // Update game logic here
}

// Background Creation
function createBackground(scene) {
    const background = scene.add.image(400, 230, 'forest-background');
    background.setDisplaySize(800, 460);
    background.setOrigin(0.5, 0.5);
    
    // Add border around the background image
    const backgroundBorder = scene.add.graphics();
    backgroundBorder.lineStyle(6, 0x00ACC1);
    backgroundBorder.strokeRect(0, 0, 800, 460);
}

// Platform Creation
function createPlatforms(scene) {
    // Enemy platform (top-right)
    const enemyPlatform = scene.add.graphics();
    enemyPlatform.fillStyle(0x2E7D32);
    enemyPlatform.fillEllipse(570, 230, 120, 60);
    enemyPlatform.lineStyle(3, 0xFFFFFF);
    enemyPlatform.strokeEllipse(570, 230, 120, 60);
    
    // Player platform (bottom-left)
    const playerPlatform = scene.add.graphics();
    playerPlatform.fillStyle(0x2E7D32);
    playerPlatform.fillEllipse(200, 350, 150, 80);
    playerPlatform.lineStyle(3, 0xFFFFFF);
    playerPlatform.strokeEllipse(200, 350, 150, 80);
}

// Monster Creation
function createMonsters(scene) {
    // Player monster (bottom-left platform) - Store reference globally for animations
    playerSprite = scene.add.sprite(200, 350, 'player-idle-spritesheet');
    playerSprite.setOrigin(0.5, 0.9); // Center the image
    playerSprite.setScale(4.5); // Adjust scale as needed
    
    // Start the player idle animation immediately
    playerSprite.play('player-idle');
    
    // Enemy monster (top-right platform) - Store reference globally and start with idle animation
    enemySprite = scene.add.sprite(565, 225, 'enemy-idle-spritesheet');
    enemySprite.setOrigin(0.5, 0.9); // Center the image
    enemySprite.setScale(3.5); // Adjust scale as needed
    
    // Start the enemy idle animation immediately
    enemySprite.play('enemy-idle');
}

// UI Creation - CLEAN IMPLEMENTATION
function createUI(scene) {
    // Enemy info box (top-left)
    const enemyInfoBox = scene.add.graphics();
    enemyInfoBox.fillStyle(0x000000);
    enemyInfoBox.fillRect(20, 20, 200, 80);
    enemyInfoBox.lineStyle(2, 0xFFFFFF);
    enemyInfoBox.strokeRect(20, 20, 200, 80);
    
    // Enemy name and level
    scene.add.text(30, 30, 'ENEMY', { 
        fontSize: '16px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    scene.add.text(30, 50, 'Lv. 25', { 
        fontSize: '14px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    
    // Enemy HP text display
    const enemyHPText = scene.add.text(130, 30, '100/100 HP', { 
        fontSize: '14px', 
        fill: '#FF0000',
        fontFamily: 'Courier New'
    });
    enemyHPText.setName('enemyHPText'); // Set name for easy reference
    
    // Initialize Enemy HP bar (RED ONLY)
    enemyHPBarGraphics = scene.add.graphics();
    
    // Player info box (bottom-right)
    const playerInfoBox = scene.add.graphics();
    playerInfoBox.fillStyle(0x000000);
    playerInfoBox.fillRect(580, 360, 200, 80);
    playerInfoBox.lineStyle(2, 0xFFFFFF);
    playerInfoBox.strokeRect(580, 360, 200, 80);
    
    // Player name and level
    scene.add.text(590, 370, 'YOU', { 
        fontSize: '16px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    scene.add.text(590, 390, 'Lv. 30', { 
        fontSize: '14px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    
    // Player HP text display
    const playerHPText = scene.add.text(650, 370, '100/100 HP', { 
        fontSize: '14px', 
        fill: '#00FF00',
        fontFamily: 'Courier New'
    });
    playerHPText.setName('playerHPText'); // Set name for easy reference
    
    // Initialize Player HP bar
    playerHPBarGraphics = scene.add.graphics();
    
    // Draw initial HP bars
    updateEnemyHPBar(100);
    updatePlayerHPBar(100);
    
    // Initialize HP text displays
    if (window.updateEnemyHPText) {
        window.updateEnemyHPText(100, 100);
    }
    if (window.updatePlayerHPText) {
        window.updatePlayerHPText(100, 100);
    }

    // Start voice detection for the first attack
    if (typeof battleState !== 'undefined' && battleState && typeof battleState.enableActionButtons === 'function') {
        battleState.enableActionButtons();
    }
}

// ANIMATION FUNCTIONS
// Enemy Attack Animation Function
function playEnemyAttackAnimation(onComplete) {
    console.log('Playing enemy attack animation...');
    
    if (enemySprite && gameScene) {
        // Store original position and scale
        const originalX = enemySprite.x;
        const originalY = enemySprite.y;
        const originalScale = enemySprite.scaleX;
        
        // Check if the spritesheet was loaded
        if (!gameScene.textures.exists('enemy-attack-spritesheet')) {
            console.error('enemy-attack-spritesheet not found! Using idle animation instead.');
            if (onComplete) onComplete();
            return;
        }
        
        // Remove the current sprite
        enemySprite.destroy();
        
        // Create animated sprite in same position
        enemySprite = gameScene.add.sprite(originalX, originalY, 'enemy-attack-spritesheet');
        enemySprite.setOrigin(0.5, 0.9);
        enemySprite.setScale(originalScale);
        
        // Play the attack animation
        enemySprite.play('enemy-attack');
        
        // When animation finishes, switch back to idle animation
        enemySprite.on('animationcomplete-enemy-attack', () => {
            console.log('Enemy attack animation completed, switching back to idle');
            
            // Remove attack sprite
            enemySprite.destroy();
            
            // Recreate sprite with idle animation
            enemySprite = gameScene.add.sprite(originalX, originalY, 'enemy-idle-spritesheet');
            enemySprite.setOrigin(0.5, 0.9);
            enemySprite.setScale(originalScale);
            
            // Start idle animation
            enemySprite.play('enemy-idle');
            
            // Call the completion callback if provided
            if (onComplete) {
                onComplete();
            }
        });
    } else {
        console.error('enemySprite or gameScene not available');
        if (onComplete) onComplete();
    }
}

// Enemy Hurt Animation Function
function playEnemyHurtAnimation() {
    console.log('Playing enemy hurt animation...');
    
    if (enemySprite && gameScene) {
        // Store original position and scale
        const originalX = enemySprite.x;
        const originalY = enemySprite.y;
        const originalScale = enemySprite.scaleX;
        
        // Remove the current sprite
        enemySprite.destroy();
        
        // Create animated sprite in same position
        enemySprite = gameScene.add.sprite(originalX, originalY, 'enemy-hurt-spritesheet');
        enemySprite.setOrigin(0.5, 0.9);
        enemySprite.setScale(originalScale);
        
        // Play the hurt animation
        enemySprite.play('enemy-hurt');
        
        // When animation finishes, switch back to idle animation
        enemySprite.on('animationcomplete-enemy-hurt', () => {
            console.log('Hurt animation completed, switching back to idle');
            
            // Remove hurt sprite
            enemySprite.destroy();
            
            // Recreate sprite with idle animation
            enemySprite = gameScene.add.sprite(originalX, originalY, 'enemy-idle-spritesheet');
            enemySprite.setOrigin(0.5, 0.9);
            enemySprite.setScale(originalScale);
            
            // Start idle animation
            enemySprite.play('enemy-idle');
        });
    }
}

// Player Squat Attack Animation Function
function playPlayerSquatAttackAnimation(onComplete) {
    console.log('Playing player squat attack animation...');
    
    if (playerSprite && gameScene) {
        // Store original position and scale
        const originalX = playerSprite.x;
        const originalY = playerSprite.y;
        const originalScale = playerSprite.scaleX;
        
        // Remove the current sprite
        playerSprite.destroy();
        
        // Create animated sprite in same position
        playerSprite = gameScene.add.sprite(originalX, originalY, 'player-squat-attack-spritesheet');
        playerSprite.setOrigin(0.5, 0.9);
        playerSprite.setScale(originalScale);
        
        // Play the squat attack animation
        playerSprite.play('player-squat-attack');
        
        // When animation finishes, switch back to idle animation
        playerSprite.on('animationcomplete-player-squat-attack', () => {
            console.log('Squat attack animation completed, switching back to idle');
            
            // Remove attack sprite
            playerSprite.destroy();
            
            // Recreate sprite with idle animation
            playerSprite = gameScene.add.sprite(originalX, originalY, 'player-idle-spritesheet');
            playerSprite.setOrigin(0.5, 0.9);
            playerSprite.setScale(originalScale);
            
            // Start idle animation
            playerSprite.play('player-idle');
            
            // Call the completion callback if provided
            if (onComplete) {
                onComplete();
            }
        });
    }
}

// Player Lunge Attack Animation Function
function playPlayerLungeAttackAnimation(onComplete) {
    console.log('Playing player lunge attack animation...');
    
    if (playerSprite && gameScene) {
        // Store original position and scale
        const originalX = playerSprite.x;
        const originalY = playerSprite.y;
        const originalScale = playerSprite.scaleX;
        
        // Check if the spritesheet was loaded
        if (!gameScene.textures.exists('player-lunge-attack-spritesheet')) {
            console.error('player-lunge-attack-spritesheet not found! Using idle animation instead.');
            if (onComplete) onComplete();
            return;
        }
        
        // Remove the current sprite
        playerSprite.destroy();
        
        // Create animated sprite in same position
        playerSprite = gameScene.add.sprite(originalX, originalY, 'player-lunge-attack-spritesheet');
        playerSprite.setOrigin(0.5, 0.9);
        playerSprite.setScale(originalScale);
        
        // Play the lunge attack animation
        playerSprite.play('player-lunge-attack');
        
        // When animation finishes, switch back to idle animation
        playerSprite.on('animationcomplete-player-lunge-attack', () => {
            console.log('Lunge attack animation completed, switching back to idle');
            
            // Remove attack sprite
            playerSprite.destroy();
            
            // Recreate sprite with idle animation
            playerSprite = gameScene.add.sprite(originalX, originalY, 'player-idle-spritesheet');
            playerSprite.setOrigin(0.5, 0.9);
            playerSprite.setScale(originalScale);
            
            // Start idle animation
            playerSprite.play('player-idle');
            
            // Call the completion callback if provided
            if (onComplete) {
                onComplete();
            }
        });
    } else {
        console.error('playerSprite or gameScene not available');
        if (onComplete) onComplete();
    }
}

// Player Plank Animation Function
function playPlayerPlankAnimation(onComplete) {
    console.log('Playing player plank animation...');
    
    if (playerSprite && gameScene) {
        // Store original position and scale
        const originalX = playerSprite.x;
        const originalY = playerSprite.y;
        const originalScale = playerSprite.scaleX;
        
        // Check if the spritesheet was loaded
        if (!gameScene.textures.exists('player-plank-spritesheet')) {
            console.error('player-plank-spritesheet not found! Using idle animation instead.');
            if (onComplete) onComplete();
            return;
        }
        
        // Remove the current sprite
        playerSprite.destroy();
        
        // Create animated sprite in same position
        playerSprite = gameScene.add.sprite(originalX, originalY, 'player-plank-spritesheet');
        playerSprite.setOrigin(0.5, 0.9);
        playerSprite.setScale(originalScale);
        
        // Play the plank animation
        playerSprite.play('player-plank');
        
        // When animation finishes, switch back to idle animation
        playerSprite.on('animationcomplete-player-plank', () => {
            console.log('Plank animation completed, switching back to idle');
            
            // Remove plank sprite
            playerSprite.destroy();
            
            // Recreate sprite with idle animation
            playerSprite = gameScene.add.sprite(originalX, originalY, 'player-idle-spritesheet');
            playerSprite.setOrigin(0.5, 0.9);
            playerSprite.setScale(originalScale);
            
            // Start idle animation
            playerSprite.play('player-idle');
            
            // Call the completion callback if provided
            if (onComplete) {
                onComplete();
            }
        });
    } else {
        console.error('playerSprite or gameScene not available');
        if (onComplete) onComplete();
    }
}

// Player T-Pose Animation Function
function playPlayerTposeAnimation(onComplete) {
    console.log('Playing player t-pose animation...');
    
    if (playerSprite && gameScene) {
        // Store original position and scale
        const originalX = playerSprite.x;
        const originalY = playerSprite.y;
        const originalScale = playerSprite.scaleX;
        
        // Check if the spritesheet was loaded
        if (!gameScene.textures.exists('player-tpose-spritesheet')) {
            console.error('player-tpose-spritesheet not found! Using idle animation instead.');
            if (onComplete) onComplete();
            return;
        }
        
        // Remove the current sprite
        playerSprite.destroy();
        
        // Create animated sprite in same position
        playerSprite = gameScene.add.sprite(originalX, originalY, 'player-tpose-spritesheet');
        playerSprite.setOrigin(0.5, 0.9);
        playerSprite.setScale(originalScale);
        
        // Play the t-pose animation
        playerSprite.play('player-tpose');
        
        // When animation finishes, switch back to idle animation
        playerSprite.on('animationcomplete-player-tpose', () => {
            console.log('T-pose animation completed, switching back to idle');
            
            // Remove t-pose sprite
            playerSprite.destroy();
            
            // Recreate sprite with idle animation
            playerSprite = gameScene.add.sprite(originalX, originalY, 'player-idle-spritesheet');
            playerSprite.setOrigin(0.5, 0.9);
            playerSprite.setScale(originalScale);
            
            // Start idle animation
            playerSprite.play('player-idle');
            
            // Call the completion callback if provided
            if (onComplete) {
                onComplete();
            }
        });
    } else {
        console.error('playerSprite or gameScene not available');
        if (onComplete) onComplete();
    }
}

// Player Hurt Animation Function  
function playPlayerHurtAnimation(onComplete) {
    console.log('Playing player hurt animation...');
    
    if (playerSprite && gameScene) {
        // Store original position and scale
        const originalX = playerSprite.x;
        const originalY = playerSprite.y;
        const originalScale = playerSprite.scaleX;
        
        // Remove the current sprite
        playerSprite.destroy();
        
        // Create animated sprite in same position
        playerSprite = gameScene.add.sprite(originalX, originalY, 'player-hurt-spritesheet');
        playerSprite.setOrigin(0.5, 0.9);
        playerSprite.setScale(originalScale);
        
        // Play the hurt animation
        playerSprite.play('player-hurt');
        
        // When animation finishes, switch back to idle animation
        playerSprite.on('animationcomplete-player-hurt', () => {
            console.log('Player hurt animation completed, switching back to idle');
            
            // Remove hurt sprite
            playerSprite.destroy();
            
            // Recreate sprite with idle animation
            playerSprite = gameScene.add.sprite(originalX, originalY, 'player-idle-spritesheet');
            playerSprite.setOrigin(0.5, 0.9);
            playerSprite.setScale(originalScale);
            
            // Start idle animation
            playerSprite.play('player-idle');
            
            // Call the completion callback if provided
            if (onComplete) {
                onComplete();
            }
        });
    }
}

// Player Death Animation Function
function playPlayerDeathAnimation(onComplete) {
    console.log('Playing player death animation...');
    
    if (playerSprite && gameScene) {
        // Store original position and scale
        const originalX = playerSprite.x;
        const originalY = playerSprite.y;
        const originalScale = playerSprite.scaleX;
        
        // Remove the current sprite
        playerSprite.destroy();
        
        // Create animated sprite in same position
        playerSprite = gameScene.add.sprite(originalX, originalY, 'player-death-spritesheet');
        playerSprite.setOrigin(0.5, 0.9);
        playerSprite.setScale(originalScale);
        
        // Play the death animation
        playerSprite.play('player-death');
        
        // When animation finishes, switch to ghost sprite
        playerSprite.on('animationcomplete-player-death', () => {
            console.log('Player death animation completed, creating ghost');
            
            // Remove death sprite
            playerSprite.destroy();
            
            // Create ghost sprite using idle animation but with ghost effects
            playerSprite = gameScene.add.sprite(originalX, originalY, 'player-idle-spritesheet');
            playerSprite.setOrigin(0.5, 0.9);
            playerSprite.setScale(originalScale);
            
            // Apply ghost effects
            playerSprite.setAlpha(0.4); // More transparent for ghost effect
            playerSprite.setTint(0x88CCFF); // Light blue tint for ghostly appearance
            
            // Start slow idle animation for ghost
            playerSprite.play('player-idle');
            
            // Add floating ghost effect
            gameScene.tweens.add({
                targets: playerSprite,
                y: originalY - 10,
                duration: 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            // Call the completion callback if provided
            if (onComplete) {
                onComplete();
            }
        });
    }
}

// Enemy Death Animation Function
function playEnemyDeathAnimation(onComplete) {
    console.log('Playing enemy death animation...');
    mole.src = "assets/moleHappy.png";
    
    if (enemySprite && gameScene) {
        // Store original position and scale
        const originalX = enemySprite.x;
        const originalY = enemySprite.y;
        const originalScale = enemySprite.scaleX;
        
        // Remove the current sprite
        enemySprite.destroy();
        
        // Create animated sprite in same position
        enemySprite = gameScene.add.sprite(originalX, originalY, 'enemy-death-spritesheet');
        enemySprite.setOrigin(0.5, 0.9);
        enemySprite.setScale(originalScale);
        
        // Play the death animation
        enemySprite.play('enemy-death');
        
        // When animation finishes, call the completion callback
        enemySprite.on('animationcomplete-enemy-death', () => {
            console.log('Death animation completed');
            
            // Make the sprite slightly transparent to show it's fainted
            enemySprite.setAlpha(0.3);
            
            // Call the completion callback if provided
            if (onComplete) {
                onComplete();
            }
        });
    }
}

// Enemy HP Bar Update Function - RED ONLY
function updateEnemyHPBar(hpPercentage) {
    if (!enemyHPBarGraphics) return;
    
    enemyHPBarGraphics.clear();
    
    const maxWidth = 180;
    const currentWidth = (hpPercentage / 100) * maxWidth;
    
    // Background (empty bar)
    enemyHPBarGraphics.fillStyle(0x333333);
    enemyHPBarGraphics.fillRect(30, 70, maxWidth, 15);
    
    // Current HP bar - ALWAYS RED for enemy
    if (currentWidth > 0) {
        enemyHPBarGraphics.fillStyle(0xFF0000); // Always red for enemy
        enemyHPBarGraphics.fillRect(30, 70, currentWidth, 15);
    }
    
    // Border
    enemyHPBarGraphics.lineStyle(2, 0xFFFFFF);
    enemyHPBarGraphics.strokeRect(30, 70, maxWidth, 15);
}

// Player HP Bar Update Function - Color Changes
function updatePlayerHPBar(hpPercentage) {
    if (!playerHPBarGraphics) return;
    
    playerHPBarGraphics.clear();
    
    const maxWidth = 180;
    const currentWidth = (hpPercentage / 100) * maxWidth;
    
    // Determine color based on HP percentage
    let barColor;
    if (hpPercentage > 60) {
        barColor = 0x00FF00; // Green
    } else if (hpPercentage > 30) {
        barColor = 0xFFFF00; // Yellow
    } else {
        barColor = 0xFF0000; // Red
    }
    
    // Background (empty bar)
    playerHPBarGraphics.fillStyle(0x333333);
    playerHPBarGraphics.fillRect(590, 410, maxWidth, 15);
    
    // Current HP bar
    if (currentWidth > 0) {
        playerHPBarGraphics.fillStyle(barColor);
        playerHPBarGraphics.fillRect(590, 410, currentWidth, 15);
    }
    
    // Border
    playerHPBarGraphics.lineStyle(2, 0xFFFFFF);
    playerHPBarGraphics.strokeRect(590, 410, maxWidth, 15);
}

// Make HP bar functions globally accessible
window.updateEnemyHPBar = updateEnemyHPBar;
window.updatePlayerHPBar = updatePlayerHPBar;

// HP Text Update Functions
function updateEnemyHPText(currentHP, maxHP) {
    if (!gameScene) return;
    
    const enemyHPText = gameScene.children.getByName('enemyHPText');
    if (enemyHPText) {
        enemyHPText.setText(`${currentHP}/${maxHP} HP`);
        
        // Change color based on HP percentage
        const hpPercentage = (currentHP / maxHP) * 100;
        if (hpPercentage > 60) {
            enemyHPText.setFill('#FF0000'); // Red (enemy color)
        } else if (hpPercentage > 30) {
            enemyHPText.setFill('#FF6600'); // Orange-red
        } else {
            enemyHPText.setFill('#FF0000'); // Keep red for consistency
        }
    }
}

function updatePlayerHPText(currentHP, maxHP) {
    if (!gameScene) return;
    
    const playerHPText = gameScene.children.getByName('playerHPText');
    if (playerHPText) {
        playerHPText.setText(`${currentHP}/${maxHP} HP`);
        
        // Change color based on HP percentage
        const hpPercentage = (currentHP / maxHP) * 100;
        if (hpPercentage > 60) {
            playerHPText.setFill('#00FF00'); // Green
        } else if (hpPercentage > 30) {
            playerHPText.setFill('#FFFF00'); // Yellow
        } else {
            playerHPText.setFill('#FF0000'); // Red
        }
    }
}

// Make HP text functions globally accessible
window.updateEnemyHPText = updateEnemyHPText;
window.updatePlayerHPText = updatePlayerHPText;

// Add visual indicator for voice commands
function addVoiceCommandIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'voice-indicator';
    indicator.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 1000;
            border: 2px solid #00ACC1;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        ">
            🎤 Voice Commands Active
            <div style="
                width: 8px;
                height: 8px;
                background: #00FF00;
                border-radius: 50%;
                animation: pulse 2s infinite;
            "></div>
        </div>
        <style>
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(indicator);
    
    // Add voice command help tooltip
    const helpTooltip = document.createElement('div');
    helpTooltip.id = 'voice-help';
    helpTooltip.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 1000;
            border: 1px solid #00ACC1;
            max-width: 300px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        ">
            <strong>🎤 Voice Commands:</strong><br>
            • "Squat" or "Thunder Stomp"<br>
            • "Lunge" or "Swift Strike"<br>
            • "Plank" or "Iron Defense"<br>
            • "T Pose" or "Intimidate"
        </div>
    `;
    
    document.body.appendChild(helpTooltip);
}

// Initialize the game when the page loads
window.addEventListener('load', function() {
    console.log('Initializing Exerbeasts battle system...');
    game = new Phaser.Game(BATTLE_CONFIG);
    console.log('Exerbeasts battle system initialized!');
});

// Battle Interface Integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize voice controller
    window.voiceController = new VoiceCommandController();
    
    const battleText = document.getElementById('battle-text');
    const actionButtons = document.querySelectorAll('.action-btn');
    
    // Wait for battle state to be initialized
    const initializeBattle = () => {
        if (!battleState) {
            setTimeout(initializeBattle, 100);
            return;
        }
        
        // Set initial battle text
        if (battleText) {
            battleText.textContent = battleState.battleText;
        }
        
        // Add click listeners to action buttons
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const moveType = this.getAttribute('data-move');
                if (moveType && battleState) {
                    battleState.processPlayerMove(moveType);
                }
                
                // Visual feedback for button press (from partner's version)
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
            
            // Enhanced hover effects (from partner's version)
            button.addEventListener('mouseenter', function() {
                if (!this.disabled) {
                    this.style.filter = 'brightness(1.3)';
                }
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.filter = '';
            });
        });
        
        console.log('Battle interface and voice system fully integrated!');
        
        // Add voice command indicator
        addVoiceCommandIndicator();
        
        // Start voice listening when battle interface is ready
        setTimeout(() => {
            if (window.voiceController) {
                window.voiceController.startListening();
                console.log('Voice commands activated!');
            }
        }, 1000);
    };
    
    // Auto-initialize camera when page loads
    setTimeout(async () => {
        console.log('Auto-starting camera and pose detection...');
        await initTeachableMachine();
    }, 1000); // Small delay to ensure everything is loaded
    
    initializeBattle();
});

// Export for external access
window.battleState = battleState;
window.game = game;

// ===== TEACHABLE MACHINE POSE DETECTION =====

// Teachable Machine model URL - replace with your model URL
const URL = "https://teachablemachine.withgoogle.com/models/A3XU72N3c/";
let model, webcam, ctx, labelContainer, maxPredictions;

// Initialize Teachable Machine model and webcam
async function initTeachableMachine() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        // Load the model and metadata
        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Set up webcam - Square format for Teachable Machine
        const size = 224; // Standard Teachable Machine input size
        const flip = true; // whether to flip the webcam
        webcam = new tmPose.Webcam(size, size, flip);
        await webcam.setup();
        await webcam.play();
        
        // Clear the webcam container and append webcam element
        const webcamContainer = document.getElementById("webcam-container");
        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);
        
        // Set up label container (but don't display predictions)
        labelContainer = document.getElementById("label-container");
        
        // Start prediction loop
        window.requestAnimationFrame(loop);
        
        console.log("Camera and pose detection initialized successfully!");
        
    } catch (error) {
        console.error("Error initializing Teachable Machine:", error);
        document.getElementById("webcam-container").innerHTML = 
            "<p style='color: red;'>Error loading pose detection model. Please check the model URL.</p>";
    }
}

// Main prediction loop
async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

// Predict pose from webcam feed
async function predict() {
    try {
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        const prediction = await model.predict(posenetOutput);
        
        // Find the pose with highest confidence (don't display predictions under webcam)
        let highestConfidence = 0;
        let detectedPose = "";
        
        for (let i = 0; i < maxPredictions; i++) {
            if (prediction[i].probability > highestConfidence) {
                highestConfidence = prediction[i].probability;
                detectedPose = prediction[i].className;
            }
        }
        
        // Update the game canvas pose display
        updatePoseDisplay(detectedPose, highestConfidence);
        
        // Log detected pose if confidence is high enough
        if (highestConfidence > 0.7) {
            console.log(`Detected pose: ${detectedPose} (${(highestConfidence * 100).toFixed(1)}% confidence)`);
            
            // Auto-trigger battle moves based on detected pose
            triggerBattleMoveFromPose(detectedPose, highestConfidence);
        }
        
    } catch (error) {
        console.error("Prediction error:", error);
    }
}

// Update the pose display in the game canvas
function updatePoseDisplay(pose, confidence) {
    const poseTextElement = document.querySelector('.pose-text');
    const confidenceTextElement = document.querySelector('.confidence-text');
    
    if (!poseTextElement || !confidenceTextElement) return;
    
    // Check if we're waiting for a specific pose
    if (battleState && battleState.waitingForPose) {
        // Show what pose is required
        poseTextElement.textContent = `Required: ${battleState.requiredPose.toUpperCase()}`;
        
        // Check if current pose matches required pose
        const normalizedPose = pose.toLowerCase();
        const requiredPose = battleState.requiredPose.toLowerCase();
        let poseMatches = false;
        
        if (requiredPose.includes('squat') && normalizedPose.includes('squat')) {
            poseMatches = true;
        } else if (requiredPose.includes('lunge') && normalizedPose.includes('lunge')) {
            poseMatches = true;
        } else if (requiredPose.includes('plank') && normalizedPose.includes('plank')) {
            poseMatches = true;
        } else if (requiredPose.includes('t-pose') && (normalizedPose.includes('t-pose') || normalizedPose.includes('tpose'))) {
            poseMatches = true;
        }
        
        if (poseMatches && confidence > 0.8) {
            confidenceTextElement.textContent = `✓ POSE DETECTED! ${(confidence * 100).toFixed(1)}%`;
            poseTextElement.style.color = '#00FF00'; // Green for success
            mole.src = "assets/moleHappy.png";
            confidenceTextElement.style.color = '#00FF00';
        } else if (confidence > 0.5) {
            confidenceTextElement.textContent = `Current: ${pose} (${(confidence * 100).toFixed(1)}%)`;
            poseTextElement.style.color = '#FFFF00'; // Yellow for waiting
            confidenceTextElement.style.color = '#FFFF00';
        } else {
            confidenceTextElement.textContent = `Waiting for ${battleState.requiredPose}...`;
            poseTextElement.style.color = '#FFFF00'; // Yellow for waiting
            confidenceTextElement.style.color = '#FFFF00';
        }
        return;
    }
    
    // Normal pose display when not waiting for specific pose
    if (confidence > 0.5) {
        poseTextElement.textContent = pose;
        confidenceTextElement.textContent = `${(confidence * 100).toFixed(1)}% Confidence`;
    } else {
        poseTextElement.textContent = "No Pose Detected";
        confidenceTextElement.textContent = "0% Confidence";
    }
    
    // Define colors for different poses
    const poseColors = {
        'Squat': '#f30a0aff',      // Arcade Purple (matches squat button)
        'Lunge': '#00ACC1',      // Retro Teal (matches lunge button)
        'T-Pose': '#6100feff',     // Classic Black (matches tpose button)
        'Stand': '#FFFFFF',      // White
        'Plank': '#FF9800',       // Pixel Orange (matches plank button)
        'default': '#FFFFFF'     // White
    };
    
    // Set color based on pose (case-insensitive)
    const normalizedPose = pose.toLowerCase();
    let color = poseColors['default'];
    
    for (const [poseName, poseColor] of Object.entries(poseColors)) {
        if (normalizedPose.includes(poseName.toLowerCase())) {
            color = poseColor;
            break;
        }
    }
    
    // Apply color with confidence-based intensity
    if (confidence > 0.5) {
        poseTextElement.style.color = color;
        confidenceTextElement.style.color = color;
    } else {
        poseTextElement.style.color = '#666666'; // Gray for low confidence
        confidenceTextElement.style.color = '#666666';
    }
}

// Auto-trigger battle moves based on detected pose (only when waiting for pose confirmation)
function triggerBattleMoveFromPose(pose, confidence) {
    if (!battleState || !battleState.waitingForPose || confidence < 0.8) {
        return; // Don't trigger if not waiting for pose or confidence is too low
    }
    
    // Extra safety check to prevent multiple executions
    if (battleState.currentState !== 'menu-selection') {
        return; // Don't execute if we're not in the right battle state
    }
    
    const normalizedPose = pose.toLowerCase();
    const requiredPose = battleState.requiredPose.toLowerCase();
    
    // Check if the detected pose matches the required pose
    let poseMatches = false;
    
    if (requiredPose.includes('squat') && normalizedPose.includes('squat')) {
        poseMatches = true;
    } else if (requiredPose.includes('lunge') && normalizedPose.includes('lunge')) {
        poseMatches = true;
    } else if (requiredPose.includes('plank') && normalizedPose.includes('plank')) {
        poseMatches = true;
    } else if (requiredPose.includes('t-pose') && (normalizedPose.includes('t-pose') || normalizedPose.includes('tpose'))) {
        poseMatches = true;
    }
    
    // Execute the move if the correct pose is detected
    if (poseMatches) {
        console.log(`Correct pose detected! Executing ${battleState.selectedMove}...`);
        mole.src = "assets/moleHappy.png";
        // IMMEDIATELY reset pose waiting state to prevent multiple executions
        battleState.waitingForPose = false;
        
        // Visual feedback - briefly highlight the corresponding button
        const button = document.querySelector(`[data-move="${battleState.selectedMove}"]`);
        if (button) {
            button.style.transform = 'scale(1.1)';
            button.style.filter = 'brightness(1.5)';
            setTimeout(() => {
                button.style.transform = '';
                button.style.filter = '';
            }, 500);
        }
        
        // Add a brief confirmation message before executing
        battleState.updateBattleText(`Perfect ${pose}! Executing attack...`);

        // snaps a screenshot of the webcam canvas and gives feedback
        if (!webcam || !webcam.canvas) {
            console.error("Webcam not initialized or canvas not available.");
            return;
        }
        const image = webcam.canvas;
        const dataURL = webcam.canvas.toDataURL('image/png');
        callFeedback(dataURL, pose);
        
        // Execute the move after a short delay, after feedback is done
        setTimeout(() => {
            battleState.executePlayerMove();
        }, 1000);
        mole.src = "assets/mole.png";
    }
}

// gemini feedback
async function callFeedback(file, exercise) {
    try {
        const result = await feedback.analyzeFitnessImage(file, exercise);
        //${result.mood};
        // Speak the feedback using Web Speech API
        if ('speechSynthesis' in window && result && result.feedback) {
            const utter = new SpeechSynthesisUtterance(result.feedback);
            window.speechSynthesis.speak(utter);
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
}

