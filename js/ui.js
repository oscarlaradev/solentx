// --- MÓDULO: GESTOR DE UI (UI) ---
import { GameState } from './state.js';
import { Audio } from './audio.js';

export const UI = {
    lobbyContainer: document.getElementById('lobby-container'),
    gameContainer: document.getElementById('game-container'),
    jumpscareContainer: document.getElementById('jumpscare-container'),
    trueEndingContainer: document.getElementById('true-ending-container'),
    bsodContainer: document.getElementById('bsod-container'),
    terminalOutput: document.getElementById('terminal-output'),
    terminalInput: document.getElementById('terminal-input'),
    promptChar: document.getElementById('prompt-char'),
    headerText: document.getElementById('header-text'),
    lobbyCycleSubtitle: document.getElementById('lobby-cycle-subtitle'),
    
    setInputActive: function(isActive) {
        this.terminalInput.disabled = !isActive;
        if (isActive) this.terminalInput.focus();
    },

    type: function() {
        if (GameState.isTyping && GameState.typingQueue.length > 0) {
            const item = GameState.typingQueue.shift();
            let i = 0;
            const typeChar = () => {
                if (i < item.text.length) {
                    this.terminalOutput.innerHTML += item.text.charAt(i);
                    i++;
                    Audio.play('tick', { probability: 0.3 });
                    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
                    setTimeout(typeChar, item.speed);
                } else {
                    this.terminalOutput.innerHTML += '<br>';
                    if (item.onComplete) item.onComplete();
                    this.type();
                }
            };
            typeChar();
        } else {
            GameState.isTyping = false;
            if (!GameState.awaitingSpecialInput) this.setInputActive(true);
        }
    },

    queueTerminalText: function(text, onComplete = null, speed = 40) {
        GameState.typingQueue.push({ text, onComplete, speed });
        if (!GameState.isTyping) {
            GameState.isTyping = true;
            this.setInputActive(false);
            this.type();
        }
    },

    clearTerminal: function() { this.terminalOutput.innerHTML = ''; },

    showBSOD: function(message) {
        this.gameContainer.classList.add('hidden');
        this.bsodContainer.textContent = message;
        this.bsodContainer.classList.remove('hidden');
    }
};

