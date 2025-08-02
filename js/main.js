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
                
                // Play player attack animation FIRST
                playPlayerSquatAttackAnimation(() => {
                    // After player animation completes, play enemy hurt animation
                    playEnemyHurtAnimation();
                    
                    setTimeout(() => {
                        this.animateEnemyHPDecrease();
                        
                        // Check for victory AFTER HP animation completes
                        setTimeout(() => {
                            if (this.enemyHP <= 0) {
                                this.handleVictory();
                            }
                        }, 1000); // Wait for HP animation to finish
                    }, 500); // Delay HP animation slightly
                });
                break;
                
            case 'lunge': // Swift Strike
                damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
                moveName = 'Swift Strike';
                this.enemyHP = Math.max(0, this.enemyHP - damage);
                this.updateBattleText(`You used ${moveName}! Enemy took ${damage} damage!`);
                
                // Play player lunge attack animation FIRST
                playPlayerLungeAttackAnimation(() => {
                    // After player animation completes, play enemy hurt animation
                    playEnemyHurtAnimation();
                    
                    setTimeout(() => {
                        this.animateEnemyHPDecrease();
                        
                        // Check for victory AFTER HP animation completes
                        setTimeout(() => {
                            if (this.enemyHP <= 0) {
                                this.handleVictory();
                            }
                        }, 1000); // Wait for HP animation to finish
                    }, 500); // Delay HP animation slightly
                });
                break;
                
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
        
        // Only proceed to enemy turn if enemy is still alive (for non-plank/tpose moves)
        if (this.enemyHP > 0 && moveType !== 'plank' && moveType !== 'tpose') {
            // Proceed to enemy turn
            this.updateState('enemy-turn');
            setTimeout(() => this.processEnemyTurn(), 2000);
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
        
        // NEW: Play enemy attack animation FIRST, then player hurt animation
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
        
        // Re-enable action buttons after delay
        setTimeout(() => {
            this.enableActionButtons();
        }, 1000);
    }
    
    // Handle victory - NOW WITH DEATH ANIMATION
    handleVictory() {
        this.updateState('victory');
        
        // Play death animation first, then show victory text
        playEnemyDeathAnimation(() => {
            this.updateBattleText('Enemy fainted! You win!');
            console.log('Player wins!');
        });
    }
    
    // Handle defeat - NOW WITH DEATH ANIMATION
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
let enemySprite; // Added global enemy sprite variable
let playerSprite; // Added global player sprite variable

// NEW: Enemy Attack Animation Function
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

// Enemy Hurt Animation Function (updated to return to idle animation)
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

// NEW: Player T-Pose Animation Function
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

function playEnemyDeathAnimation(onComplete) {
    console.log('Playing enemy death animation...');
    
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

    // NEW: Load player t-pose animation spritesheet (jump animation)
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

    // NEW: Load enemy attack animation spritesheet
    this.load.spritesheet('enemy-attack-spritesheet', 'assets/sprites/Owlet_Monster/Owlet_Monster-attack.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    // Load hurt animation spritesheet
    this.load.spritesheet('enemy-hurt-spritesheet', 'assets/sprites/Owlet_Monster/Owlet_Monster-hurt.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    
    // Load death animation spritesheet
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

    // NEW: Create the player t-pose animation (8 frames from jump spritesheet)
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
    
    // NEW: Create the enemy attack animation (6 frames)
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
    
    // NOW create the scene elements
    createBackground(this);
    createPlatforms(this);
    createMonsters(this); // This will now start both idle animations immediately
    createUI(this);
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

// Monster Creation (both monsters now have idle animations)
function createMonsters(scene) {
    // Player monster (bottom-left platform) - Store reference globally for animations
    playerSprite = scene.add.sprite(200, 350, 'player-idle-spritesheet');
    playerSprite.setOrigin(0.5, 0.9); // Center the image
    playerSprite.setScale(4.5); // Adjust scale as needed
    
    // Start the player idle animation immediately
    playerSprite.play('player-idle');
    
    // Enemy monster (top-right platform) - Store reference globally and start with idle animation
    enemySprite = scene.add.sprite(565, 225, 'enemy-idle-spritesheet'); // Changed to sprite for animation
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