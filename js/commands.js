// js/commands.js
// Procesa todos los comandos del jugador de una manera limpia y escalable.
import { GameState } from './state.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { Horror } from './horror.js';
import { GameLogic } from './gamelogic.js';

export const CommandHandler = {
    commands: {
        'desencriptar': (args) => {
            const ciphertext = args.join(' ').toUpperCase().trim();
            const level = GameState.story[GameState.currentLevel];
            if (ciphertext === level.ciphertext) {
                UI.queueTerminalText("INTRODUZCA SEMILLA:", () => {
                    UI.promptChar.innerText = '#';
                    UI.setInputActive(true);
                    GameState.awaitingSpecialInput = (seed) => GameLogic.handleSeedInput(seed);
                });
            } else {
                Audio.play('staticScreech', "8n");
                UI.queueTerminalText("...TEXTO CIFRADO INCORRECTO...");
            }
        },
        'shutdown': (args) => {
            if (GameState.finalSequence && args.join(' ') === '-override cronos7') {
                UI.queueTerminalText("...NO...PUEDES...", () => {
                    GameLogic.endCycle(); // Inicia el siguiente ciclo
                });
            } else {
                Horror.updateSanity(-10);
                UI.queueTerminalText("NO HAY ESCAPATORIA.");
            }
        },
        'ls': (args) => {
            Audio.play('fleshSound', "C1", "1n");
            UI.queueTerminalText(Object.keys(GameState.filesystem).join('      '));
        },
        'leer': (args) => {
            const filename = args[0]?.toLowerCase();
            if (filename && GameState.filesystem[filename]) {
                Audio.play('whisper', "1.5s");
                UI.queueTerminalText(`--- INICIO DE ${filename.toUpperCase()} ---\n${GameState.filesystem[filename]}\n--- FIN DE ${filename.toUpperCase()} ---`);
            } else {
                Horror.updateSanity(-5);
                UI.queueTerminalText("EL ARCHIVO NO EXISTE O ESTÁ DAÑADO.");
            }
        },
        'analizar': (args) => {
            const filename = args[0]?.toLowerCase();
            if (filename === 'audio_log.dat' && GameState.currentLevel === 2) {
                UI.queueTerminalText("...analizando...reproduciendo secuencia de audio...", () => {
                    const clue = "8281".split('');
                    let time = Tone.now();
                    clue.forEach(digit => {
                        Audio.synths.audioClueSynth.triggerAttackRelease(parseInt(digit) * 50 + 200, "8n", time);
                        time += 0.5;
                    });
                    UI.processQueue(); // Continuar con la cola después de iniciar los sonidos
                });
            } else {
                UI.queueTerminalText("...no se puede analizar...");
            }
        },
        'purga': (args) => {
            if (GameState.currentLevel === 3) {
                UI.queueTerminalText("SECUENCIA DE PURGA REQUERIDA (X-X-X-X):", () => {
                    UI.promptChar.innerText = '#';
                    UI.setInputActive(true);
                    GameState.awaitingSpecialInput = (seq) => {
                        if (seq.replace(/-/g, '') === '7700') {
                            Audio.play('audioClueSynth', 800, "1n");
                            UI.queueTerminalText("PURGA COMPLETA. SEMILLA REVELADA EN LOS RESTOS.");
                        } else {
                            Horror.updateSanity(-10);
                            UI.queueTerminalText("SECUENCIA INCORRECTA. CORRUPCIÓN AUMENTANDO.");
                        }
                        UI.promptChar.innerText = '>';
                        GameState.awaitingSpecialInput = null;
                        UI.processQueue();
                    };
                });
            } else {
                UI.queueTerminalText("...no hay nada que purgar...");
            }
        },
        'anular': (args) => {
            if (GameState.fragmentsFound >= 3 && args.length === 3) {
                 // Aquí iría una lógica más compleja para verificar los fragmentos
                if (args.includes("ALPHA") && args.includes("OMEGA") && args.includes("AEON")) {
                    GameLogic.triggerTrueEnding();
                } else {
                    UI.queueTerminalText("...SECUENCIA DE ANULACIÓN INCORRECTA...");
                }
            } else {
                UI.queueTerminalText("...DATOS INSUFICIENTES PARA LA ANULACIÓN...");
            }
        }
    },

    process(inputText) {
        const [command, ...args] = inputText.toLowerCase().split(' ');
        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            Horror.updateSanity(-1);
            Horror.triggerMimic();
            UI.queueTerminalText("...comando desconocido...");
        }
    }
};

