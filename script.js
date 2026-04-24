const temp = document.getElementById("temp");
const light = document.getElementById("light");
const distance = document.getElementById("distance");
const doorOpening = document.getElementById("doorOpening");
const doorTargetOpening = document.getElementById("doorTargetOpening");
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
        const response = await fetch("http://localhost:7071/api/state");
        const state = await response.json();

        temp.textContent = state.temperature;
        light.textContent = state.light;
        distance.textContent = state.distance;
        doorOpening.textContent = state.doorOpening;
        doorTargetOpening.textContent = state.doorTargetOpening;
        mode.textContent = state.mode;
        motorState.textContent = state.motorState;
        direction.textContent = state.direction;
        speed.textContent = state.speed;
        alertText.textContent = state.alert;

        slider.value = state.doorTargetOpening;
        sliderValue.textContent = state.doorTargetOpening;
        console.log("État chargé :", state);
    } catch (error) {
        console.error("Erreur chargement état :", error);
    }
}

async function sendCommand(command, value = null) {
    try {
        console.log("Envoi commande :", command, value);

        const response = await fetch("http://localhost:7071/api/command", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ command, value })
        });

        console.log("Réponse reçue :", response.status, response.statusText);

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
    console.log("Envoi target :", slider.value);
    const value = parseInt(slider.value);
    sendCommand("set_target", value);
    console.log("Target envoyé :", value);
}

loadState();
setInterval(loadState, 3000);