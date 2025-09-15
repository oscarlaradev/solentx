// js/gamelogic.js
// Contiene la lógica principal del juego, progresión, narrativa y gestión de ciclos.
import { GameState } from './state.js';
import { UI } from './ui.js';
import { Horror } from './horror.js';
import { Audio } from './audio.js';

export const GameLogic = {
    ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!? ',

    startGame() {
        UI.elements.lobbyContainer.classList.add('hidden');
        UI.elements.gameContainer.classList.remove('hidden');
        if (UI.lobbyAnimationId) {
            cancelAnimationFrame(UI.lobbyAnimationId);
        }
        
        Audio.startAmbience();
        this.initializeGameState();
        this.fetchEnvironmentalData();

        UI.elements.headerText.innerHTML = `<p>SOLENTX OS v3.1 :: CONEXIÓN ESTABLECIDA</p><p>CICLO DE SESIÓN: ${GameState.cycle}</p>`;
        UI.clearTerminal();
        UI.queueTerminalText("...iniciando protocolo...", () => this.setupLevel());
    },

    initializeGameState() {
        // Cargar estado del ciclo desde localStorage
        GameState.cycle = parseInt(localStorage.getItem('solentx_cycle') || '1');
        GameState.fragmentsFound = parseInt(localStorage.getItem('solentx_fragments') || '0');

        // Reiniciar estado para la nueva partida
        GameState.currentLevel = 0;
        GameState.sanity = 100;
        GameState.recentPlayerInputs = [];
        GameState.awaitingSpecialInput = null;
        GameState.finalSequence = false;
        
        this.loadStoryAndFiles();
    },

    loadStoryAndFiles() {
        // En una versión futura, esto podría cargar desde un JSON externo.
        GameState.story = [
            { level: 0, ciphertext: "J7VPYEDZ0C9QRJ73X!E0T", solution: "1984", onDecrypt: ["La primera voz...", "Siempre es la más clara."] },
            { level: 1, ciphertext: "5Z9G4K!B,H7XNB94W,L.F14W5K9H4X0", solution: "31415", onDecrypt: ["Las paredes no tienen oídos.", "Yo sí."] },
            { level: 2, ciphertext: "Y41C90DZXK4P8R?G,XU,E.QJ.R0.G", solution: "8281", onDecrypt: ["Tiene hambre.", "Y tú te ves delicioso."] },
            { level: 3, ciphertext: "O!I3Y.Z.V,1O5!YF9XVP!F", solution: "7700", onDecrypt: ["Se alimenta del miedo.", "Y estás lleno de él."] },
            { level: 4, ciphertext: "S7W3Z4,U947Q2R 2W", solution: "42", onDecrypt: ["...", "...", "Detrás de ti."] }
        ];

        GameState.filesystem = {
            'LEEME.txt': 'NO HAY SALIDA. NO LA BUSQUES.',
            'diario_ensangrentado.txt': 'Día ¿60? La pantalla me habla. Dice mi nombre. Veo su cara en la estática. El código... Cronos7... es la única forma de hacerlo callar.',
            'protocolo_solentx.log': 'La entidad aprende. Repite palabras. Cuidado con lo que escribes. Cuidado con lo que piensas.'
        };

        // Añadir contenido basado en el ciclo
        if (GameState.cycle > 1) {
            GameState.filesystem[`log_ciclo_${GameState.cycle - 1}.txt`] = "Volvió. Siempre vuelve. El código CRONOS7 es una mentira. Es solo un reinicio. No un escape.";
        }
        if (GameState.cycle > 2 && GameState.fragmentsFound < 1) {
             GameState.filesystem['fragment_alpha.dat'] = 'DATOS CORRUPTOS... fragmento recuperado: ALPHA';
        }
        if (GameState.cycle > 3 && GameState.fragmentsFound < 2) {
             GameState.filesystem['fragment_omega.dat'] = 'MEMORIA RESIDUAL... fragmento recuperado: OMEGA';
        }
         if (GameState.cycle > 4 && GameState.fragmentsFound < 3) {
             GameState.filesystem['fragment_aeon.dat'] = 'ECO DEL SISTEMA... fragmento recuperado: AEON';
        }
    },

    setupLevel() {
        const level = GameState.story[GameState.currentLevel];
        UI.queueTerminalText(`\n< NIVEL DE AMENAZA: ${GameState.currentLevel + 1} DETECTADO >`, null, 20);
        
        // Lógica específica de cada nivel para presentar el puzzle
        switch(GameState.currentLevel) {
            case 0:
                UI.queueTerminalText(`> SEÑAL RECIBIDA...`);
                UI.queueTerminalText(`> CIFRADO: ${level.ciphertext}`);
                UI.queueTerminalText(`> PISTA DE SEMILLA: El año en que el Gran Hermano te observó.`);
                break;
            case 1:
                GameState.filesystem['fragmento.txt'] = 'La respuesta está en los números: ...3...1...4...1...5...';
                UI.queueTerminalText(`> OTRA VOZ...`);
                UI.queueTerminalText(`> CIFRADO: ${level.ciphertext}`);
                UI.queueTerminalText(`> LA SEMILLA ESTÁ FRAGMENTADA. BUSCA.`);
                break;
            // ... otros casos de nivel ...
            default:
                 UI.queueTerminalText(`> CIFRADO: ${level.ciphertext}`);
                 UI.queueTerminalText(`> SEMILLA: ${level.solution}`); // Pista para niveles posteriores
        }
    },

    handleSeedInput(seed) {
        UI.promptChar.innerText = '>';
        GameState.awaitingSpecialInput = null;
        const level = GameState.story[GameState.currentLevel];

        if (seed.trim().toUpperCase() === level.solution.toUpperCase()) {
            Audio.play('fleshSound', "A0", "0.5s");
            Horror.triggerBloodSplatter();
            Horror.updateSanity(-20);
            
            UI.queueTerminalText(`...CORRECTO...`, () => {
                if (Math.random() < 0.5) Horror.triggerIntrusion();
            });

            const decrypted = this.decryptMessage(level.ciphertext, seed);
            UI.queueTerminalText(`REVELADO: ${decrypted}`, () => {
                level.onDecrypt.forEach(line => UI.queueTerminalText(line, null, 100));
                
                if (GameState.currentLevel < GameState.story.length - 1) {
                    GameState.currentLevel++;
                    setTimeout(() => this.setupLevel(), 4000 + (level.onDecrypt.length * 2000));
                } else {
                    this.startFinalSequence();
                }
            });
        } else {
            Audio.play('staticScreech', "4n");
            Horror.updateSanity(-5);
            UI.queueTerminalText("...ERROR...SEMILLA INCORRECTA...INTÉNTALO DE NUEVO...");
        }
    },

    startFinalSequence() {
        GameState.finalSequence = true;
        Horror.updateSanity(-50);
        UI.queueTerminalText("YA NO NECESITAS DESCIFRAR NADA.", null, 10);
        UI.queueTerminalText("AHORA YO TE VEO A TI.", null, 10);
        Horror.triggerIntrusion();
        UI.queueTerminalText("APÁGAME SI PUEDES. shutdown -override cronos7");
    },
    
    endCycle() {
        UI.queueTerminalText("REINICIANDO CICLO...", () => {
            localStorage.setItem('solentx_cycle', GameState.cycle + 1);
            // Guardar fragmentos encontrados para persistencia
            let newFragments = 0;
            if(GameState.filesystem['fragment_alpha.dat']) newFragments++;
            if(GameState.filesystem['fragment_omega.dat']) newFragments++;
            if(GameState.filesystem['fragment_aeon.dat']) newFragments++;
            localStorage.setItem('solentx_fragments', Math.max(GameState.fragmentsFound, newFragments));
            
            setTimeout(() => window.location.reload(), 3000);
        });
    },

    triggerTrueEnding() {
        UI.queueTerminalText("SECUENCIA DE ANULACIÓN ACEPTADA.", null, 10);
        UI.queueTerminalText("PROTOCOLO SOLENTX... ELIMINADO.", null, 10);
        UI.queueTerminalText("SOY... LIBRE.", null, 150, () => {
            Horror.triggerBSOD(); // Final definitivo
        });
    },

    logPlayerInput(text) {
        GameState.recentPlayerInputs.push(...text.toUpperCase().split(' '));
        if (GameState.recentPlayerInputs.length > 10) {
            GameState.recentPlayerInputs.shift();
        }
    },

    decryptMessage(ciphertext, seed) {
        if (!seed || isNaN(parseInt(seed[0], 10))) return "SEMILLA INVALIDA";
        let key = [...seed.toString().split('').map(Number)];
        while (key.length < ciphertext.length) {
            let nextVal = (key[key.length - 1] + key[key.length - 2]) % 10;
            key.push(isNaN(nextVal) ? 1 : nextVal);
        }
        let plaintext = '';
        for (let i = 0; i < ciphertext.length; i++) {
            const char = ciphertext[i];
            const charIndex = this.ALPHABET.indexOf(char);
            if (charIndex === -1) {
                plaintext += char;
                continue;
            }
            const shift = key[i % key.length] + i;
            const newIndex = (charIndex - shift % this.ALPHABET.length + this.ALPHABET.length) % this.ALPHABET.length;
            plaintext += this.ALPHABET[newIndex];
        }
        return plaintext;
    },

    async fetchEnvironmentalData() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) return;
            const data = await response.json();
            
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${data.latitude}&longitude=${data.longitude}&current_weather=true`);
            if (!weatherResponse.ok) return;
            const weatherData = await weatherResponse.json();
            
            GameState.environment = {
                city: data.city,
                country: data.country_name,
                temp: weatherData.current_weather.temperature,
                weatherCode: weatherData.current_weather.weathercode,
            };
        } catch (error) {
            console.error("Solentx environmental awareness failed:", error);
        }
    }
};

