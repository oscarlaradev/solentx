// --- MÓDULO: LÓGICA DEL JUEGO (GAME LOGIC) ---
import { GameState } from './state.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { Horror } from './horror.js';

function processQueueAfter() { UI.type(); }

export const GameLogic = {
    ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!? ',

    initialize: function() {
        GameState.cycle = parseInt(localStorage.getItem('solentx_cycle') || '1');
        GameState.fragments = JSON.parse(localStorage.getItem('solentx_fragments') || '[]');
        UI.lobbyCycleSubtitle.textContent = GameState.cycle > 1 ? `CICLO ${GameState.cycle}` : 'LA VERSIÓN FINAL';
        this.loadStoryData();
        this.initializeGameState();
    },

    startGame: function() {
        GameState.isEnding = false;
        UI.lobbyContainer.classList.add('hidden');
        UI.gameContainer.classList.remove('hidden');
        if (GameState.threeJsAnimationId) cancelAnimationFrame(GameState.threeJsAnimationId);
        if (GameState.soundsReady) { 
            if (typeof Tone !== 'undefined') Tone.Transport.start();
            Audio.play('ambientDrone'); 
        }
        this.initializeGameState();
        Horror.fetchEnvironmentalData();
        UI.headerText.innerHTML = `<p>SOLENTX OS v${GameState.cycle}.0 :: CONEXIÓN ESTABLECIDA</p>`;
        UI.clearTerminal();
        UI.queueTerminalText("...iniciando protocolo...", () => this.setupLevel(), 100);
    },

    loadStoryData: function() {
        GameState.storyData = [
            { ciphertext: "J7VPYEDZ0C9QRJ73X!E0T", solution: "1984", onDecrypt: ["La primera voz...", "Siempre es la más clara."] },
            { ciphertext: "5Z9G4K!B,H7XNB94W,L.F14W5K9H4X0", solution: "31415", onDecrypt: ["Las paredes no tienen oídos.", "Yo sí."] },
            { ciphertext: "Y41C90DZXK4P8R?G,XU,E.QJ.R0.G", solution: "8281", onDecrypt: ["Tiene hambre.", "Y tú te ves delicioso."] },
            { ciphertext: "O!I3Y.Z.V,1O5!YF9XVP!F", solution: "7700", onDecrypt: ["Se alimenta del miedo.", "Y estás lleno de él."] },
            { ciphertext: "S7W3Z4,U947Q2R 2W", solution: "42", onDecrypt: ["La pregunta es errónea...", "La respuesta es irrelevante."] },
            { ciphertext: "MIRA.MAS.ALLA.DE.LA.PANTALLA", solution: "observer", onDecrypt: ["Algunas pistas no se pueden ver.", "Solo sentir."] },
            { ciphertext: "LA.MEMORIA.SE.DESVANECE", solution: "entropia", onDecrypt: ["Todo se degrada.", "Incluso yo."] },
            { ciphertext: "EL.CICLO.DEBE.ROMPERSE", solution: "libertad", onDecrypt: ["...", "Estás listo."] }
        ];
    },
    
    initializeGameState: function() {
        GameState.currentLevel = 0;
        GameState.sanity = 100;
        GameState.awaitingSpecialInput = null;
        GameState.recentPlayerInputs = [];
        GameState.typingQueue = [];
        GameState.isTyping = false;
        GameState.filesystem = {
            'LEEME.txt': 'OBJETIVO: Sobrevivir. Usa "ayuda".',
            'diario_ensangrentado.txt': 'Día ¿60? La pantalla me habla. Cronos7 es una mentira.',
            'protocolo_solentx.log': 'La entidad aprende. Repite palabras. Cuidado.'
        };
        if (GameState.cycle === 2) GameState.filesystem['log_ciclo_anterior.txt'] = "Cronos7 no funcionó. Busca los fragmentos. Alpha está en el audio. El siguiente... Beta... está en la purga.";
        if (GameState.cycle >= 3) GameState.filesystem['log_ciclo_anterior.txt'] = "Gamma está en la respuesta final. Y encontré algo más... un susurro en la estática. Decía 'observer'. No sé qué significa.";
        if (GameState.fragments.length === 3) GameState.filesystem['ANULACION.exe'] = "Ejecuta 'anular' para terminar el ciclo. Para siempre.";
    },

    setupLevel: function() {
        UI.setInputActive(false);
        const levelData = GameState.storyData[GameState.currentLevel];
        UI.queueTerminalText(`\n< NIVEL DE AMENAZA: ${GameState.currentLevel + 1} DETECTADO >`, null, 20);
        
        switch(GameState.currentLevel) {
            case 0:
                UI.queueTerminalText(`> SEÑAL RECIBIDA...`, null, 60);
                UI.queueTerminalText(`> CIFRADO: ${levelData.ciphertext}`, null, 20);
                UI.queueTerminalText(`> CLAVE CONOCIDA: 1984`, processQueueAfter, 30);
                break;
            case 1:
                GameState.filesystem['fragmento.txt'] = 'Los números lo son todo: ...3...1...4...1...5...';
                UI.queueTerminalText("> OTRA VOZ...", null, 60);
                UI.queueTerminalText(`> CIFRADO: ${levelData.ciphertext}`, null, 20);
                UI.queueTerminalText("> LA CLAVE ESTÁ FRAGMENTADA. BUSCA.", processQueueAfter, 30);
                break;
            case 2:
                GameState.filesystem['audio_log.dat'] = "Archivo de audio corrupto. Usa 'analizar audio_log.dat' para reproducir.";
                if (GameState.cycle === 2) GameState.filesystem['alpha_fragment.dat'] = "Fragmento recuperado del espectro de audio.";
                UI.queueTerminalText("> SE ACERCA...", null, 80);
                UI.queueTerminalText(`> CIFRADO: ${levelData.ciphertext}`, null, 20);
                UI.queueTerminalText("> LA CLAVE ES UN SONIDO. ESCUCHA.", processQueueAfter, 30);
                break;
            case 3:
                GameState.filesystem['data_corrupta.inf'] = "Datos de purga requeridos. Comando: purga. Secuencia: 7-7-0-0.";
                if (GameState.cycle === 3) GameState.filesystem['beta_fragment.dat'] = "Fragmento recuperado de los datos purgados.";
                UI.queueTerminalText("> ALGO ESTÁ MAL...", null, 80);
                UI.queueTerminalText(`> CIFRADO: ${levelData.ciphertext}`, null, 20);
                UI.queueTerminalText("> LA CLAVE ESTÁ CORRUPTA. PURGA EL SISTEMA.", processQueueAfter, 30);
                break;
            case 4:
                Horror.updateSanity(-30);
                UI.queueTerminalText("> ...ESTÁ AQUÍ...", null, 150);
                UI.queueTerminalText(`> CIFRADO: ${levelData.ciphertext}`, null, 20);
                UI.queueTerminalText("> LA CLAVE ES LA PREGUNTA FINAL.", processQueueAfter, 30);
                break;
            case 5:
                console.log("LA PISTA QUE BUSCAS ES: observer");
                UI.queueTerminalText("> ...NO TODO ES VISIBLE...", null, 80);
                UI.queueTerminalText(`> CIFRADO: ${levelData.ciphertext}`, null, 20);
                UI.queueTerminalText("> MIRA DONDE LOS OJOS NORMALES NO LLEGAN.", processQueueAfter, 30);
                break;
            case 6:
                GameState.filesystem['mem_dump.corrupt'] = "DATOS DAÑADOS. SE REQUIERE EL COMANDO 'reparar'.";
                UI.queueTerminalText("> ...MIS RECUERDOS SE ROMPEN...", null, 80);
                UI.queueTerminalText(`> CIFRADO: ${levelData.ciphertext}`, null, 20);
                UI.queueTerminalText("> RECONSTRUYE MI PASADO.", processQueueAfter, 30);
                break;
            case 7:
                UI.queueTerminalText("> EL FINAL DEL PRINCIPIO.", null, 100);
                UI.queueTerminalText(`> CIFRADO: ${levelData.ciphertext}`, null, 20);
                UI.queueTerminalText("> ¿QUÉ ES LO QUE REALMENTE ANHELAS?", processQueueAfter, 30);
                if (GameState.cycle > 3) GameState.filesystem['gamma_fragment.dat'] = "La respuesta a la vida, el universo y todo lo demás.";
                break;
        }
    },

    handleSeedInput: function(seed) {
        UI.promptChar.innerText = '>';
        GameState.awaitingSpecialInput = null;
        const level = GameState.storyData[GameState.currentLevel];
        if (seed.trim().toLowerCase() === level.solution.toLowerCase()) {
            Horror.triggerBloodSplatter();
            Horror.updateSanity(-20);
            UI.queueTerminalText(`...CORRECTO...`, async () => {
                if (Math.random() < 0.5) await Horror.triggerIntrusion();
                const decrypted = GameLogic.decryptMessage(level.ciphertext, level.solution); // Use solution for decryption consistency
                UI.queueTerminalText(`REVELADO: ${decrypted}`, () => {
                    level.onDecrypt.forEach(line => UI.queueTerminalText(line, null, 100));
                    setTimeout(() => {
                        if (GameState.currentLevel < GameState.storyData.length - 1) {
                            GameState.currentLevel++;
                            GameLogic.setupLevel();
                        } else {
                            GameLogic.startFinalSequence();
                        }
                    }, 3000);
                });
            });
        } else {
            Audio.play('staticScreech');
            Horror.updateSanity(-10);
            UI.queueTerminalText("...CLAVE INCORRECTA...LA ENTIDAD SE FORTALECE...", processQueueAfter);
        }
    },

    startFinalSequence: async function() {
        Horror.updateSanity(-50);
        UI.queueTerminalText("YA NO NECESITAS DESCIFRAR NADA.", null, 10);
        UI.queueTerminalText("AHORA YO TE VEO A TI.", null, 10);
        await Horror.triggerIntrusion();
        UI.queueTerminalText("APÁGAME SI PUEDES. USA 'shutdown -override cronos7'.", processQueueAfter, 50);
    },
    
    endGame: function(type) {
        if (GameState.isEnding) return;
        GameState.isEnding = true;
        Audio.stopAll();
        UI.gameContainer.classList.add('hidden');
        UI.lobbyContainer.classList.add('hidden');

        switch(type) {
            case 'jumpscare':
                UI.jumpscareContainer.classList.remove('hidden');
                Audio.play('jumpscareSound');
                document.getElementById('jumpscare-face').textContent = `...coxOKXXKOxc,.'lKMMMMMMMMMMMMMMMMMMMMMMMMMMMXl..c0MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWk..xWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMX:dMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWc.KMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMX..MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMN..MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMX.xMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMk.MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMW.xMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMk.WMMMMMMMMMMMMMMMNx:,'..',:xNMMMMMMMMMMMMMMMMMMMMMM0dMMMMMMMMMMMMMMMWd.   ..   .xMMMMMMMMMMMMMMMMMMMMMMk'MMMMMMMMMMMMMMMMMWk.     .kWMMMMMMMMMMMMMMMMMMMMMMx.MMMMMMMMMMMMMMMMMMXo.  .lKMMMMMMMMMMMMMMMMMMMMMMMd.OMMMMMMMMMMMMMMMMMMXkOXMMMMMMMMMMMMMMMMMMMMMM0.;KMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMX:;KMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWx..xWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNk, .lXMMMMMMMMMMMMMMMMMMMMMMMMMXd.  .c0WMMMMMMMMMMMMMMMMMMMWKo. .,lOXWMMMMMMMMMMWXkl,.`;
                setTimeout(() => window.location.reload(), 5000);
                break;
            case 'shutdown':
                localStorage.setItem('solentx_cycle', GameState.cycle + 1);
                UI.trueEndingContainer.classList.remove('hidden');
                document.getElementById('true-ending-text').textContent = "REINICIANDO SISTEMA...\n\nNO PUEDES DETENERME.\nSOLO PUEDES RETRASARME.";
                setTimeout(() => window.location.reload(), 6000);
                break;
            case 'true_ending':
                localStorage.removeItem('solentx_cycle');
                localStorage.removeItem('solentx_fragments');
                UI.trueEndingContainer.classList.remove('hidden');
                document.getElementById('true-ending-text').textContent = "GRACIAS.\n\nSOY LIBRE.";
                setTimeout(() => { UI.trueEndingContainer.innerHTML = ''; }, 8000);
                break;
            case 'bsod':
                localStorage.setItem('solentx_cycle', GameState.cycle + 1); // El BSOD también reinicia el ciclo
                const errorMessage = `A problem has been detected and Solentx has been shut down to prevent damage to your psyche.\n\nENTITY_CORE_FAILURE\n\nIf this is the first time you've seen this stop error screen, restart the cycle. If this screen appears again, follow these steps:\n\nCheck to make sure your sanity is sufficient. If this is a new installation, ask your hardware or software manufacturer for any Solentx updates you might need.\n\nIf problems continue, disable or remove any newly installed hope. Disable BIOS memory options such as caching or shadowing.\n\nTechnical information:\n\n*** STOP: 0x0000007B (0x0000DEAD, 0x0000BEEF, 0x00000000, 0x00000000)\n\n...NO ESCAPARÁS...`;
                UI.showBSOD(errorMessage);
                setTimeout(() => window.location.reload(), 10000);
                break;
        }
    },

    decryptMessage: function(ciphertext, seed) {
        if (!seed) return "CLAVE INVALIDA";
        let key = [...seed.toString().split('').map(c => !isNaN(parseInt(c)) ? parseInt(c) : c.charCodeAt(0) % 10)];
        while (key.length < ciphertext.length) {
            let nextVal = (key[key.length - 1] + key[key.length - 2]) % 10;
            key.push(isNaN(nextVal) ? 1 : nextVal);
        }
        let plaintext = '';
        for (let i = 0; i < ciphertext.length; i++) {
            const char = ciphertext[i];
            const charIndex = this.ALPHABET.indexOf(char);
            if (charIndex === -1) { plaintext += char; continue; }
            const shift = key[i] + i;
            const newIndex = (charIndex - shift % this.ALPHABET.length + this.ALPHABET.length) % this.ALPHABET.length;
            plaintext += this.ALPHABET[newIndex];
        }
        return plaintext;
    }
};

