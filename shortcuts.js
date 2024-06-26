const slider = document.getElementById("executeSpeedSlider");
const sliderStep = slider.max / 20;

const cmdHTMLContainer = document.getElementById("cmdLine");
const cmdHTML = document.getElementById("cmdLine").getElementsByClassName("cmd")[0];
const cmdHTMLFeedback = document.getElementById("cmdFeedback");
const validCmdColor = "#00c149";
const invalidCmdColor = "#ff5151";
const continueCmdColor = "#ff8531";

const ignoreElements = ["aufnahmeName", "aufnahmeZahl", "customDialog", "CommandSelect"];

let vimCmdMode = false;
let vimCmd = "";


function changeSliderBy(delta) {
    slider.value = parseInt(slider.value) + delta;
    updateSpeed();
}


function moveRam(delta) {
    // console.log("selectedRamModule:", selectedRamModule);
    // console.log("selectedRamModuleType:", typeof selectedRamModule)
    EditRam(CheckNumber(selectedRamModule + delta, 999, 0));
}


function focusInputElement(element) {
    element.focus();
    // moves cursor to the end of the input
    let val = element.value;
    element.value = '';
    element.value = val;
}


function undo() {
    historyPointer--;
    if (historyPointer < 0) {
        historyPointer = 0;
        window.alert("Bad luck... I cannot undo more actions for you");
        return;
    }
    let action = history[historyPointer];
    // console.log("Undoing action: ", action);
    // console.log(historyPointer, history);
    let num;
    if (action.action === "write" || action.action === "delete") {
        num = CheckNumber(parseInt(action.value.split(".").join("")), 19999, 0);
    }
    else if (action.action === "mcEdit") {
        num = parseInt(action.value);
    }
    switch (action.action) {
        case "write":
            history[historyPointer].value = document.getElementsByClassName("col2")[action.addr].innerText;
            writeToRam(num, action.addr);
            EditRam(action.addr);
            break;

        case "insert":
            selectedRamModule = action.addr;
            deleteRow(false);
            break;

        case "delete":
            selectedRamModule = action.addr;
            insertRowAbove(false);
            writeToRam(num, action.addr);
            break;

        case "mcEdit":
            history[historyPointer].value = MicroCode[action.addr];
            MicroCode[action.addr] = num;
            // console.log(num);
            document.getElementsByClassName("Mccol2")[action.addr].innerText = microCodeToText(num);
            localStorage.setItem("johnny-microcode", JSON.stringify(MicroCode));
            break;

	case "clearRam":
	    Ram = action.ram.slice();
	    localStorage.setItem("johnny-ram",JSON.stringify(Ram));
            updateRam();
	    EditRam(action.selected || 0);
	    break;

	case "resetMc":
	    MicroCode = action.mc.slice();
	    localStorage.setItem("johnny-microcode", JSON.stringify(MicroCode));
	    GenerateMicroCodeTable();
	    break;
	     	
    }
}

function redo() {
    if (historyPointer < 0 || historyPointer >= history.length) {
        historyPointer = history.length;
        console.warn("Nothing to redo");
        return;
    }
    let action = history[historyPointer];
    // console.log("Redoing", action);
    let num;
    if (action.action === "write") {
        num = CheckNumber(parseInt(action.value.split(".").join("")), 19999, 0);
    }
    else if (action.action === "mcEdit") {
        num = parseInt(action.value);
    }
    switch (action.action) {
        case "write":
            history[historyPointer].value = document.getElementsByClassName("col2")[action.addr].innerText;
            writeToRam(num, action.addr);
            EditRam(action.addr);
            break;

        case "insert":
            selectedRamModule = action.addr;
            insertRowAbove(false);
            break;

        case "delete":
            selectedRamModule = action.addr;
            deleteRow(false);
            break;

        case "mcEdit":
            history[historyPointer].value = MicroCode[action.addr];
            MicroCode[action.addr] = num;
            // console.log(num);
            document.getElementsByClassName("Mccol2")[action.addr].innerText = microCodeToText(num);
            localStorage.setItem("johnny-microcode", JSON.stringify(MicroCode));
            break;

	case "clearRam":
	    newRam(false);
	    break;

	case "resetMc":
	    resetMicrocode(false);
	    break;
	    
    }
    historyPointer++;
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
    Escape: () => {
        cmdHTML.classList.remove("afterExecution");
    },
    Delete: deleteRow, // check for shift hardcoded :(, but it works
    Insert: insertRowAbove,
    Q: aufnahme,
    A: () => { if (!controlUnit) {ToggleControlUnit()} focusInputElement(document.getElementById("aufnahmeZahl")); },
    N: () => { if (!controlUnit) {ToggleControlUnit()} focusInputElement(document.getElementById("aufnahmeName")); },
}

