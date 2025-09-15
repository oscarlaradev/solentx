import { GameState } from './js/state.js';
import { UI } from './js/ui.js';
import { Audio } from './js/audio.js';
import { GameLogic } from './js/gamelogic.js';
import { CommandHandler } from './js/commands.js';

// --- INICIALIZACIÓN GLOBAL ---
window.onload = () => {
    // Inicializar los módulos principales
    UI.initialize();
    Audio.initialize();
    
    // Configurar Event Listeners del Lobby
    UI.elements.startButton.addEventListener('click', async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        if (!GameState.soundsReady) {
            Audio.setupSounds();
        }
        GameLogic.startGame();
    });

    UI.elements.instructionsButton.addEventListener('click', () => {
        UI.elements.instructionsModal.classList.remove('hidden');
    });

    UI.elements.closeInstructionsButton.addEventListener('click', () => {
        UI.elements.instructionsModal.classList.add('hidden');
    });

    // --- MANEJADOR DE ENTRADA DEL TECLADO (CORREGIDO) ---
    UI.elements.terminalInput.addEventListener('keydown', (e) => {
        // Solo procesar 'Enter' si el juego no está escribiendo y el input está activo
        if (e.key === 'Enter' && !GameState.isTyping && !UI.elements.terminalInput.disabled) {
            const commandText = UI.elements.terminalInput.value.trim();
            
            // Si no hay texto, no hacer nada
            if (commandText.length === 0) return;

            // Limpiar y desactivar el input inmediatamente
            UI.elements.terminalInput.value = '';
            UI.setInputActive(false);

            // Mostrar el comando del jugador en la terminal y hacer scroll
            UI.elements.terminalOutput.innerHTML += `> ${commandText}<br>`;
            UI.scrollToBottom();

            // Guardar el input para la IA y procesar el comando
            GameLogic.logPlayerInput(commandText);

            if (GameState.awaitingSpecialInput) {
                // Si el juego espera una entrada especial (como una semilla)
                GameState.awaitingSpecialInput(commandText);
            } else {
                // Procesar un comando normal
                CommandHandler.process(commandText);
            }
        }
    });

    // Iniciar la animación del fondo del lobby
    UI.initLobbyBackground();
};

