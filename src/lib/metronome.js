class Metronome {
    constructor() {
        this.audioCtx = null;
        this.isPlaying = false;
        this.timerID = null;
        this.bpm = 120;
        this.nextNoteTime = 0;
    }

    init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    scheduleNote() {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.frequency.value = 800;

        gain.gain.setValueAtTime(1, this.nextNoteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.nextNoteTime + 0.05);

        osc.start(this.nextNoteTime);
        osc.stop(this.nextNoteTime + 0.05);
    }

    scheduler() {
        while (this.nextNoteTime < this.audioCtx.currentTime + 0.1) {
            this.scheduleNote();
            this.nextNoteTime += 60.0 / this.bpm;
        }
        this.timerID = requestAnimationFrame(this.scheduler.bind(this));
    }

    start() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.nextNoteTime = this.audioCtx.currentTime + 0.05;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        cancelAnimationFrame(this.timerID);
    }

    setBpm(newBpm) {
        this.bpm = newBpm;
    }
}

export const metronomeEngine = new Metronome();
