export class Feedback {
  constructor(apiKey) {
    // Accept API key as argument, or try window.GEMINI_API_KEY, or empty string
    this.GEMINI_API_KEY = apiKey || (typeof window !== 'undefined' && window.GEMINI_API_KEY) || '';
  }

    /**
     * Analyzes an image and returns feedback with mood verdict
     * @param {File|Blob} imageFile - The image file to analyze
     * @returns {Promise<{feedback: string, mood: string}>} - Feedback text and mood (happy/neutral/sad)
     */
    async analyzeFitnessImage(imageFile, position = 'unknown') {
        if (!this.GEMINI_API_KEY) {
            throw new Error('Gemini API key not set. Call setGeminiApiKey(key) first.');
        }
        try {
            let imageData;
            if (typeof imageFile === 'string' && imageFile.startsWith('data:')) {
                // Already a data URL
                imageData = imageFile;
            } else {
                // Convert Blob/File to data URL
                imageData = await this.fileToBase64(imageFile);
            }
            // Analyze with Gemini
            const result = await this.analyzeWithGemini(imageData, position);
            // Only return feedback, do not speak it here
            return {
                feedback: result.feedback,
                mood: result.mood
            };
        } catch (error) {
            console.error('Error analyzing image:', error);
            const errorMsg = "Sorry, I couldn't analyze that image!";
            return {
                feedback: errorMsg,
                mood: "sad"
            };
        }
    }

    /**
     * Convert file to base64 string
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Analyze image with real Gemini API
     */
    async analyzeWithGemini(imageData, position) {
        const base64Data = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: `Analyze this fitness/exercise image of the user doing a ${position} and provide encouraging feedback about the person's form, effort, or technique. 

    Based on what you see, determine if this deserves:
    - HAPPY: Excellent form, great effort, impressive technique, or motivating progress
    - NEUTRAL: Good attempt but room for improvement, decent form with minor issues
    - SAD: Poor form that could lead to injury, lack of effort, or needs significant improvement

    Keep your response under 30 words and be supportive but honest. 

    Format your response as: MOOD|feedback text
    Example: HAPPY|Great form! Your squat depth is perfect and your back is straight!`
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Data
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 100,
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        
        // Parse the response
        const [moodPart, ...feedbackParts] = generatedText.split('|');
        const mood = moodPart.trim().toLowerCase();
        const feedback = feedbackParts.join('|').trim();
        
        // Validate mood
        const validMoods = ['happy', 'neutral', 'sad'];
        const finalMood = validMoods.includes(mood) ? mood : 'neutral';
        
        return {
            mood: finalMood,
            feedback: feedback || "Keep up the great work!"
        };
    }

    /**
     * Use text-to-speech to speak the feedback with cartoonish voice
     */
    speakFeedback(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Cartoonish, happy voice settings
            utterance.rate = 1.1; // Slightly faster for energy
            utterance.pitch = 1.4; // Higher pitch for cartoonish effect
            utterance.volume = 0.8;
            
            // Try to get a higher-pitched (female or child) voice for cartoonish effect
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice =>
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
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Speech synthesis not supported in this browser');
        }
    }
}

// Load voices when they become available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
        // Voices are now loaded
    });
}
