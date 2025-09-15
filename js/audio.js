// --- MÓDULO: MOTOR DE AUDIO (AUDIO) ---
import { GameState } from './state.js';

export const Audio = {
    synths: {},
    isSetup: false,
    setup: function() {
        if (this.isSetup || typeof Tone === 'undefined') return;
        const distortion = new Tone.Distortion(0.9).toDestination();
        this.synths.ambientDrone = new Tone.NoiseSynth({noise:{type:"brown"}, envelope:{attack:5, decay:0.1, sustain:1}}).toDestination();
        this.synths.ambientDrone.volume.value = -35;
        this.synths.heartBeat = new Tone.MembraneSynth({pitchDecay: 0.1, octaves: 2}).toDestination();
        this.synths.heartBeat.volume.value = -15;
        this.synths.staticScreech = new Tone.NoiseSynth({noise:{type:"white"}, envelope:{attack:0.01, decay:0.2, sustain:0}}).toDestination();
        this.synths.staticScreech.volume.value = -10;
        this.synths.jumpscareSound = new Tone.FMSynth({modulationIndex: 12, harmonicity: 0.5}).connect(distortion);
        this.synths.jumpscareSound.volume.value = -3;
        this.synths.whisper = new Tone.NoiseSynth({noise:{type:"pink"}, envelope:{attack:0.2, decay:0.8, sustain:0}}).toDestination();
        this.synths.whisper.volume.value = -20;
        this.synths.audioClue = new Tone.FMSynth({harmonicity: 3, modulationIndex: 10}).toDestination();
        this.synths.audioClue.volume.value = -10;
        this.synths.tick = new Tone.MembraneSynth({pitchDecay: 0.01, octaves: 4, envelope: {attack:0.001, decay: 0.1, sustain:0}}).toDestination();
        this.synths.tick.volume.value = -25;
        this.isSetup = true;
    },
    play: function(sound, options = {}) {
        if (!GameState.soundsReady || !this.synths[sound]) return;
        if (options.probability && Math.random() > options.probability) return;
        switch(sound) {
            case 'ambientDrone': this.synths.ambientDrone.triggerAttack(); break;
            case 'heartBeat': this.synths.heartBeat.triggerAttackRelease(options.note || "C1", "4n", Tone.now(), options.velocity || 0.9); break;
            case 'staticScreech': this.synths.staticScreech.triggerAttackRelease("8n"); break;
            case 'jumpscareSound': this.synths.jumpscareSound.triggerAttackRelease("C#1", "1.5s"); break;
            case 'whisper': this.synths.whisper.triggerAttackRelease("2s"); break;
            case 'tick': this.synths.tick.triggerAttackRelease("C4", "32n"); break;
        }
    },
    stopAll: function() {
        if (typeof Tone === 'undefined') return;
        Tone.Transport.stop();
        for (let synth in this.synths) {
            if (this.synths[synth].releaseAll) this.synths[synth].releaseAll();
        }
    }
};

