// Free alternative to Gemini for voice command mapping using Web Speech API and simple keyword matching
// This does not require any external AI service or API key
// Enhanced with better voice command recognition for battle moves

export class MenuVoiceControllerFree {
    constructor() {
        this.commands = ['start', 'exit', 'squat', 'lunge', 'plank', 't-pose', 'thunder stomp', 'swift strike', 'iron defense', 'intimidate'];
    }

    /**
     * Continuously listens for a command until a valid one is detected or stopped.
     * Returns { transcript, command } when a valid command is detected.
     */
    listenAndMapCommand(validCommands = ['squat', 'lunge', 'plank', 'tpose', 'thunder stomp', 'swift strike', 'iron defense', 'intimidate']) {
        return new Promise((resolve, reject) => {
            const root = typeof window !== 'undefined' ? window : global;
            if (!('webkitSpeechRecognition' in root || 'SpeechRecognition' in root)) {
                reject(new Error('Web Speech API is not supported in this browser.'));
                return;
            }
            const SpeechRecognition = root.SpeechRecognition || root.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 3; // Check multiple alternatives for better recognition
            let stopped = false;
            let isRecognizing = false;

            const safeStart = () => {
                if (!isRecognizing) {
                    try {
                        recognition.start();
                        isRecognizing = true;
                    } catch (e) {
                        // Ignore if already started
                    }
                }
            };

            recognition.onstart = () => {
                isRecognizing = true;
            };
            recognition.onend = () => {
                isRecognizing = false;
                if (!stopped) {
                    setTimeout(() => {
                        if (!stopped) safeStart();
                    }, 400);
                }
            };
            recognition.onresult = event => {
                // Check all alternatives for better recognition
                for (let i = 0; i < event.results[0].length; i++) {
                    const transcript = event.results[0][i].transcript;
                    const command = this.mapTextToCommand(transcript);
                    
                    if (validCommands.includes(command)) {
                        stopped = true;
                        recognition.stop();
                        resolve({ transcript, command });
                        return;
                    }
                }
                
                // If no valid command found, continue listening
                setTimeout(() => {
                    if (!stopped) safeStart();
                }, 400);
            };
            recognition.onerror = event => {
                if (event.error === 'no-speech' || event.error === 'no-match') {
                    setTimeout(() => {
                        if (!stopped) safeStart();
                    }, 400);
                } else {
                    stopped = true;
                    reject(new Error('Speech recognition error: ' + event.error));
                }
            };
            safeStart();
        });
    }

    /**
     * Uses the Web Speech API to record and transcribe speech
     * @returns {Promise<string>} transcript
     */
    recordAndTranscribe() {
        return new Promise((resolve, reject) => {
            const root = typeof window !== 'undefined' ? window : global;
            if (!('webkitSpeechRecognition' in root || 'SpeechRecognition' in root)) {
                reject(new Error('Web Speech API is not supported in this browser.'));
                return;
            }
            const SpeechRecognition = root.SpeechRecognition || root.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 3; // Check multiple alternatives
            recognition.onresult = event => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };
            recognition.onerror = event => {
                reject(new Error('Speech recognition error: ' + event.error));
            };
            recognition.onend = () => {};
            recognition.start();
        });
    }

    /**
     * Maps transcript to a command using enhanced keyword matching
     * @param {string} transcript
     * @returns {string} command
     */
    mapTextToCommand(transcript) {
        const text = transcript.toLowerCase().trim();
        
        // Basic game commands
        if (/\b(start|begin|go|start game)\b/.test(text)) {
            return 'start';
        }
        if (/\b(exit|quit|end|stop)\b/.test(text)) {
            return 'exit';
        }
        
        // Enhanced move recognition with multiple variations
        // Squat / Thunder Stomp
        if (/\b(squat|squats|thunder stomp|thunder|stomp)\b/.test(text)) {
            return 'squat';
        }
        
        // Lunge / Swift Strike  
        if (/\b(lunge|lunges|lunch|swift strike|swift|strike)\b/.test(text)) {
            return 'lunge';
        }
        
        // Plank / Iron Defense
        if (/\b(plank|planks|iron defense|iron|defense|defend)\b/.test(text)) {
            return 'plank';
        }
        
        // T-Pose / Intimidate (with many variations)
        if (/\b(t-pose|t pose|tpose|tee pose|teepose|tea pose|intimidate|intimidation)\b/.test(text)) {
            return 't-pose';
        }
        
        // Additional attack variations
        if (/\b(attack|hit|strike|punch|kick)\b/.test(text)) {
            // Default to squat if generic attack command
            return 'squat';
        }
        
        return 'none';
    }

    /**
     * Enhanced command mapping specifically for battle moves
     * @param {string} transcript
     * @returns {string} moveType ('squat', 'lunge', 'plank', 'tpose', or 'none')
     */
    mapToBattleMove(transcript) {
        const text = transcript.toLowerCase().trim();
        
        // Map to specific move types that match button data-move attributes
        if (/\b(squat|squats|thunder stomp|thunder|stomp)\b/.test(text)) {
            return 'squat';
        }
        if (/\b(lunge|lunges|lunch|swift strike|swift|strike)\b/.test(text)) {
            return 'lunge';
        }
        if (/\b(plank|planks|iron defense|iron|defense|defend)\b/.test(text)) {
            return 'plank';
        }
        if (/\b(t-pose|t pose|tpose|tee pose|teepose|tea pose|intimidate|intimidation)\b/.test(text)) {
            return 'tpose'; // Note: returns 'tpose' to match button data-move
        }
        
        return 'none';
    }
}

// No global export needed for ES module
