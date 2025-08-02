// Exerbeasts - Pokemon-style Battle Game Foundation
// Using Phaser.js for retro arcade battle system

console.log('Exerbeasts - Battle System Initializing...');

// Battle Game Configuration
const BATTLE_CONFIG = {
    // Canvas Configuration
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: 800,
    height: 650, // Reduced height to account for 140px battle interface
    pixelArt: true,
    backgroundColor: '#000000',
    
    // Physics Configuration
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    
    // Scene Configuration
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Battle State Management
class BattleState {
    constructor() {
        this.currentState = 'menu-selection'; // menu-selection, player-turn, enemy-turn, victory, defeat
        this.selectedMenuIndex = 0;
        this.menuOptions = ['FIGHT', 'POKEMON', 'BAG', 'RUN'];
        this.playerHP = 100;
        this.enemyHP = 100;
        this.playerMaxHP = 100;
        this.enemyMaxHP = 100;
        this.battleText = 'What will you do?';
        this.turnCount = 0;
    }
    
    // Update battle state
    updateState(newState) {
        this.currentState = newState;
        console.log(`Battle state changed to: ${newState}`);
    }
    
    // Handle menu selection
    selectMenuOption(index) {
        this.selectedMenuIndex = index;
        const option = this.menuOptions[index];
        console.log(`Selected menu option: ${option}`);
        
        switch(option) {
            case 'FIGHT':
                this.handleFight();
                break;
            case 'POKEMON':
                this.handlePokemon();
                break;
            case 'BAG':
                this.handleBag();
                break;
            case 'RUN':
                this.handleRun();
                break;
        }
    }
    
    // Menu option handlers
    handleFight() {
        this.battleText = 'Choose your attack!';
        this.updateState('player-turn');
    }
    
    handlePokemon() {
        this.battleText = 'No other monsters available!';
    }
    
    handleBag() {
        this.battleText = 'Bag is empty!';
    }
    
    handleRun() {
        this.battleText = 'Can\'t escape from trainer battles!';
    }
    
    // Damage calculation placeholder
    calculateDamage(attacker, defender) {
        return Math.floor(Math.random() * 20) + 10; // 10-30 damage
    }
    
    // Player attack
    playerAttack() {
        const damage = this.calculateDamage('player', 'enemy');
        this.enemyHP = Math.max(0, this.enemyHP - damage);
        this.battleText = `Player deals ${damage} damage!`;
        
        if (this.enemyHP <= 0) {
            this.updateState('victory');
            this.battleText = 'Enemy defeated! Victory!';
        } else {
            this.updateState('enemy-turn');
            setTimeout(() => this.enemyAttack(), 1000);
        }
    }
    
    // Enemy attack
    enemyAttack() {
        const damage = this.calculateDamage('enemy', 'player');
        this.playerHP = Math.max(0, this.playerHP - damage);
        this.battleText = `Enemy deals ${damage} damage!`;
        
        if (this.playerHP <= 0) {
            this.updateState('defeat');
            this.battleText = 'You were defeated!';
        } else {
            this.updateState('menu-selection');
            this.battleText = 'What will you do?';
        }
    }
}

// Global battle state instance
let battleState;
let game;

// Phaser.js Scene Functions
function preload() {
    console.log('Preloading assets...');
    
    // Load background image
    this.load.image('forest-background', 'assets/forest-background.jpg');
    
    // TODO: Load sprites, sounds, and other assets
    // this.load.image('player-monster', 'assets/player-monster.png');
    // this.load.image('enemy-monster', 'assets/enemy-monster.png');
    // this.load.image('background', 'assets/battle-background.png');
    // this.load.image('ui-frame', 'assets/ui-frame.png');
    // this.load.audio('battle-music', 'assets/battle-music.mp3');
    // this.load.audio('attack-sound', 'assets/attack-sound.mp3');
}

function create() {
    console.log('Creating battle scene...');

    // Initialize battle state
    battleState = new BattleState();
    
    // Create background
    createBackground(this);
    
    
    // Create platforms
    createPlatforms(this);
    
    // Create monsters
    createMonsters(this);
    
    // Create UI elements
    createUI(this);
    
    // Note: Menu system removed - using HTML battle interface instead
    
    console.log('Battle scene created successfully!');
    
    console.log('Battle scene created successfully!');
}

function update() {
    // Update game logic here
    // This runs every frame
}

// Background Creation
function createBackground(scene) {
    // Add forest background image
    const background = scene.add.image(400, 230, 'forest-background');
    background.setDisplaySize(800, 460); // Scale to fit game dimensions
    background.setOrigin(0.5, 0.5); // Center the image

        // Add border around the background image
    const backgroundBorder = scene.add.graphics();
    backgroundBorder.lineStyle(6,0x8E24AA); // 8px arcade puprle border
    backgroundBorder.strokeRect(
        400 - 400, // x: center - half width
        230 - 230, // y: center - half height  
        800,       // width
        460        // height
    );
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
    playerMonster.fillStyle(0x8E24AA); // Arcade Purple
    playerMonster.fillCircle(200, 350, 30);
    playerMonster.lineStyle(3, 0xFFFFFF);
    playerMonster.strokeCircle(200, 350, 30);
    
    // Enemy monster (top-right platform)
    const enemyMonster = scene.add.graphics();
    enemyMonster.fillStyle(0xFF9800); // Pixel Orange
    enemyMonster.fillCircle(600, 150, 25);
    enemyMonster.lineStyle(3, 0xFFFFFF);
    enemyMonster.strokeCircle(600, 150, 25);
}

// UI Creation
function createUI(scene) {
    // Enemy info box (top-left)
    const enemyInfoBox = scene.add.graphics();
    enemyInfoBox.fillStyle(0x000000);
    enemyInfoBox.fillRect(20, 20, 200, 80);
    enemyInfoBox.lineStyle(2, 0xFFFFFF);
    enemyInfoBox.strokeRect(20, 20, 200, 80);
    
    // Enemy name and level
    scene.add.text(30, 30, 'ENEMY MONSTER', { 
        fontSize: '16px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    scene.add.text(30, 50, 'Lv. 25', { 
        fontSize: '14px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    
    // Enemy HP bar
    const enemyHPBar = scene.add.graphics();
    enemyHPBar.fillStyle(0xFF0000);
    enemyHPBar.fillRect(30, 70, 180, 15);
    enemyHPBar.lineStyle(2, 0xFFFFFF);
    enemyHPBar.strokeRect(30, 70, 180, 15);
    
    // Player info box (bottom-right)
    const playerInfoBox = scene.add.graphics();
    playerInfoBox.fillStyle(0x000000);
    playerInfoBox.fillRect(580, 360, 200, 80);
    playerInfoBox.lineStyle(2, 0xFFFFFF);
    playerInfoBox.strokeRect(580, 360, 200, 80);
    
    // Player name and level
    scene.add.text(590, 370, 'YOUR MONSTER', { 
        fontSize: '16px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    scene.add.text(590, 390, 'Lv. 30', { 
        fontSize: '14px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    
    // Player HP bar
    const playerHPBar = scene.add.graphics();
    playerHPBar.fillStyle(0x00FF00);
    playerHPBar.fillRect(590, 410, 180, 15);
    playerHPBar.lineStyle(2, 0xFFFFFF);
    playerHPBar.strokeRect(590, 410, 180, 15);
    
}

// Initialize the game when the page loads
window.addEventListener('load', function() {
    console.log('Initializing Exerbeasts battle system...');
    
    // Create Phaser game instance
    game = new Phaser.Game(BATTLE_CONFIG);
    
    console.log('Exerbeasts battle system initialized!');
});

// Handle window resize
window.addEventListener('resize', function() {
    console.log('Window resized - battle system may need adjustment');
    // TODO: Handle responsive layout changes for battle system
});

// Export for external access
window.battleState = battleState;
window.game = game;

// Battle Interface Button Functionality
document.addEventListener('DOMContentLoaded', function() {
    const battleText = document.getElementById('battle-text');
    const actionButtons = document.querySelectorAll('.action-btn');
    
    const moveMessages = {
        'squat': 'You performed a Thunder Stomp!',
        'lunge': 'You used Swift Strike!',
        'plank': 'You activated Iron Defense!',
        'tpose': 'You used Intimidate!'
    };
    
    // Exercise detection system integration
    const exerciseSystem = {
        squat: { name: 'Squat', difficulty: 'medium', calories: 15 },
        lunge: { name: 'Lunge', difficulty: 'hard', calories: 20 },
        plank: { name: 'Plank', difficulty: 'easy', calories: 10 },
        tpose: { name: 'T-Pose', difficulty: 'easy', calories: 5 }
    };
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const move = this.getAttribute('data-move');
            const exercise = exerciseSystem[move];
            
            // Update battle text with exercise info
            battleText.textContent = moveMessages[move];
            
            // Log exercise for pose detection system
            console.log(`Exercise selected: ${exercise.name}`);
            console.log(`Difficulty: ${exercise.difficulty}`);
            console.log(`Calories: ${exercise.calories}`);
            
            // TODO: Connect to pose detection system
            // This is where you would trigger the webcam pose detection
            // and validate if the user is performing the correct exercise
            
            // Visual feedback for button press
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Reset text after 3 seconds
            setTimeout(() => {
                battleText.textContent = 'What will you do?';
            }, 3000);
        });
        
        // Enhanced hover effects
        button.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.3)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.filter = '';
        });
    });
    
    console.log('Battle interface connected to exercise system!');
}); 