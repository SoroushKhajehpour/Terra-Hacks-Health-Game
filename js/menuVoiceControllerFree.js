// Free alternative to Gemini for voice command mapping using Web Speech API and simple keyword matching
// This does not require any external AI service or API key

export class MenuVoiceControllerFree {
    constructor() {
        this.commands = ['start', 'exit', 'squat', 'lunge', 'plank', 't-pose'];
    }

    /**
     * Continuously listens for a command until a valid one is detected or stopped.
     * Returns { transcript, command } when a valid command is detected.
     */
    listenAndMapCommand(validCommands = ['squat', 'lunge', 'plank', 'tpose']) {
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
            recognition.maxAlternatives = 1;
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
                const transcript = event.results[0][0].transcript;
                const command = this.mapTextToCommand(transcript);
                if (validCommands.includes(command)) {
                    stopped = true;
                    recognition.stop();
                    resolve({ transcript, command });
                } else {
                    setTimeout(() => {
                        if (!stopped) safeStart();
                    }, 400);
                }
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
            recognition.maxAlternatives = 1;
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
     * Maps transcript to a command using simple keyword matching
     * @param {string} transcript
     * @returns {string} command
     */
    mapTextToCommand(transcript) {
        const text = transcript.toLowerCase();
        if (/\b(start|begin|go|start game)\b/.test(text)) {
            return 'start';
        }
        if (/\b(exit|quit|end|stop)\b/.test(text)) {
            return 'exit';
        }
        if (/\b(squat)\b/.test(text)) {
            return 'squat';
        }
        if (/\b(lunge)\b/.test(text)) {
            return 'lunge';
        }
        if (/\b(plank)\b/.test(text)) {
            return 'plank';
        }
        if (/\b(t-pose|t pose|tpose|tee pose|teepose)\b/.test(text)) {
            return 't-pose';
        }
        return 'none';
    }
}

// No global export needed for ES module
