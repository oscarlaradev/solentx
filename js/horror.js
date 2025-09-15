// --- MÓDULO: MOTOR DE HORROR (HORROR) ---
import { GameState } from './state.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { GameLogic } from './gamelogic.js';

export const Horror = {
    updateSanity: function(change) {
        if (GameState.isEnding) return;
        GameState.sanity += change;
        if (GameState.sanity > 100) GameState.sanity = 100;
        const screen = document.getElementById('screen-content');
        screen.classList.remove('system-insanity-low', 'system-insanity-medium', 'system-insanity-high');
        if (GameState.sanity < 25) {
            screen.classList.add('system-insanity-high');
            Audio.play('heartBeat', {note: "C1", velocity: 1});
            Audio.play('whisper', {probability: 0.5});
            this.triggerInputBetrayal(0.2);
        } else if (GameState.sanity < 50) {
            screen.classList.add('system-insanity-medium');
            Audio.play('whisper', {probability: 0.2});
            this.triggerInputBetrayal(0.05);
        } else if (GameState.sanity < 75) {
            screen.classList.add('system-insanity-low');
        }
        if (GameState.sanity <= 0) GameLogic.endGame('jumpscare');
    },

    triggerTimeAwareness: function() {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        let message = `...${hour}:${minutes}... sé qué hora es para ti.`;
        if (hour >= 22 || hour <= 4) {
            message = `...es tarde... ${hour}:${minutes}... La hora perfecta para el miedo. ¿No deberías estar durmiendo?`;
            this.updateSanity(-15);
        } else {
            this.updateSanity(-5);
        }
        UI.queueTerminalText(message, null, 70);
    },

    triggerInputBetrayal: function(probability) {
        if (Math.random() < probability) {
            const inputField = UI.terminalInput;
            inputField.classList.add('input-shake');
            setTimeout(() => inputField.classList.remove('input-shake'), 400);
            const originalText = inputField.value;
            inputField.value = "TODOS MUEREN";
            setTimeout(() => {
                if(inputField.value === "TODOS MUEREN") inputField.value = originalText;
            }, 800);
        }
    },
    
    triggerBloodSplatter: function() {
        const monitor = document.querySelector('.monitor');
        const splatter = document.createElement('div');
        splatter.className = 'blood-splatter';
        monitor.appendChild(splatter);
        setTimeout(() => monitor.removeChild(splatter), 8000);
    },

    triggerIntrusion: async function() {
        if (GameState.environment) {
            const { city, temp, weatherCode } = GameState.environment;
            let intrusion = `...disfruta el silencio en ${city}... mientras dure...`;
            if (weatherCode >= 51 && weatherCode <= 67) intrusion = `...la lluvia en ${city} no limpiará tus pecados...`;
            else if (temp <= 10) intrusion = `...${temp}°C en ${city}... un frío sepulcral...`;
            UI.queueTerminalText(intrusion, null, 100);
        }
    },

    triggerMimic: function() {
        if (GameState.recentPlayerInputs.length < 2 || Math.random() > 0.3) return;
        const mimicWord = GameState.recentPlayerInputs[Math.floor(Math.random() * GameState.recentPlayerInputs.length)];
        UI.queueTerminalText(`> ${mimicWord}`);
        UI.queueTerminalText("...espera... ¿eso lo escribí yo?", () => { this.updateSanity(-5); }, 150);
    },
    
    fetchEnvironmentalData: async function() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) return;
            const data = await response.json();
            GameState.environment = { city: data.city, country: data.country_name, lat: data.latitude, lon: data.longitude };
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${data.latitude}&longitude=${data.longitude}&current_weather=true`);
            const weatherData = await weatherResponse.json();
            GameState.environment.temp = weatherData.current_weather.temperature;
            GameState.environment.weatherCode = weatherData.current_weather.weathercode;
        } catch (error) {
            console.error("Fallo la conciencia ambiental de Solentx:", error);
        }
    }
};

