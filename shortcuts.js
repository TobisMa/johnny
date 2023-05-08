const slider = document.getElementById("executeSpeedSlider");
const sliderStep = slider.max / 20;

const cmdHTMLContainer = document.getElementById("cmdLine");
const cmdHTML = document.getElementById("cmdLine").getElementsByClassName("cmd")[0];
const cmdHTMLFeedback = document.getElementById("cmdFeedback");
const validCmdColor = "#00c149";
const invalidCmdColor = "#ff5151";
const continueCmdColor = "#ff8531";

let vimCmdMode = false;
let vimCmd = "";


function changeSliderBy(delta) {
    slider.value = parseInt(slider.value) + delta;
    updateSpeed();
}


function moveRam(delta) {
    EditRam(CheckNumber(selectedRamModule + delta, 999, 1));
}


function focusInputElement(element) {
    element.focus();
    // moves cursor to the end of the input
    let val = element.value;
    element.value = '';
    element.value = val;
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
    v: EnterVimCmdMode,
    a: () => { focusInputElement(document.getElementById("AddressBusInput")) },
    d: () => { focusInputElement(document.getElementById("DataBusInput")) },
    w: () => { focusInputElement(document.getElementById("RamInput")) },
    Escape: () => { cmdHTML.classList.remove("afterExecution") },
    Delete: deleteRow
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
    "h": HaltClick
}


function EnterVimCmdMode() {
    console.log("Enter VIM CMD mode");
    vimCmdMode = true;
    vimCmd = "";
    document.getElementById("RamInput").blur();
    document.getElementById("RamInput").disabled = true;
    document.getElementById("AddressBusInput").disabled = true;
    document.getElementById("DataBusInput").disabled = true;
    cmdHTMLContainer.classList.remove("afterExecution");
    cmdHTMLContainer.classList.add("active");
}


function ExecuteVimCmd() {
    console.log("Execute VIM CMD:", vimCmd);
    if (!vimCmdMapping.hasOwnProperty(vimCmd)) {
        console.error("No VIM CMD:", vimCmd);
        cmdHTMLFeedback.innerText = `Unknown command '${vimCmd}'`;
        cmdHTMLContainer.classList.add("afterExecution");
    }
    else {
        let f = vimCmdMapping[vimCmd];
        console.log(f);
        try {
            f();
        }
        catch (e) {
            // IncPcClick fails always due to a missing number in an object
            console.error(e);
        }
    }
    LeaveVimCmdMode();
}


function LeaveVimCmdMode() {
    vimCmdMode = false;
    vimCmd = "";
    document.getElementById("AddressBusInput").disabled = false;
    document.getElementById("DataBusInput").disabled = false;
    let ramInput = document.getElementById("RamInput");
    ramInput.disabled = false;
    focusInputElement(ramInput);
    updateVisualCmdMode();
    cmdHTMLContainer.classList.remove("active")
    console.log("Left VIM CMD mode");

}


function updateVisualCmdMode() {
    cmdHTML.innerText = vimCmd;
    if (vimCmdMapping.hasOwnProperty(vimCmd)) {
        cmdHTML.style.color = validCmdColor;
    }
    else {
        let keys = Object.keys(vimCmdMapping)
        let found = false;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].startsWith(vimCmd)) {
                found = true;
                break;
            }
        }
        cmdHTML.style.color = found ? continueCmdColor : invalidCmdColor;
    }
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
            case "Backspace":
                vimCmd = vimCmd.substring(0, vimCmd.length - 1);
            default:
                if (e.ctrlKey && e.key === "c") {
                    LeaveVimCmdMode();
                }
                else if (e.ctrlKey || e.altKey) {
                    return;
                }
                else if (e.key.length == 1) {
                    vimCmd = vimCmd.concat(e.key);
                }
        }
        updateVisualCmdMode();
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