const ctrlShortcutMapping = {
    y: () => { lastHistoryUse = "redo"; redo(); },
    z: () => { lastHistoryUse = "undo"; undo(); },
    s: downloadRam,
    S: downloadMc,
    o: uploadRam,
    O: uploadMc,
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
    "h": HaltClick,
    "sr": downloadRam,
    "sm": downloadMc,
    "lr": uploadRam,
    "lm": uploadMc,
    "cr": newRam,
    "cm": resetMicrocode,
    "del": deleteRow,
    "rec": aufnahme,
    "cnf": () => {
        document.getElementById("settings_button").click();
    }
}


function EnterVimCmdMode() {
    console.log("Enter VIM CMD mode");
    vimCmdMode = true;
    vimCmd = "";
    document.getElementById("RamInput").blur();
    document.getElementById("RamInput").disabled = true;
    document.getElementById("AddressBusInput").disabled = true;
    document.getElementById("DataBusInput").disabled = true;
    document.getElementById("aufnahmeZahl").disabled = true;
    document.getElementById("aufnahmeName").disabled = true;
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
        // console.log(f);
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
    document.getElementById("RamInput").disabled = false;
    document.getElementById("AddressBusInput").disabled = false;
    document.getElementById("DataBusInput").disabled = false;
    document.getElementById("aufnahmeZahl").disabled = false;
    document.getElementById("aufnahmeName").disabled = false;
    let ramInput = document.getElementById("RamInput");
    ramInput.disabled = false;
    focusInputElement(ramInput);
    updateVisualCmdMode();
    cmdHTMLContainer.classList.remove("active");
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


function isIgnoreElements(target) {
    let ignore = [];
    ignoreElements.forEach(e => {
        let selector = "#" + e + " *";
        let children = document.querySelectorAll(selector);
        if (new Array(...children).includes(target) || e == target.id) {
            ignore.push(true);
        }
    });
    return ignore.length > 0;
}


function shortCutEventHandler(e) {
    if (modal.style.display !== "" && modal.style.display !== "none" || isIgnoreElements(e.target))  {
        console.warn("Settings are opened or an text input is selected; Shortcuts disabled");
        return;
    }
    else if (vimCmdMode) {
        switch (e.key) {
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
    else if (e.ctrlKey && !e.altKey && ctrlShortcutMapping.hasOwnProperty(e.key)) {
        e.preventDefault();
        ctrlShortcutMapping[e.key]();
    }
    else if (!e.ctrlKey && !e.altKey && functionMapping.hasOwnProperty(e.key)) {
        e.preventDefault();
        if (e.key !== "Delete" || useDeleteShortcut || (e.key === "Delete" && e.shiftKey)) {
            functionMapping[e.key]();
        }
    }
    else if (e.key.toLowerCase() === "c" && e.altKey && !e.ctrlKey) {
        e.preventDefault();
        if (e.shiftKey) {
            resetMicrocode();
        }
        else {
            newRam();
        }
    }
    else {
        // console.log(e);
    }
}

function emulateKeyPress(key, ctrlKey, altKey, metaKey) {
    if (!key) {
        console.debug("Key is ", key);
        return;
    }
    ctrlKey = ctrlKey ?? false;
    altKey = altKey ?? false;
    metaKey = metaKey ?? false;

    window.dispatchEvent(new KeyboardEvent(
        "keydown",
        {
            key: key,
            ctrlKey: ctrlKey,
            shiftKey: key.toUpperCase() === key,
            altKey: altKey,
            metaKey: metaKey,
        },
    ));
}

window.addEventListener("keydown", shortCutEventHandler);
window.addEventListener("keyup", (e) => {if (e.key === "Enter" && vimCmdMode) ExecuteVimCmd(); } );  // to prevent problems with custom dialogs
// document.getElementById("RamInput").addEventListener("keydown", shortCutEventHandler);
