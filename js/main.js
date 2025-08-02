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
    }
    
    updateState(newState) {
        this.currentState = newState;
        console.log(`Battle state changed to: ${newState}`);
    }
    
    // Process player move selection
    processPlayerMove(moveType) {
        if (this.buttonsDisabled) return;
        
        this.playerMove = moveType;
        this.disableActionButtons();
        
        // Check if Swift Strike for priority
        if (moveType === 'lunge') {
            this.swiftStrikeUsed = true;
            this.executePlayerMove();
        } else {
            this.swiftStrikeUsed = false;
            this.executePlayerMove();
        }
    }
    
    // Execute player's move
    executePlayerMove() {
        const moveType = this.playerMove;
        let damage = 0;
        let moveName = '';
        
        switch(moveType) {
            case 'squat': // Thunder Stomp
                damage = Math.floor(Math.random() * 6) + 25; // 25-30 damage
                moveName = 'Thunder Stomp';
                this.enemyHP = Math.max(0, this.enemyHP - damage);
                this.updateBattleText(`You used ${moveName}! Enemy took ${damage} damage!`);
                this.animateEnemyHPDecrease();
                break;
                
            case 'lunge': // Swift Strike
                damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
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
        let baseDamage = Math.floor(Math.random() * 15) + 10; // 10-25 base damage
        
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
    }
    
    // Animate player HP bar decrease
    animatePlayerHPDecrease() {
        const targetPercentage = (this.playerHP / this.playerMaxHP) * 100;
        if (window.updatePlayerHPBar) {
            this.animateHPBar(window.updatePlayerHPBar, targetPercentage);
        }
    }
    
    // Generic HP bar animation
    animateHPBar(updateFunction, targetPercentage) {
        let currentPercentage = 100;
        const steps = 20;
        const stepSize = (100 - targetPercentage) / steps;
        
        const animate = () => {
            currentPercentage -= stepSize;
            if (currentPercentage <= targetPercentage) {
                updateFunction(targetPercentage);
                return;
            }
            updateFunction(currentPercentage);
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
    backgroundBorder.lineStyle(6, 0x8E24AA);
    backgroundBorder.strokeRect(0, 0, 800, 460);
}

// Platform Creation
function createPlatforms(scene) {
    // Enemy platform (top-right)
    const enemyPlatform = scene.add.graphics();
    enemyPlatform.fillStyle(0x2E7D32);
    enemyPlatform.fillEllipse(600, 150, 120, 60);
    enemyPlatform.lineStyle(3, 0xFFFFFF);
    enemyPlatform.strokeEllipse(600, 150, 120, 60);
    
    // Player platform (bottom-left)
    const playerPlatform = scene.add.graphics();
    playerPlatform.fillStyle(0x2E7D32);
    playerPlatform.fillEllipse(200, 350, 150, 80);
    playerPlatform.lineStyle(3, 0xFFFFFF);
    playerPlatform.strokeEllipse(200, 350, 150, 80);
}

// Monster Creation
function createMonsters(scene) {
    // Player monster (bottom-left platform)
    const playerMonster = scene.add.graphics();
    playerMonster.fillStyle(0x8E24AA);
    playerMonster.fillCircle(200, 350, 30);
    playerMonster.lineStyle(3, 0xFFFFFF);
    playerMonster.strokeCircle(200, 350, 30);
    
    // Enemy monster (top-right platform)
    const enemyMonster = scene.add.graphics();
    enemyMonster.fillStyle(0xFF9800);
    enemyMonster.fillCircle(600, 150, 25);
    enemyMonster.lineStyle(3, 0xFFFFFF);
    enemyMonster.strokeCircle(600, 150, 25);
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
    
    // Initialize Player HP bar
    playerHPBarGraphics = scene.add.graphics();
    
    // Draw initial HP bars
    updateEnemyHPBar(100);
    updatePlayerHPBar(100);
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
                const move = this.getAttribute('data-move');
                
                // Process the move through battle state
                if (battleState && !battleState.buttonsDisabled) {
                    battleState.processPlayerMove(move);
                }
                
                // Visual feedback for button press
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
            
            // Enhanced hover effects
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
    
    initializeBattle();
});

// Export for external access
window.battleState = battleState;
window.game = game;