// js/ui.js
// Este módulo gestiona toda la manipulación del DOM y la interfaz de usuario.
import { GameState } from './state.js';

export const UI = {
    elements: {}, // Se llenará en initialize

    initialize() {
        this.elements = {
            lobbyContainer: document.getElementById('lobby-container'),
            gameContainer: document.getElementById('game-container'),
            jumpscareContainer: document.getElementById('jumpscare-container'),
            bsodContainer: document.getElementById('bsod-container'),
            terminalOutput: document.getElementById('terminal-output'),
            terminalInput: document.getElementById('terminal-input'),
            promptChar: document.getElementById('prompt-char'),
            headerText: document.getElementById('header-text'),
            screenContent: document.getElementById('screen-content'),
            startButton: document.getElementById('start-button'),
            instructionsButton: document.getElementById('instructions-button'),
            closeInstructionsButton: document.getElementById('close-instructions-button'),
            instructionsModal: document.getElementById('instructions-modal'),
            instructionsContent: document.getElementById('instructions-content'),
        };
        this.elements.instructionsContent.textContent = `OBJETIVO: Sobrevivir.\n\nCOMANDOS:\n ls, leer, desencriptar\n analizar, purga, conectar\n shutdown -override <código>\n anular <fragmento1> <fragmento2> <fragmento3>`;
    },
    
    // --- LÓGICA DE LA MÁQUINA DE ESCRIBIR Y COLA (CON AUTO-SCROLL) ---
    
    typeWriter(text, onComplete, speed = 50) {
        let i = 0;
        GameState.isTyping = true;
        this.setInputActive(false);

        const type = () => {
            if (i < text.length) {
                this.elements.terminalOutput.innerHTML += text.charAt(i);
                i++;
                this.scrollToBottom();
                setTimeout(type, speed);
            } else {
                this.elements.terminalOutput.innerHTML += '<br>';
                this.scrollToBottom();
                GameState.isTyping = false;
                if (onComplete) {
                    onComplete();
                } else {
                    this.processQueue(); // Si no hay callback, procesar el siguiente en la cola
                }
            }
        };
        type();
    },

    processQueue() {
        if (!GameState.isTyping && GameState.typingQueue.length > 0) {
            const item = GameState.typingQueue.shift();
            this.typeWriter(item.content, item.onComplete, item.speed);
        } else if (!GameState.isTyping && GameState.typingQueue.length === 0) {
            // Si la cola está vacía, reactivar el input
            this.finalizeCommand();
        }
    },

    queueTerminalText(text, onComplete = null, speed = 50) {
        GameState.typingQueue.push({ content: text, onComplete, speed });
        if (!GameState.isTyping) {
            this.processQueue();
        }
    },

    // --- FUNCIONES DE CONTROL DE UI ---

    scrollToBottom() {
        this.elements.screenContent.scrollTop = this.elements.screenContent.scrollHeight;
    },

    setInputActive(isActive) {
        this.elements.terminalInput.disabled = !isActive;
        if (isActive) {
            this.elements.terminalInput.focus();
        }
    },

    // Función clave para reactivar el input después de que todo termina
    finalizeCommand() {
        if (!GameState.awaitingSpecialInput) {
            this.setInputActive(true);
        }
    },

    clearTerminal() {
        this.elements.terminalOutput.innerHTML = '';
    },

    // --- ANIMACIÓN DEL LOBBY ---
    initLobbyBackground() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('bg-canvas'),
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const geometry = new THREE.IcosahedronGeometry(2.5, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        camera.position.z = 5;

        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            sphere.rotation.x += 0.001;
            sphere.rotation.y += 0.002;
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Guardamos el ID para poder cancelarlo al iniciar el juego
        this.lobbyAnimationId = animationId;
    },
};

