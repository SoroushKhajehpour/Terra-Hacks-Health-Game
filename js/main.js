// Exerbeasts - Pokemon-style Battle Game Foundation
// Using Phaser.js for retro arcade battle system

console.log('Exerbeasts - Battle System Initializing...');

// Battle Game Configuration
const BATTLE_CONFIG = {
    // Canvas Configuration
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: 800,
    height: 600,
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
    
    // Create menu system
    createMenu(this);
    
    // Set up input handlers
    setupInputHandlers(this);
    
    console.log('Battle scene created successfully!');
}

function update() {
    // Update game logic here
    // This runs every frame
}

// Background Creation
function createBackground(scene) {
    // Sky gradient (top section)
    const skyGradient = scene.add.graphics();
    skyGradient.fillGradientStyle(0x00ACC1, 0x00ACC1, 0x4DD0E1, 0x4DD0E1, 1);
    skyGradient.fillRect(0, 0, 800, 300);
    
    // Grass field (bottom section)
    const grassGradient = scene.add.graphics();
    grassGradient.fillGradientStyle(0x388E3C, 0x388E3C, 0x2E7D32, 0x2E7D32, 1);
    grassGradient.fillRect(0, 300, 800, 300);
}

// Platform Creation
function createPlatforms(scene) {
    // Enemy platform (top-right)
    const enemyPlatform = scene.add.graphics();
    enemyPlatform.fillStyle(0x2E7D32);
    enemyPlatform.fillEllipse(600, 200, 120, 60);
    enemyPlatform.lineStyle(3, 0xFFFFFF);
    enemyPlatform.strokeEllipse(600, 200, 120, 60);
    
    // Player platform (bottom-left)
    const playerPlatform = scene.add.graphics();
    playerPlatform.fillStyle(0x2E7D32);
    playerPlatform.fillEllipse(200, 450, 150, 80);
    playerPlatform.lineStyle(3, 0xFFFFFF);
    playerPlatform.strokeEllipse(200, 450, 150, 80);
}

