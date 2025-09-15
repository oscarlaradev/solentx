// js/state.js
// Este módulo centraliza todo el estado mutable del juego.
export const GameState = {
    currentLevel: 0,
    sanity: 100,
    environment: null,
    filesystem: {},
    awaitingSpecialInput: null,
    finalSequence: false,
    isTyping: false,
    typingQueue: [],
    recentPlayerInputs: [],
    soundsReady: false,
    cycle: 1, // Ciclo actual del jugador
    fragmentsFound: 0, // Fragmentos de anulación encontrados
    story: [], // La narrativa se cargará aquí
};

