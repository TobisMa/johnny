const slider = document.getElementById("executeSpeedSlider");
const sliderStep = slider.max / 20;
let vimCmdMode = false;
let vimCmd = "";

function changeSliderBy(delta) {
    slider.value = parseInt(slider.value) + delta;
    updateSpeed();
}

function moveRam(delta) {
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
    "ArrowUp": () => { moveRam(-1) },
    "ArrowDown": () => { moveRam(+1) },
    k: () => { moveRam(-1) },
    j: () => { moveRam(+1) },
    S: () => microStep(true),
    u: () => {
        document.getElementById("controlUnitCheckbox").checked = !document.getElementById("controlUnitCheckbox").checked;
        ToggleControlUnit();
    },
    ":": EnterVimCmdMode,
    "v": EnterVimCmdMode,
}

const vimCmdMapping = {
    "a": ManuellAB,
    "a+": IncAccClick,
    "a++": IncAccClick,
    "a-": DecAccClick, 
    "a--": DecAccClick,
    "a0": NullAccClick,
    "ar": NullAccClick,
    "i": insertRowAbove,
    "dr": DbRamClick,
    "rd": RamDbClick,
    "d": ManuellDb,
    "da": DbAccClick,
    "p": AddAccClick,
    "s": SubAccClick,
    "ad": AccDbClick,
    "di": DbInsClick,
    "im": InsMcClick,
    "ip": InsPcClick,
    "ia": InsAdClick,
    "pa": PcAdClick,
    "p+": IncPcClick,
    "p++": IncPcClick,
    "=0": IncPc0Click,
    "m0": NullMcClick,
    "stop": HaltClick,
}


function EnterVimCmdMode() {
    console.log("Enter VIM CMD mode");
    vimCmdMode = true;
    vimCmd = "";
    document.getElementById("RamInput").blur();
    document.getElementById("RamInput").disabled = true;
}

function ExecuteVimCmd() {
    console.log("Execute VIM CMD:", vimCmd);
    if (!vimCmdMapping.hasOwnProperty(vimCmd)) {
        console.error("No VIM CMD:", vimCmd);
    }
    else {
        vimCmdMapping[vimCmd]();
    }
    LeaveVimCmdMode();
}

function LeaveVimCmdMode() {
    vimCmdMode = false;
    vimCmd = "";
    let ramInput = document.getElementById("RamInput");
    ramInput.disabled = false;
    ramInput.focus();
    let val = ramInput.value;
    ramInput.value = ''; // moves cursor to the end of the input
    ramInput.value = val;
    console.log("Left VIM CMD mode");
}

function shortCutEventHandler(e) {
    if (vimCmdMode) {
        switch (e.key) {
            case "Enter":
                ExecuteVimCmd();
                break;
            case "Escape":
                LeaveVimCmdMode();
                break;
            default:
                if (e.ctrlKey || e.altKey) {
                    return;
                }
                if (e.key.length == 1) {
                    vimCmd = vimCmd.concat(e.key);
                }
        }
    }
    else if (functionMapping.hasOwnProperty(e.key)) {
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
