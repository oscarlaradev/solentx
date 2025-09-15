// --- MÓDULO: PROCESADOR DE COMANDOS (COMMAND HANDLER) ---
import { GameState } from './state.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { Horror } from './horror.js';
import { GameLogic } from './gamelogic.js';

function processQueueAfter() { UI.type(); }

export const CommandHandler = {
    commands: {
        'ayuda': () => UI.queueTerminalText("COMANDOS:\n ls, leer, desencriptar, analizar, purga, tiempo, reparar, shutdown, fragmento, anular", processQueueAfter),
        'ls': () => UI.queueTerminalText(Object.keys(GameState.filesystem).join('    '), processQueueAfter),
        'leer': (args) => {
            const filename = args[0]?.toLowerCase();
            if (filename && GameState.filesystem[filename]) {
                UI.queueTerminalText(`--- ${filename} ---\n${GameState.filesystem[filename]}`, processQueueAfter);
            } else {
                Horror.updateSanity(-5);
                UI.queueTerminalText("ARCHIVO NO ENCONTRADO.", processQueueAfter);
            }
        },
        'desencriptar': (args) => {
            const ciphertext = args.join(' ').toUpperCase().trim();
            if (GameState.currentLevel < GameState.storyData.length && ciphertext === GameState.storyData[GameState.currentLevel].ciphertext) {
                UI.queueTerminalText("CLAVE DE DESENCRIPTACIÓN:", () => {
                    UI.promptChar.innerText = '#';
                    UI.setInputActive(true);
                    GameState.awaitingSpecialInput = GameLogic.handleSeedInput;
                });
            } else {
                Audio.play('staticScreech');
                UI.queueTerminalText("...TEXTO CIFRADO INVÁLIDO...", processQueueAfter);
            }
        },
        'analizar': (args) => {
            if (args[0] === 'audio_log.dat' && GameState.currentLevel === 2) {
                UI.queueTerminalText("...analizando...reproduciendo secuencia...", () => {
                    "8281".split('').forEach((digit, i) => {
                        if(Audio.synths.audioClue) Audio.synths.audioClue.triggerAttackRelease(parseInt(digit) * 50 + 200, "8n", Tone.now() + i * 0.5);
                    });
                    processQueueAfter();
                });
            } else {
                UI.queueTerminalText("...análisis fallido...", processQueueAfter);
            }
        },
        'purga': (args) => {
            if (GameState.currentLevel === 3) {
                UI.queueTerminalText("SECUENCIA DE PURGA REQUERIDA (X-X-X-X):", () => {
                    UI.promptChar.innerText = '#';
                    UI.setInputActive(true);
                    GameState.awaitingSpecialInput = (seq) => {
                        if (seq.replace(/-/g, '') === '7700') {
                            UI.queueTerminalText("PURGA COMPLETA. CLAVE REVELADA EN LOS RESTOS.");
                        } else {
                            Horror.updateSanity(-15);
                            UI.queueTerminalText("SECUENCIA INCORRECTA. LA CORRUPCIÓN AUMENTA.");
                        }
                        UI.promptChar.innerText = '>';
                        GameState.awaitingSpecialInput = null;
                        processQueueAfter();
                    };
                });
            } else {
                UI.queueTerminalText("...no hay sistema que purgar...", processQueueAfter);
            }
        },
        'shutdown': (args) => {
            if (args.join(' ') === '-override cronos7') {
                GameLogic.endGame('shutdown');
            } else {
                Horror.updateSanity(-10);
                UI.queueTerminalText("NO PUEDES APAGARME. SOY ETERNO.", processQueueAfter);
            }
        },
        'fragmento': (args) => {
            const code = args.join('').toLowerCase();
            const validFragments = { 'alpha': 'alpha_fragment.dat', 'beta': 'beta_fragment.dat', 'gamma': 'gamma_fragment.dat' };
            if (validFragments[code] && GameState.filesystem[validFragments[code]]) {
                if (!GameState.fragments.includes(code)) {
                    GameState.fragments.push(code);
                    localStorage.setItem('solentx_fragments', JSON.stringify(GameState.fragments));
                    UI.queueTerminalText(`...FRAGMENTO [${code.toUpperCase()}] ADQUIRIDO...`);
                    if (GameState.fragments.length === 3) {
                        UI.queueTerminalText(`...LOS TRES FRAGMENTOS HAN SIDO REUNIDOS...`);
                        UI.queueTerminalText(`...EL PROTOCOLO DE ANULACIÓN ESTÁ DISPONIBLE...`);
                        GameState.filesystem['ANULACION.exe'] = "Ejecuta 'anular' para terminar el ciclo. Para siempre.";
                    }
                } else {
                    UI.queueTerminalText(`...YA POSEES EL FRAGMENTO [${code.toUpperCase()}]...`);
                }
            } else {
                 UI.queueTerminalText("...código de fragmento inválido...");
            }
            processQueueAfter();
        },
        'anular': () => {
            if (GameState.fragments.length === 3) {
                GameLogic.endGame('true_ending');
            } else {
                UI.queueTerminalText("...protocolo de anulación incompleto...", processQueueAfter);
            }
        },
        'tiempo': () => {
            Horror.triggerTimeAwareness();
            processQueueAfter();
        },
        'reparar': (args) => {
            const filename = args[0]?.toLowerCase();
            if (filename === 'mem_dump.corrupt' && GameState.filesystem[filename]) {
                UI.queueTerminalText("...reparando volcado de memoria...", () => {
                    GameState.filesystem['mem_dump.txt'] = "0x00A4: CLAVE... 0x01B2: ...ES... 0x02C3: ...ENTROPIA";
                    delete GameState.filesystem['mem_dump.corrupt'];
                    UI.queueTerminalText("...reparación completa. Nuevo archivo 'mem_dump.txt' creado.", processQueueAfter);
                }, 20);
            } else {
                UI.queueTerminalText("...el archivo no está corrupto o no se puede reparar...", processQueueAfter);
            }
        },
    },
    process: function(inputText) {
        const [command, ...args] = inputText.toLowerCase().split(' ');
        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            Horror.updateSanity(-1);
            Horror.triggerMimic();
            UI.queueTerminalText("COMANDO DESCONOCIDO", processQueueAfter);
        }
    }
};

