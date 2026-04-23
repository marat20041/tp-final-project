const temp = document.getElementById("temp");
const light = document.getElementById("light");
const distance = document.getElementById("distance");
const realOpening = document.getElementById("realOpening");
const targetOpening = document.getElementById("targetOpening");
const mode = document.getElementById("mode");
const motorState = document.getElementById("motorState");
const direction = document.getElementById("direction");
const speed = document.getElementById("speed");
const alertText = document.getElementById("alertText");

const slider = document.getElementById("targetSlider");
const sliderValue = document.getElementById("sliderValue");

slider.addEventListener("input", () => {
    sliderValue.textContent = slider.value;
});

async function loadState() {
    try {
        const response = await fetch("/api/state");
        const state = await response.json();

        temp.textContent = state.temperature;
        light.textContent = state.light;
        distance.textContent = state.distance;
        realOpening.textContent = state.realOpening;
        targetOpening.textContent = state.targetOpening;
        mode.textContent = state.mode;
        motorState.textContent = state.motorState;
        direction.textContent = state.direction;
        speed.textContent = state.speed;
        alertText.textContent = state.alert;

        slider.value = state.targetOpening;
        sliderValue.textContent = state.targetOpening;
    } catch (error) {
        console.error("Erreur chargement état :", error);
    }
}

async function sendCommand(command, value = null) {
    try {
        const response = await fetch("/api/command", {
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
    console.log("Mode changé :", mode);
}

function sendTarget() {
    const value = parseInt(slider.value);
    sendCommand("set_target", value);
    console.log("Target envoyé :", value);
}

loadState();
setInterval(loadState, 3000);