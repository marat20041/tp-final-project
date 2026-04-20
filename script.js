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

// Fake data for now
let serreState = {
    temperature: 28.5,
    light: 72,
    distance: 15.4,
    realOpening: 40,
    targetOpening: 50,
    mode: "Automatique",
    motorState: "En marche",
    direction: "Ouverture",
    speed: 20,
    alert: "Aucune"
};

function renderState() {
    tempEl.textContent = serreState.temperature;
    lightEl.textContent = serreState.light;
    distanceEl.textContent = serreState.distance;
    realOpeningEl.textContent = serreState.realOpening;
    targetOpeningEl.textContent = serreState.targetOpening;
    modeEl.textContent = serreState.mode;
    motorStateEl.textContent = serreState.motorState;
    directionEl.textContent = serreState.direction;
    speedEl.textContent = serreState.speed;
    alertTextEl.textContent = serreState.alert;
}

function sendCommand(command) {
    console.log("Commande envoyée :", command);

    if (command === "open") {
        serreState.targetOpening = 100;
        serreState.mode = "Manuelle";
    }

    if (command === "close") {
        serreState.targetOpening = 0;
        serreState.mode = "Manuelle";
    }

    renderState();
}

function setMode(mode) {
    console.log("Mode envoyé :", mode);
    serreState.mode = mode;
    renderState();
}

function sendTarget() {
    const value = parseInt(slider.value);
    console.log("Nouvelle ouverture cible :", value);
    serreState.targetOpening = value;
    serreState.mode = "Manuelle";
    renderState();
}

renderState();