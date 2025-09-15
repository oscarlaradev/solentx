// --- MÓDULO: PUNTO DE ENTRADA (MAIN) ---
// Su única función es inicializar y conectar los demás módulos.

import { GameLogic } from './js/gamelogic.js';
import { UI } from './js/ui.js';
import { Audio } from './js/audio.js';
import { GameState } from './js/state.js';
import { CommandHandler } from './js/commands.js';

window.onload = () => {
    // Inicialización del Lobby con Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
    scene.add(sphere);
    camera.position.z = 5;
    function animateLobby() { 
        GameState.threeJsAnimationId = requestAnimationFrame(animateLobby); 
        sphere.rotation.x += 0.001; 
        sphere.rotation.y += 0.002; 
        renderer.render(scene, camera); 
    }
    animateLobby();
    window.addEventListener('resize', () => { 
        camera.aspect = window.innerWidth / window.innerHeight; 
        camera.updateProjectionMatrix(); 
        renderer.setSize(window.innerWidth, window.innerHeight); 
    });

    document.getElementById('instructions-content').textContent = `OBJETIVO: Sobrevivir el ciclo.\n\nCOMANDOS BASE:\n  ayuda, ls, leer, desencriptar\n\nCOMANDOS AVANZADOS:\n  analizar, purga, tiempo, reparar\n\nCOMANDOS SECRETOS:\n  shutdown, fragmento, anular`;

    document.getElementById('start-button').addEventListener('click', async () => {
        if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') await Tone.start();
        if (!Audio.isSetup) Audio.setup();
        GameState.soundsReady = true;
        GameLogic.startGame();
    });
    
    document.getElementById('instructions-button').addEventListener('click', () => document.getElementById('instructions-modal').classList.remove('hidden'));
    document.getElementById('close-instructions-button').addEventListener('click', () => document.getElementById('instructions-modal').classList.add('hidden'));
    
    UI.terminalInput.addEventListener('keydown', (e) => {
         if (e.key === 'Enter' && !UI.terminalInput.disabled) {
            const commandText = UI.terminalInput.value.trim();
            if (commandText === '') return;
            GameState.recentPlayerInputs.push(...commandText.split(' '));
            if(GameState.recentPlayerInputs.length > 10) GameState.recentPlayerInputs.shift();
            UI.terminalInput.value = '';
            UI.queueTerminalText(`> ${commandText}`, () => {
                if (GameState.awaitingSpecialInput) {
                    GameState.awaitingSpecialInput(commandText);
                } else {
                    CommandHandler.process(commandText);
                }
            }, 0);
        }
    });

    GameLogic.initialize();
};

