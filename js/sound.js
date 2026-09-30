class SoundEngine {
    #ctx = null;

    #init() {
        if (!this.#ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.#ctx = new AudioCtx();
        }
        if (this.#ctx.state === 'suspended') this.#ctx.resume();
    }

    playTick() {
        this.#init();
        const osc = this.#ctx.createOscillator();
        const gain = this.#ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, this.#ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.#ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.#ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(this.#ctx.destination);
        osc.start();
        osc.stop(this.#ctx.currentTime + 0.03);
    }

    playSuccess() {
        this.#init();
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((freq, idx) => {
            const osc = this.#ctx.createOscillator();
            const gain = this.#ctx.createGain();
            const start = this.#ctx.currentTime + (idx * 0.08);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.05, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
            osc.connect(gain);
            gain.connect(this.#ctx.destination);
            osc.start(start);
            osc.stop(start + 0.2);
        });
    }
}