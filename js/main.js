// Exerbeasts - Complete Pokemon-style Battle Game
// Using Phaser.js for retro arcade battle system

console.log('Exerbeasts - Battle System Initializing...');

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
                this.animateEnemyHPDecrease();
                break;
                
            case 'lunge': // Swift Strike
                damage = 25; //25 damage 
                moveName = 'Swift Strike';
                this.enemyHP = Math.max(0, this.enemyHP - damage);
                this.updateBattleText(`You used ${moveName}! Enemy took ${damage} damage!`);
                this.animateEnemyHPDecrease();
                break;
                
            case 'plank': // Iron Defense
                moveName = 'Iron Defense';
                this.playerDefenseBoost = 2;
                this.defenseMultiplier = 0.5;
                this.updateBattleText(`You used ${moveName}! Defense increased!`);
                break;
                
            case 'tpose': // Intimidate
                moveName = 'Intimidate';
                this.enemyConfused = true;
                this.updateBattleText(`You used ${moveName}! Enemy is confused!`);
                break;
        }
        
        // Check for victory
        if (this.enemyHP <= 0) {
            this.handleVictory();
            return;
        }
        
        // Proceed to enemy turn
        this.updateState('enemy-turn');
        setTimeout(() => this.processEnemyTurn(), 2000);
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
        
        // Animate player HP decrease
        this.animatePlayerHPDecrease();
        
        // Check for defeat
        if (this.playerHP <= 0) {
            this.handleDefeat();
            return;
        }
        
        // End turn after delay
        setTimeout(() => {
            this.endTurn();
        }, 2000);
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
        this.updateBattleText('Enemy fainted! You win!');
        console.log('Player wins!');
    }
    
    // Handle defeat
    handleDefeat() {
        this.updateState('defeat');
        this.updateBattleText('You fainted! Enemy wins!');
        console.log('Player defeated!');
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
    }
}

// Global variables
let battleState;
let game;
let gameScene;
let enemyHPBarGraphics;
let playerHPBarGraphics;

// Phaser.js Scene Functions
function preload() {
    console.log('Preloading assets...');
    this.load.image('forest-background', 'assets/forest-background.jpg');
    this.load.image('player-monster', 'assets/sprites/Pink_Monster/Pink_Monster.png');
    this.load.image('enemy-monster', 'assets/sprites/Owlet_Monster/Owlet_Monster.png');
}

function create() {
    console.log('Creating battle scene...');
    gameScene = this;
    
    // Initialize battle state
    battleState = new BattleState();
    
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
    // Player monster (bottom-left platform) - Now uses sprite image
    const playerMonster = scene.add.image(200, 350, 'player-monster');
    playerMonster.setOrigin(0.5, 0.9); // Center the image
    playerMonster.setScale(4.5); // Adjust scale as needed (0.5 = 50% of original size)
    
    // Enemy monster (top-right platform)
    const enemyMonster = scene.add.image(565, 225, 'enemy-monster');
    enemyMonster.setOrigin(0.5, 0.9); // Center the image
    enemyMonster.setScale(3.5); // Adjust scale as needed (0.5 = 50% of original size)
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

// Initialize the game when the page loads
window.addEventListener('load', function() {
    console.log('Initializing Exerbeasts battle system...');
    game = new Phaser.Game(BATTLE_CONFIG);
    console.log('Exerbeasts battle system initialized!');
});

// Battle Interface Integration
document.addEventListener('DOMContentLoaded', function() {
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
        
        console.log('Battle interface fully integrated!');
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
        'Squat': '#8E24AA',      // Arcade Purple (matches squat button)
        'Lunge': '#00ACC1',      // Retro Teal (matches lunge button)
        'T-Pose': '#000000',     // Classic Black (matches tpose button)
        'Stand': '#FFFFFF',      // White
        'Plank': '#FF9800',      // Pixel Orange (matches plank button)
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
        
        // Execute the move after a short delay
        setTimeout(() => {
            battleState.executePlayerMove();
        }, 1000);
    }
}
