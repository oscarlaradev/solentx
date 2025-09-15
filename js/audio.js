// js/audio.js
// Este módulo se encarga de todo el audio procedural usando Tone.js.
import { GameState } from './state.js';

export const Audio = {
    synths: {}, // Se llenará en setupSounds

    initialize() {
        // Podríamos poner aquí configuraciones iniciales de Tone.js si fueran necesarias
    },

    setupSounds() {
        const distortion = new Tone.Distortion(0.9).toDestination();
        const reverb = new Tone.Reverb(3).toDestination();
        
        this.synths.ambientDrone = new Tone.NoiseSynth({ noise: { type: "brown" }, envelope: { attack: 5, decay: 0.1, sustain: 1 } }).toDestination();
        this.synths.ambientDrone.volume.value = -35;

        const autoFilter = new Tone.AutoFilter("2n").toDestination().start();
        const droneSource = new Tone.Oscillator("F#1", "sawtooth").connect(autoFilter);
        droneSource.volume.value = -30;
        droneSource.start();
        this.synths.droneSource = droneSource; // Guardar referencia para detenerlo

        this.synths.heartBeat = new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2 }).toDestination();
        this.synths.heartBeat.volume.value = -15;

        this.synths.staticScreech = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0 } }).toDestination();
        this.synths.staticScreech.volume.value = -10;

        this.synths.jumpscareSound = new Tone.FMSynth({ modulationIndex: 10 }).connect(distortion);
        this.synths.jumpscareSound.volume.value = -3;

        this.synths.fleshSound = new Tone.MembraneSynth({ pitchDecay: 0.8, octaves: 4, oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.4 } }).connect(distortion);
        this.synths.fleshSound.volume.value = -8;

        const whisperFilter = new Tone.AutoFilter({ frequency: "8n", baseFrequency: 800, octaves: 4 }).toDestination();
        this.synths.whisper = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.2, decay: 0.8, sustain: 0 } }).connect(whisperFilter);
        this.synths.whisper.volume.value = -20;
        
        this.synths.audioClueSynth = new Tone.FMSynth({ harmonicity: 3, modulationIndex: 10, envelope: { attack: 0.01, decay: 0.2 } }).connect(reverb);
        this.synths.audioClueSynth.volume.value = -10;

        GameState.soundsReady = true;
    },

    // Funciones para disparar sonidos específicos
    play(sound, ...args) {
        if (GameState.soundsReady && this.synths[sound]) {
            // triggerAttackRelease es común para muchos synths de Tone.js
            this.synths[sound].triggerAttackRelease(...args);
        }
    },

    startAmbience() {
        if (GameState.soundsReady) {
            Tone.Transport.start();
            this.synths.ambientDrone.triggerAttack();
        }
    },

    stopAll() {
        if (GameState.soundsReady) {
            Tone.Transport.stop();
            // Detener osciladores continuos
            this.synths.droneSource.stop();
            // Cancelar cualquier evento programado
            for (const synth in this.synths) {
                if (this.synths[synth].releaseAll) {
                    this.synths[synth].releaseAll();
                }
            }
        }
    }
};

