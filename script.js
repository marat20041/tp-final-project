const tempEl = document.getElementById("temp");
const lightEl = document.getElementById("light");
const distanceEl = document.getElementById("distance");
const realOpeningEl = document.getElementById("realOpening");
const targetOpeningEl = document.getElementById("targetOpening");
const modeEl = document.getElementById("mode");
const motorStateEl = document.getElementById("motorState");
const directionEl = document.getElementById("direction");
const speedEl = document.getElementById("speed");
const alertTextEl = document.getElementById("alertText");

const slider = document.getElementById("targetSlider");
const sliderValue = document.getElementById("sliderValue");

slider.addEventListener("input", () => {
    sliderValue.textContent = slider.value;
});

async function loadState() {
    try {
        const response = await fetch("http://localhost:7071/api/state");
        const state = await response.json();

        tempEl.textContent = state.temperature;
        lightEl.textContent = state.light;
        distanceEl.textContent = state.distance;
        realOpeningEl.textContent = state.realOpening;
        targetOpeningEl.textContent = state.targetOpening;
        modeEl.textContent = state.mode;
        motorStateEl.textContent = state.motorState;
        directionEl.textContent = state.direction;
        speedEl.textContent = state.speed;
        alertTextEl.textContent = state.alert;

        slider.value = state.targetOpening;
        sliderValue.textContent = state.targetOpening;
    } catch (error) {
        console.error("Erreur chargement état :", error);
    }
}

async function sendCommand(command, value = null) {
    try {
        const response = await fetch("http://localhost:7071/api/command", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ command, value })
        });

        const result = await response.json();
        console.log("Commande envoyée :", result);

        await loadState();
    } catch (error) {
        console.error("Erreur envoi commande :", error);
    }
}

function setMode(mode) {
    sendCommand("set_mode", mode);
}

function sendTarget() {
    const value = parseInt(slider.value);
    sendCommand("set_target", value);
}

loadState();
setInterval(loadState, 3000);