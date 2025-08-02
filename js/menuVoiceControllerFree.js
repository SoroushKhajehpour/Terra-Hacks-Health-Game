// Free alternative to Gemini for voice command mapping using Web Speech API and simple keyword matching
// This does not require any external AI service or API key

class MenuVoiceControllerFree {
    constructor() {
        this.commands = ['start', 'exit'];
    }

    /**
     * Records audio, transcribes to text using Web Speech API, maps to command, and returns result
     * @returns {Promise<string>} mapped command ("start", "exit", or "none")
     */
    async listenAndMapCommand() {
        try {
            const transcript = await this.recordAndTranscribe();
            const command = this.mapTextToCommand(transcript);
            this.speakCommand(command);
            return { transcript, command };
        } catch (error) {
            console.error('Error in listenAndMapCommand:', error);
            this.speakCommand('Sorry, I could not process your command.');
            return { transcript: '', command: 'none' };
        }
    }

    /**
     * Uses the Web Speech API to record and transcribe speech
     * @returns {Promise<string>} transcript
     */
    recordAndTranscribe() {
        return new Promise((resolve, reject) => {
            if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
                reject(new Error('Web Speech API is not supported in this browser.'));
                return;
            }
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
        return 'none';
    }

    /**
     * Use text-to-speech to speak the mapped command
     */
    speakCommand(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 0.9;
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice =>
                voice.name.includes('Google') ||
                voice.name.includes('Female') ||
                (voice.lang.startsWith('en') && voice.name.includes('US'))
            );
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Speech synthesis not supported in this browser');
        }
    }
}

// Make MenuVoiceControllerFree globally accessible
window.MenuVoiceControllerFree = MenuVoiceControllerFree;
