// js/horror.js
// Gestiona todos los eventos de terror, la sanidad y los efectos visuales.
import { GameState } from './state.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { GameLogic } from './gamelogic.js';

export const Horror = {
    updateSanity(change) {
        GameState.sanity += change;
        if (GameState.sanity > 100) GameState.sanity = 100;
        
        const screen = UI.elements.screenContent;
        // Limpiar clases de sanidad anteriores
        screen.className = screen.className.replace(/\bsystem-insanity-\w+/g, '').trim();

        if (GameState.sanity < 15) {
            screen.classList.add('system-insanity-critical');
            Audio.play('heartBeat', "C1", "2n", Tone.now(), 0.9);
        } else if (GameState.sanity < 25) {
            screen.classList.add('system-insanity-high');
            if (Math.random() < 0.3) Audio.play('whisper', "1s");
        } else if (GameState.sanity < 50) {
            screen.classList.add('system-insanity-medium');
            if (Math.random() < 0.2) Audio.play('whisper', "1s");
        } else if (GameState.sanity < 75) {
            screen.classList.add('system-insanity-low');
        }

        if (GameState.sanity <= 0) {
            this.triggerJumpscare();
        }
    },

    triggerBloodSplatter() {
        const monitor = document.getElementById('crt-monitor');
        const splatter = document.createElement('div');
        splatter.className = 'blood-splatter';
        monitor.appendChild(splatter);
        setTimeout(() => monitor.removeChild(splatter), 8000);
    },

    triggerJumpscare() {
        UI.elements.gameContainer.classList.add('hidden');
        UI.elements.lobbyContainer.classList.add('hidden');
        UI.elements.bsodContainer.classList.add('hidden');
        UI.elements.jumpscareContainer.classList.remove('hidden');
        
        Audio.stopAll();
        Audio.play('jumpscareSound', "C2", "1s");
        
        const faceElement = document.getElementById('jumpscare-face');
        faceElement.textContent = `
                      ...,coxOKXXKOxc,..
                  .';d0NMMMMMMMMMMMMMMMMMMNd,.
              .'lKMMMMMMMMMMMMMMMMMMMMMMMMMMMXl.
            .c0MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWk.
          .xWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMX:
         dMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWc
       .KMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMX.
      .MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMN.
     .MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMX.
     xMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMk
    .MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMW.
    xMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMc
    xMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMk
    .WMMMMMMMMMMMMMMMMMNx:,'..',:xNMMMMMMMMMMMMMMMMMMMMMMMM0
     dMMMMMMMMMMMMMMMMWd.   ..   .xMMMMMMMMMMMMMMMMMMMMMMMMk
     'MMMMMMMMMMMMMMMMMWk.       .kWMMMMMMMMMMMMMMMMMMMMMMMMx
      .MMMMMMMMMMMMMMMMMMXo.   .lKMMMMMMMMMMMMMMMMMMMMMMMMMd
       .OMMMMMMMMMMMMMMMMMMXkOXMMMMMMMMMMMMMMMMMMMMMMMMMM0.
         ;KMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMX:
           ;KMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWx.
             .xWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNk,
               .lXMMMMMMMMMMMMMMMMMMMMMMMMMMMXd.
                 .c0WMMMMMMMMMMMMMMMMMMMWKo.
                   .,lOXWMMMMMMMMMMWXkl,.
                         ...,,,,..
`;
    },

    triggerBSOD() {
        UI.elements.gameContainer.classList.add('hidden');
        UI.elements.jumpscareContainer.classList.add('hidden');
        UI.elements.bsodContainer.classList.remove('hidden');
        Audio.stopAll();
        Audio.play('staticScreech', '0.5s');

        // Reiniciar el juego después de un tiempo
        setTimeout(() => {
            localStorage.clear(); // Opcional: reiniciar completamente el progreso
            window.location.reload();
        }, 10000);
    },
    
    // --- EVENTOS DE TERROR SUTILES ---
    
    async triggerIntrusion() {
        if (!GameState.environment) return;
        const { city, country, temp, weatherCode } = GameState.environment;
        let intrusion = "";
        
        if (weatherCode >= 51 && weatherCode <= 67) { // Lluvia
            intrusion = `...la lluvia en ${city} no te salvará...`;
        } else if (temp <= 10) {
            intrusion = `...hace frío en ${city}, ${country}... ¿o el frío eres tú?`;
        } else if (temp >= 30) {
            intrusion = `...el calor en ${city} es sofocante... como mi presencia...`;
        } else {
            intrusion = `...disfruta la calma en ${city} mientras puedas...`;
        }
        UI.queueTerminalText(intrusion, null, 100);
    },

    triggerMimic() {
        if (GameState.recentPlayerInputs.length < 2 || Math.random() > 0.25) return;
        const mimicWord = GameState.recentPlayerInputs[Math.floor(Math.random() * GameState.recentPlayerInputs.length)];
        UI.queueTerminalText(`> ${mimicWord}`);
        UI.queueTerminalText("...¿dije eso yo? ¿o lo dijiste tú?", null, 150);
        this.updateSanity(-5);
    },

    triggerInputBetrayal() {
        if (Math.random() > 0.1) return; // 10% de probabilidad
        const originalInput = UI.elements.terminalInput.value;
        const betrayals = ["AYUDA", "NO PUEDO", "ESTA AQUI", "ME VE"];
        const betrayal = betrayals[Math.floor(Math.random() * betrayals.length)];
        
        UI.elements.terminalInput.value = "";
        let i = 0;
        const interval = setInterval(() => {
            if (i < betrayal.length) {
                UI.elements.terminalInput.value += betrayal[i];
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    UI.elements.terminalInput.value = originalInput;
                }, 1000);
            }
        }, 100);
    }
};

