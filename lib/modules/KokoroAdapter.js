/**
 * Adapter to connect Python Kokoro TTS with the TalkingHead Avatar.
 * Uses "Native Mode" to let the Avatar calculate its own high-quality lip-sync.
 */
export class KokoroAdapter {
    constructor(serverUrl = "https://ocellar-inclusively-delsie.ngrok-free.dev") {
        this.serverUrl = serverUrl;
        // Padding prevents the mouth from moving during the tiny silence 
        // that often occurs at the start/end of an audio file.
        this.TIMING_PADDING_MS = 50; 
    }

    /**
     * Streams audio to the avatar.
     * @param {Object} head - The TalkingHead instance
     * @param {string} text - The text to speak
     * @param {string} voice - Voice ID (e.g., 'af_bella')
     * @param {function} onChunk - Callback when a chunk is downloaded (for latency check)
     * @param {function} onSubtitle - Callback when a word is spoken
     * @param {function} onAllFinished - Callback when the avatar finishes speaking EVERYTHING
     */
    async streamToAvatar(head, text, voice = "af_bella", onChunk, onSubtitle, onAllFinished) {
        console.log("🚀 Requesting Audio...");

        // 1. Resume Audio Context (Browser requirement)
        if (head.audioCtx.state === 'suspended') {
            await head.audioCtx.resume();
        }

        const response = await fetch(`${this.serverUrl}/generate_stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice, speed: 1.0 }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let chunkIndex = 0;

        // 2. Stream & Queue Loop
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop(); 

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const packet = JSON.parse(line);
                    chunkIndex++;
                    
                    if (onChunk) onChunk(chunkIndex);

                    // Queue this chunk into the avatar's playlist
                    this.handoffToAvatar(head, packet, onSubtitle);
                } catch (e) {
                    console.error("JSON Error", e);
                }
            }
        }

        // 3. Queue the "Finish" Marker
        // This marker is added to the END of the playlist. 
        // The avatar will execute this function only after speaking all the previous chunks.
        if (onAllFinished) {
            head.speakMarker(onAllFinished);
        }
    }

    handoffToAvatar(head, packet, onSubtitle) {
        if (!packet.audio || !packet.text) return;

        // --- A. Decode Audio ---
        const binaryString = window.atob(packet.audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        
        const int16Data = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
            float32Data[i] = int16Data[i] / 32768.0;
        }

        // Create AudioBuffer (Kokoro is 24000Hz)
        const audioBuffer = head.audioCtx.createBuffer(1, float32Data.length, 24000);
        audioBuffer.copyToChannel(float32Data, 0);

        // --- B. Prepare Words & Timings ---
        const rawText = packet.text.trim();
        if (!rawText) return;
        const words = rawText.split(/\s+/);
        
        // Use "Character Weighting" to estimate word duration.
        // Longer words get more time.
        let totalChars = 0;
        words.forEach(w => totalChars += w.length);

        const totalDurationMs = (audioBuffer.duration * 1000) - (this.TIMING_PADDING_MS * 2);
        const msPerChar = totalDurationMs / totalChars;

        const wtimes = [];
        const wdurations = [];
        let currentTime = this.TIMING_PADDING_MS; 

        words.forEach((word) => {
            const wordDuration = word.length * msPerChar;
            wtimes.push(currentTime);
            wdurations.push(wordDuration);
            currentTime += wordDuration;
        });

        // --- C. Hand off to Avatar ---
        // Passing 'words' triggers the internal LipsyncEn engine (Smooth & Accurate).
        head.speakAudio({
            audio: audioBuffer,
            words: words,
            wtimes: wtimes,
            wdurations: wdurations
        }, {}, onSubtitle);
    }
}