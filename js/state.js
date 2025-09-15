// --- MÓDULO: ESTADO DEL JUEGO (STATE) ---
export const GameState = {
    currentLevel: 0,
    sanity: 100,
    environment: null,
    filesystem: {},
    awaitingSpecialInput: null,
    isTyping: false,
    typingQueue: [],
    recentPlayerInputs: [],
    soundsReady: false,
    cycle: 1,
    fragments: [],
    storyData: [],
    threeJsAnimationId: null,
    isEnding: false,
};