// Monster Creation
function createMonsters(scene) {
    // Player monster (bottom-left platform)
    const playerMonster = scene.add.graphics();
    playerMonster.fillStyle(0x8E24AA); // Arcade Purple
    playerMonster.fillCircle(200, 450, 30);
    playerMonster.lineStyle(3, 0xFFFFFF);
    playerMonster.strokeCircle(200, 450, 30);
    
    // Enemy monster (top-right platform)
    const enemyMonster = scene.add.graphics();
    enemyMonster.fillStyle(0xFF9800); // Pixel Orange
    enemyMonster.fillCircle(600, 200, 25);
    enemyMonster.lineStyle(3, 0xFFFFFF);
    enemyMonster.strokeCircle(600, 200, 25);
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
    playerInfoBox.fillRect(580, 500, 200, 80);
    playerInfoBox.lineStyle(2, 0xFFFFFF);
    playerInfoBox.strokeRect(580, 500, 200, 80);
    
    // Player name and level
    scene.add.text(590, 510, 'YOUR MONSTER', { 
        fontSize: '16px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    scene.add.text(590, 530, 'Lv. 30', { 
        fontSize: '14px', 
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
    
    // Player HP bar
    const playerHPBar = scene.add.graphics();
    playerHPBar.fillStyle(0x00FF00);
    playerHPBar.fillRect(590, 550, 180, 15);
    playerHPBar.lineStyle(2, 0xFFFFFF);
    playerHPBar.strokeRect(590, 550, 180, 15);
    
    // Dialog box (bottom-center)
    // const dialogBox = scene.add.graphics();
    // dialogBox.fillStyle(0xFFFFFF);
    // dialogBox.fillRect(100, 480, 600, 80);
    // dialogBox.lineStyle(3, 0x000000);
    // dialogBox.strokeRect(100, 480, 600, 80);
    
    // // Battle text
    // scene.add.text(120, 500, 'What will you do?', { 
    //     fontSize: '18px', 
    //     fill: '#000000',
    //     fontFamily: 'Courier New',
    //     wordWrap: { width: 560 }
    // });
}

// Menu Creation
function createMenu(scene) {
    const menuX = 620;
    const menuY = 400;
    const buttonWidth = 80;
    const buttonHeight = 40;
    const buttonSpacing = 10;
    
    const menuOptions = ['FIGHT', 'POKEMON', 'BAG', 'RUN'];
    
    menuOptions.forEach((option, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = menuX + (col * (buttonWidth + buttonSpacing));
        const y = menuY + (row * (buttonHeight + buttonSpacing));
        
        // Menu button background
        const button = scene.add.graphics();
        button.fillStyle(0x8E24AA); // Arcade Purple
        button.fillRect(x, y, buttonWidth, buttonHeight);
        button.lineStyle(2, 0xFFFFFF);
        button.strokeRect(x, y, buttonWidth, buttonHeight);
        
        // Menu button text
        scene.add.text(x + buttonWidth/2, y + buttonHeight/2, option, { 
            fontSize: '12px', 
            fill: '#FFFFFF',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        // Make button interactive
        button.setInteractive(new Phaser.Geom.Rectangle(x, y, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        
        // Button hover effect
        button.on('pointerover', () => {
            button.clear();
            button.fillStyle(0xFF9800); // Pixel Orange on hover
            button.fillRect(x, y, buttonWidth, buttonHeight);
            button.lineStyle(2, 0xFFFFFF);
            button.strokeRect(x, y, buttonWidth, buttonHeight);
        });
        
        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x8E24AA); // Back to Arcade Purple
            button.fillRect(x, y, buttonWidth, buttonHeight);
            button.lineStyle(2, 0xFFFFFF);
            button.strokeRect(x, y, buttonWidth, buttonHeight);
        });
        
        // Button click handler
        button.on('pointerdown', () => {
            battleState.selectMenuOption(index);
            updateBattleText(scene);
        });
    });
}

// Input Handlers
function setupInputHandlers(scene) {
    // Keyboard navigation for menu
    scene.input.keyboard.on('keydown-UP', () => {
        if (battleState.currentState === 'menu-selection') {
            battleState.selectedMenuIndex = Math.max(0, battleState.selectedMenuIndex - 2);
        }
    });
    
    scene.input.keyboard.on('keydown-DOWN', () => {
        if (battleState.currentState === 'menu-selection') {
            battleState.selectedMenuIndex = Math.min(3, battleState.selectedMenuIndex + 2);
        }
    });
    
    scene.input.keyboard.on('keydown-LEFT', () => {
        if (battleState.currentState === 'menu-selection') {
            battleState.selectedMenuIndex = Math.max(0, battleState.selectedMenuIndex - 1);
        }
    });
    
    scene.input.keyboard.on('keydown-RIGHT', () => {
        if (battleState.currentState === 'menu-selection') {
            battleState.selectedMenuIndex = Math.min(3, battleState.selectedMenuIndex + 1);
        }
    });
    
    scene.input.keyboard.on('keydown-ENTER', () => {
        if (battleState.currentState === 'menu-selection') {
            battleState.selectMenuOption(battleState.selectedMenuIndex);
            updateBattleText(scene);
        } else if (battleState.currentState === 'player-turn') {
            battleState.playerAttack();
            updateBattleText(scene);
        }
    });
}

// Update battle text
function updateBattleText(scene) {
    // Clear existing text and redraw dialog box
    const dialogBox = scene.add.graphics();
    dialogBox.fillStyle(0xFFFFFF);
    dialogBox.fillRect(100, 480, 600, 80);
    dialogBox.lineStyle(3, 0x000000);
    dialogBox.strokeRect(100, 480, 600, 80);
    
    // Update battle text
    scene.add.text(120, 500, battleState.battleText, { 
        fontSize: '18px', 
        fill: '#000000',
        fontFamily: 'Courier New',
        wordWrap: { width: 560 }
    });
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