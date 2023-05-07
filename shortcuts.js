const slider = document.getElementById("executeSpeedSlider");
const sliderStep = slider.max / 20;

function changeSliderBy(delta) {
    slider.value = parseInt(slider.value) + delta;
    updateSpeed();
}

function MoveRam(delta) {
    EditRam(CheckNumber(selectedRamModule + delta, 999, 1));
}

const functionMapping = {
    e: () => {
        resetComputer();
        executeProgramm();
    },
    s: SingleMacroStep,
    r: resetComputer,
    "+": () => { changeSliderBy(sliderStep) },
    "-": () => { changeSliderBy(-sliderStep) },
    p: pauseProgramm,
    "ArrowUp": () => { MoveRam(-1) },
    "ArrowDown": () => { MoveRam(+1) },
    k: () => { MoveRam(-1) },
    j: () => { MoveRam(+1) },
    S: () => microStep(true),
    u: () => {
        document.getElementById("controlUnitCheckbox").checked = !document.getElementById("controlUnitCheckbox").checked;
        ToggleControlUnit();
    }
}

function shortCutEventHandler(e) {
    if (functionMapping.hasOwnProperty(e.key)) {
        functionMapping[e.key]();
    }
    else if (e.key === "c" && e.altKey) {
        e.preventDefault();
        newRam();
    }
    else {
        console.log(e);
    }
}

window.addEventListener("keydown", shortCutEventHandler);
// document.getElementById("RamInput").addEventListener("keydown", shortCutEventHandler);
