/*
David Laubersheimer - 2019

mit dank an Dr. Peter Dauscher


*/
//daten die zückgesetzt werden müssen
var Addressbus = 0;
var Datenbus = 0;
var halt = false;
var Akkumulator = 0;
//var Eingabe; // evt unbenutzt ?
var pause = false;

var ins = 0;
var Programmzaeler = 0;

var MicroCodeCounter = 0;
var recording = false;
var recordingCounter = 150; //gibt an an welcher stelle
//150 zum testen

//daten die nicht zurückgesetzt werden müssen
var bonsai = false;
/*
var screenShown = false;
var resolution = 50; //allways square
var pixelSize;
*/
var timeoutforexecution  //zum abbrechen des ausführen des Programms
var alterProgrammzaeler = 0;
var geschwindigkeit = parseInt(localStorage.getItem("execSpeed")) || 1300; // intervall in dem Befehle ausgeführt werden

var selectedRamModule = 0;
var dataHighlightedRamModule = 0;

var controlUnit = false;
var numberDevisionChar = "." //für ändern zum komma beim englischen
var MicroCode = [];//0-199 microdeprogramm, 200+ namen der Macrocodes
var MicroCodeString = "";//nur zum Einlesen
var lines = [];

var blockFadeoutTime = 1200;

var blinkgeschwindigkeit = 700;
var blinkzyklus = 0;
var timeoutforblinking //damit das Blinken abgebrochen werden kann


var RamEingabeHeight //positionierung des Pfeils
var tabelHeight

var startScreenFadeOutTime = 1500; // für den Ladebildschirm
var loaded = false;

const ramSize = 1000  //this ideally has to be a multiple of 10
const ramLength = Math.log10(ramSize) + 1;

const allowedRamInputChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "Delete", "Backspace", "ArrowRight", "ArrowLeft"];
const digits = "0123456789".split("");
const allowedNameChars = new Array(..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ").concat("Delete", "Backspace",  "ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Insert", "Escape", "Shift", "Enter");

const RamInputSelect = document.getElementById("CommandSelect");

// settings
let fixRAM = true;
let linesAheadTop = 1;
let linesAheadBottom = 5;
let useDeleteShortcut = false;
let fixRamNumbersWithEq = false;

const history = [];
let historyMaxLength = 30;
let historyPointer = 0;
let lastHistoryUse = undefined;
let setFilenameOnSave = false;

const buttonIdFromText = {
	"db --> ram": 1,
	"ram --> db": 2,
	"db --> ins": 3,
	"ins --> ab": 4,
	"ins --> mc": 5,
	"mc:=0": 7,
	"pc --> ab": 8,
	"pc++": 9,
	"=0?pc++": 10,
	"ins --> pc": 11,
	"acc:=0": 12,
	"plus": 13,
	"minus": 14,
	"acc --> db": 15,
	"acc++": 16,
	"acc--": 17,
	"db --> acc": 18,
	"stop": 19
}

var Ram = JSON.parse(localStorage.getItem('johnny-ram'));
var eventListeners = {};


if (Ram == null) {//default if local store has been cleared or johnny is started for the first time
	Ram = [];
	for (i = 0; i < ramSize; i++) {
		Ram[i] = 0;

	}
}


var turboMode = false;

async function renameOwnMcCmd(e, recordPos, oldName) {
	let newName = await promptDialog("New Makroname: ", oldName);
	if (newName === undefined || newName.length === 0 || newName == oldName) {
		return;
	}
	else if (MicroCode.slice(200).includes(newName)) {
		warnDialog("Name already in use. Please choose another name");
		return;
	}
	console.log(recordPos);
	document.getElementsByClassName("Mccol1")[recordPos].innerText = recordPos + "   " + newName + ":";  // Name aktualisieren
	MicroCode[recordPos / 10 + 200] = newName;
	document.getElementById("CommandSelect").childNodes.forEach(element => {
		// console.log("reoldName mc: ");
		// console.log(element);
		if (element.value == recordPos / 10) { // NOTE: == necessary; no ===
			// console.log(element);
			element.innerText = zeroPad(recordPos / 10) + ": " + MicroCode[recordPos / 10 + 200];
		}
	})
	rows = document.querySelectorAll("#RamTBody .col4");
	for (let i = 0; i < 1000; i++) {
		if (rows[i].innerText === oldName) {
			rows[i].innerText = newName;
		}
	}
}

//funktionen ohne Zuordnung
async function initialize() {
	Befehlsauswahl = document.getElementById("CommandSelect");

	generateRam();

	MicroCode = JSON.parse(localStorage.getItem('johnny-microcode'));
	if (MicroCode == null) {
		resetMicrocode();
	} else {
		GenerateMicroCodeTable();
	}


	document.getElementById("executeSpeedSlider").value = 3000 - geschwindigkeit;
	document.getElementById("controlUnitCheckbox").checked = false;

	document.getElementById("AddressBusInput").addEventListener("keydown", AddressBusInputKeydown);//damit die Entertaste funktioniert
	document.getElementById("DataBusInput").addEventListener("keydown", DataBusInputKeydown);

	document.getElementById("RamInput").addEventListener("keydown", RamInputKeydown);
	document.getElementById("RamInput").addEventListener("focus", UpdateRamInputSelect);

	document.addEventListener("keydown", keyDownHandler); //nur zum überspringen des ladebildschirms (wird nach dem Laden wieder entfernt)
	document.addEventListener("mousedown", mouseDownHandler); //nur zum überspringen des ladebildschirms (wird nach dem Laden wieder entfernt)

	window.addEventListener('resize', resize);

	let aufnahmeAddrHighlight = (e) => {
		if (e.type === "keyup") {
			if (e.key.length === 1 && !digits.includes(e.key)) {
				e.preventDefault();
				if (e.key.length === 1) {  // yes, I bet. There won't be a function key like control, NumLock, ... whose name is only 1 char long
					e.target.value = e.target.value.substring(0, e.target.selectionStart - 1) + e.target.value.substring(e.target.selectionStart);
				}
				emulateKeyPress(e.key, e.ctrlKey, e.altKey, e.metaKey);
				return;
			}
			else if (e.key === "Enter" && e.shiftKey) {
				aufnahme();
			}
			else if (e.key === "Escape") {
				focusInputElement(document.getElementById("RamInput"));
			}
		}
		if (e.target.value) {
			let recordingStart = parseInt(e.target.value) * 10;
			if (recordingStart !== NaN && recordingStart > 9 && recordingStart < 200) {  // recording range [1..19]
				if (MicroCode[recordingStart] != 0) {
					e.target.style.outlineColor = "orange";
					return;  // don't let it override styles at the bottom
				}
			}
		}
		e.target.style.removeProperty("outline-color");
	}
	document.getElementById("aufnahmeZahl").addEventListener("keyup", aufnahmeAddrHighlight);
	document.getElementById("aufnahmeZahl").addEventListener("focusout", aufnahmeAddrHighlight);
	document.getElementById("aufnahmeZahl").addEventListener("focusin", aufnahmeAddrHighlight);

	let aufnahmeNameHighlight = (e) => {
		if (e.type === "keyup") {
			console.log(e);
			if (!allowedNameChars.includes(e.key)) {
				e.preventDefault();
				if (e.key.length === 1) {  // yes, I bet. There won't be a function key like control, NumLock, ... whose name is only 1 char long
					e.target.value = e.target.value.substring(0, e.target.selectionStart - 1) + e.target.value.substring(e.target.selectionStart);
				}
				emulateKeyPress(e.key, e.ctrlKey, e.altKey, e.metaKey);
				return;
			}
			else if (e.key === "Enter" && e.shiftKey) {
				console.log("Start recording");
				aufnahme();
			}
			else if (e.key === "Escape") {
				focusInputElement(document.getElementById("RamInput"));
				return;
			}
		}
		e.target.style.removeProperty("outline-color");
		if (e.target.value) {
			e.target.value = e.target.value.toUpperCase();
			let name = MicroCode[parseInt(document.getElementById("aufnahmeZahl").value) + 200];
			if (name !== undefined && name !== NaN) {
				if (name === e.target.value) {
					e.target.style.outlineColor = "orange";
				}
				else if (MicroCode.slice(200).includes(name)) {
					e.target.style.outlineColor = "red";
				}
			}
		}
	};
	document.getElementById("aufnahmeName").addEventListener("keyup", aufnahmeNameHighlight);
	document.getElementById("aufnahmeName").addEventListener("focusout", aufnahmeNameHighlight);
	document.getElementById("aufnahmeName").addEventListener("focusin", aufnahmeNameHighlight);

	getRamRow().style.background = "#00F45D";

	initializeSettings();

	//ladeBildschirm
	loaded = true;
	document.getElementById("loading").innerText = "";
	var loadEnd = new Date().getTime()

	if (window.matchMedia('(display-mode: standalone)').matches) {
		fadeOutStartScreen();
	} else {
		setTimeout(fadeOutStartScreen, startScreenFadeOutTime - (loadEnd - LoadStart));
	}

}//ende initialize


function addToHistory(action) {
	if (historyPointer < 0) {
		historyPointer = 0;
		return;
	}
	// console.log("Remove:", history.splice(historyPointer, historyMaxLength));
	history.push(action);
	if (history.length >= historyMaxLength + 1) {
		history.splice(0, history.length - historyMaxLength);
	}
	historyPointer = CheckNumber(historyPointer + 1, history.length, 0);	
}


function UpdateRamInputSelect(e=null) {
	let val = document.getElementById("RamInput").value.split(".");
	if (val.length != 2) {
		return;
	}
	let num = parseInt(val[0]);
	if (typeof num === "number" && num >= 1) {
		// console.log("Set RamInputSelect to", num);
		RamInputSelect.value = num;
	}
}


function initializeSettings() {
	// fixRAM
	let fixRAMElement = document.getElementById("fixRAM");
	fixRAM = localStorage.getItem("fixRAM")?.toLowerCase() !== "false";  // default to true on undefined !== "false"
	fixRAMElement.checked = fixRAM;
	fixRAMElement.addEventListener("change", (e) => {
		fixRAM = e.target.checked;
		localStorage.setItem("fixRAM", fixRAM);
	});

	// scroll ahead top
	let scrollAheadTopElement = document.getElementById("ahead-lines-top");
	linesAheadTop = parseInt(localStorage.getItem("linesAheadTop")) || linesAheadTop;
	scrollAheadTopElement.value = linesAheadTop;

	scrollAheadTopElement.addEventListener("keydown", (e) => {
		if (shouldPreventDefault(e, digits)) {
			e.preventDefault();
		}
	});
	scrollAheadTopElement.addEventListener("change", (e) => {
		linesAheadTop = parseInt(e.target.value);
		localStorage.setItem("linesAheadTop", linesAheadTop);
	}, true);

	// scroll ahead bottom
	let scrollAheadBottomElement = document.getElementById("ahead-lines-bottom");
	linesAheadBottom = parseInt(localStorage.getItem("linesAheadBottom")) || linesAheadBottom;
	scrollAheadBottomElement.value = linesAheadBottom;
	
	scrollAheadBottomElement.addEventListener("keydown", (e) => {
		if (shouldPreventDefault(e, digits)) {
			e.preventDefault();
		}
	});
	scrollAheadBottomElement.addEventListener("change", (e) => {
		linesAheadBottom = parseInt(e.target.value);
		localStorage.setItem("linesAheadBottom", linesAheadBottom);
	}, true);
	
	// remembered history actions
	let historyActionsElement = document.getElementById("history-actions");
	historyMaxLength = parseInt(localStorage.getItem("historyMaxLength")) || historyMaxLength;
	historyActionsElement.value = historyMaxLength;

	historyActionsElement.addEventListener("keydown", (e) => {
		if (shouldPreventDefault(e, digits)) {
			e.preventDefault();
		}
	})
	historyActionsElement.addEventListener("change", (e) => {
		historyMaxLength = parseInt(e.target.value);
		localStorage.setItem("historyMaxLength", historyMaxLength);
	}, true);

	// useDeleteShortcuts
	let useDeleteShortcutElement = document.getElementById("useDeleteForDeleteRow");
	useDeleteShortcut = localStorage.getItem("useDeleteForDeleteRow")?.toLowerCase() === "true";  // default to false on undefined !== "false"
	useDeleteShortcutElement.checked = useDeleteShortcut;
	useDeleteShortcutElement.addEventListener("change", (e) => {
		useDeleteShortcut = e.target.checked;
		localStorage.setItem("useDeleteForDeleteRow", useDeleteShortcut);
	});

	// fixRamNumbers behaviour
	let fixRamEqElement = document.getElementById("fixRamOperation");
	fixRamNumbersWithEq = localStorage.getItem("fixRamEq")?.toLowerCase() === "true"; // default to false on undefined !== "false"
	fixRamEqElement.checked = fixRamNumbersWithEq;
	fixRamEqElement.addEventListener("change", (e) => {
		fixRamNumbersWithEq = e.target.checked;
		localStorage.setItem("fixRamEq", fixRamNumbersWithEq);
	});

	// prompt when saving RAM/mc
	let setFilenameOnSaveElement = document.getElementById("setFilenameOnSave");
	setFilenameOnSave = localStorage.getItem("setFilenameOnSave")?.toLowerCase() !== "false"; // default to true
	setFilenameOnSaveElement.checked = setFilenameOnSave;
	setFilenameOnSaveElement.addEventListener("change", (e) => {
		setFilenameOnSave = e.target.checked;
		localStorage.setItem("setFilenameOnSave", setFilenameOnSave);
	})
}

async function updateMcInstruction(e) {
	let address = parseInt(e.target.parentNode.dataset.row);
	if (address === undefined) {
		console.log("Wrong td; parent has no data-row attr");
		console.log(e.target);
		return;
	}
	if (MicroCode[address] === 0 && MicroCode[address - 1] === 0) {
		// not near any mc instructions
		return;
	}

	let newInstruction = await promptDialog("New micro code (number or button label):", microCodeToText(parseInt(MicroCode[address])), Object.keys(buttonIdFromText).sort());
	if (newInstruction === null || newInstruction.length == 0) {
		return;
	}
	let parsedInstruction = parseInt(newInstruction);
	let instructionText = null;
	if (isNaN(parsedInstruction)) {
		// parse instrcution from button input
		parsedInstruction = getIdFromButton(newInstruction);	
	}
	console.log("Parsed instruction: " + parsedInstruction);
	if (parsedInstruction !== 0 && !parsedInstruction) {
		warnDialog(`Did not understand button signature '${newInstruction}'`);
		return;
	}
	try {
		instructionText = microCodeToText(parsedInstruction);
	} catch (e) {
		warnDialog(`Unknown micro code instruction ${parsedInstruction}`);
		return;
	}
	if (instructionText === undefined) {
		console.warn("No micro code:", parsedInstruction);
		return;
	}
	let element = e.target;
	addToHistory({
		action: "mcEdit",
		addr: address,
		value: getIdFromButton(e.target.innerText)  // old value
	});
	element.innerText = instructionText;
	MicroCode[address] = parsedInstruction.toString();
	localStorage.setItem("johnny-microcode", JSON.stringify(MicroCode));
}


function getIdFromButton(buttonStringInput) {
	let buttonString = buttonStringInput.toLowerCase().trim();
	if (buttonIdFromText.hasOwnProperty(buttonString)) {
		return buttonIdFromText[buttonString];
	}
	else if (buttonStringInput.startsWith("-")) {
		return 0;
	}
	else if (buttonString.startsWith("acc")) {
		// acc buttons
		if (buttonString.endsWith("+")) {
			return buttonIdFromText["acc++"];
		}
		else if (buttonString.endsWith("-")) {
			return buttonIdFromText["acc--"];
		}
		else if (buttonString.endsWith("0")) {
			return buttonIdFromText["acc:=0"];
		}
		else if (buttonString.endsWith("db")) {
			return buttonIdFromText["acc --> db"];
		}
	}
	else if (buttonString.startsWith("db")) {
		// db buttons
		if (buttonString.endsWith("acc")) {
			return buttonIdFromText["db --> acc"];
		}
		else if (buttonString.endsWith("ins")) {
			return buttonIdFromText["db --> ins"];
		}
		else if (buttonString.endsWith("ram")) {
			return buttonIdFromText["db --> ram"];
		}
	}
	else if (buttonString.startsWith("ins")) {
		// ins buttons
		if (buttonString.endsWith("mc")) {
			return buttonIdFromText["ins --> mc"];
		}
		else if (buttonString.endsWith("ab")) {
			return buttonIdFromText["ins --> ab"];
		}
		else if (buttonString.endsWith("pc")) {
			return buttonIdFromText["ins --> pc"];
		}
	}
	else if (buttonString.startsWith("pc")) {
		if (buttonString.endsWith("+")) {
			return buttonIdFromText["pc++"];
		}
		else if (buttonString.endsWith("ab")) {
			return buttonIdFromText["pc --> ab"];
		}
	}
	else if (buttonString.startsWith("ram") && buttonString.endsWith("db")) {
		return buttonIdFromText["ram --> db"];
	}
	else if (buttonString.startsWith("=") && buttonString.endsWith("+")) {
		return buttonIdFromText["=0?pc++"];
	}
	else if (buttonString.startsWith("mc") && buttonString.endsWith("0")) {
		return buttonIdFromText["mc:=0"];
	}
	else if (buttonString === "stop") {
		return buttonIdFromText["stop"];
	}
	else if (buttonString === "plus") {
		return buttonIdFromText["plus"];
	}
	else if (buttonString === "minus" || buttonString.startsWith("sub")) {
		return buttonIdFromText["minus"];
	}
	return undefined;
}


function resetMicrocode(writeHistory=true) {
	if (MicroCode && writeHistory && history[historyPointer - 1]?.action !== "resetMc") {
	    addToHistory({action: "resetMc", mc: MicroCode.slice()});
	}

	microCodeString = "8;2;3;5;0;0;0;0;0;0;4;2;18;9;7;0;0;0;0;0;4;2;13;9;7;0;0;0;0;0;4;2;14;9;7;0;0;0;0;0;4;15;1;9;7;0;0;0;0;0;11;7;0;0;0;0;0;0;0;0;4;2;18;10;9;7;0;0;0;0;4;2;18;16;15;1;9;7;0;0;4;2;18;17;15;1;9;7;0;0;4;12;15;1;9;7;0;0;0;0;19;7;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;FETCH;TAKE;ADD;SUB;SAVE;JMP;TST;INC;DEC;NULL;HLT";
	MicroCode = microCodeString.split(";");
	GenerateMicroCodeTable();

}

function fadeOutStartScreen() {//für verzögertes ausblenden des Startblidschirms(frühstens nach startScreenFadeOutTime ms  )
	document.getElementById("startscreen").style.display = "none";
	document.getElementById("programm").style.display = "inline";
	document.getElementsByTagName("body")[0].style.backgroundImage = "url(Hintergrund.png)"
	document.removeEventListener("keydown", keyDownHandler);	//wird für sonst nichts genutzt
	document.removeEventListener("mousedown", mouseDownHandler);	//wird für sonst nichts genutzt


	//dinge die nach dem Anzeigen gemacht werden müssen
	document.getElementById("innerRamDiv").scrollTop = 0
	resize();//damit rameingabe richtig sitzt
	resetComputer()
}

function keyDownHandler() {
	if (loaded) {
		fadeOutStartScreen();
	}

}


function mouseDownHandler() {
	if (loaded) {
		fadeOutStartScreen();
	}

}

function getRamRow() {
	return document.getElementById("RamTBody").childNodes[selectedRamModule];
}


function resize() {

	RamEingabeHeight = getObjectHeight(document.getElementById("RamEingabe"))  //neupositionierung des Peiles für die Rameingabe bei änderung der Größe
	tabelHeight = getObjectHeight(getRamRow())
	document.getElementById("RamEingabe").style.top = (getRamRow().getBoundingClientRect().top - RamEingabeHeight / 2 + tabelHeight / 2) + "px";

	//needed for the Safari fix
	scrollMaxX = document.body.scrollWidth - window.innerWidth;
	scrollMaxY = document.body.scrollHeight - window.innerHeight;

	/*
		//ändern der Auflösung des Bildschirms:
		let canvasWidth =document.getElementById("screen").clientWidth
		document.getElementById("screen").width = canvasWidth;
		document.getElementById("screen").height = canvasWidth;
		pixelSize = canvasWidth/resolution;
	*/
}

function shouldPreventDefault(e, allowedChars) {
	return (!allowedChars.includes(e.key) && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) || e.key == "ArrowDown" || e.key == "ArrowUp"
}

function RamInputKeydown(e) {
	if (e.key == "Enter") {
		ManuellRam();
		UpdateRamInputSelect();
	}
	else if (shouldPreventDefault(e, allowedRamInputChars) && (e.key == "Delete" && !useDeleteShortcut)) {
		e.preventDefault();
	}
}

function DataBusInputKeydown(e) {
	if (e.key === "Enter") {
		ManuellDb()
	}
	else if (shouldPreventDefault(e, digits)) {
		e.preventDefault();
	}

}

function AddressBusInputKeydown(e) {
	if (e.key === "Enter") {
		ManuellAB()
	}
	else if (shouldPreventDefault(e, digits)) {
		e.preventDefault();
	}
}



function CheckNumber(X, maxValue, minValue) {//Überprüft ob nur Zaheln eingegeben wurden +Größe der Zahlen
	if (X <= maxValue && typeof X === "number" && X >= minValue) {
		return X;
	}
	else if (X > maxValue) {
		return maxValue
	}
	else if (X < minValue) {
		return minValue;
	}
	console.error("X is", X);
	return 1;
}

function updateSpeed() {
	geschwindigkeit = 3000 - document.getElementById("executeSpeedSlider").value;
	if (geschwindigkeit == 0) {
		turboMode = true;
	} else {
		turboMode = false;
	}
	localStorage.setItem("execSpeed", geschwindigkeit);
}



function zeroPad(num, places) {
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}


function getObjectHeight(object) {//nimmt ein objekt und gibt die Höhe zurück

	return object.getBoundingClientRect().bottom - object.getBoundingClientRect().top

	}




//aufnahme
function aufnahmeBlinken() {
	if (blinkzyklus == 0) {
		document.getElementById("recordMcPanel").style.backgroundColor = "red";
		blinkzyklus++;
	} else {
		document.getElementById("recordMcPanel").style.backgroundColor = "yellow";
		blinkzyklus = 0;
	}
	timeoutforblinking = setTimeout(aufnahmeBlinken, blinkgeschwindigkeit);
}

async function aufnahme() {
	if (recording) {
		recording = false;
		clearTimeout(timeoutforblinking);
		document.getElementById("recordMcPanel").style.backgroundColor = "";
	} else {
		if (!document.getElementById("aufnahmeZahl").validity.valid || !document.getElementById("aufnahmeName").validity.valid) {
			console.debug("invalid values");
			warnDialog("Please provide a address in the micorcode registers as well as an name for the new macro code");
			return;
		}
		recordingCounter = CheckNumber(parseInt(document.getElementById("aufnahmeZahl").value), 19, 0) * 10; // ignorieren der letzen stelle
		let tempRecordingCounter = recordingCounter;

		let name = document.getElementById("aufnahmeName").value;
		name = name.toUpperCase();
		let inUse = false;
		if (MicroCode.slice(200).includes(name)) {
			let code = MicroCode.slice(200).indexOf(name);
			if (code * 10 != recordingCounter) {
				warnDialog(`Name already in use at address ${code}. Please choose another name`);
				return;
			} 
			let override = await confirmDialog("Name already in use at this location. Do you want to overwrite it?", true);
			inUse = true;
			if (!override) {
				return;
			}
		}
		let oldName = MicroCode[recordingCounter / 10 + 200];
		if (MicroCode[recordingCounter] != 0) {   // microccode is stored as string. no type equality
			if (oldName !== undefined && oldName !== name) {
				let answer = await confirmDialog("Adress already used for another macro code. Clear?", true);
				if (!answer) {
					return;
				}
			}
			else if (!inUse) {
				let answer = await confirmDialog("Micro code instructions already exist at this location.\nDo you want to overwrite them?", false);
				if (!answer) {
					return;
				}
			}
		}

		recording = true;
		MicroCode[recordingCounter / 10 + 200] = name; //speichern des Namens
		document.getElementsByClassName("Mccol1")[recordingCounter].innerText = recordingCounter + "   " + MicroCode[recordingCounter / 10 + 200] + ":";//name im Mc Tabelle einfügen
		document.getElementsByClassName("Mccol1")[recordingCounter].removeEventListener("click", eventListeners[oldName]);
		delete eventListeners[oldName];
		let callback = (e) => { renameOwnMcCmd(e, tempRecordingCounter, name); };
		document.getElementsByClassName("Mccol1")[recordingCounter].addEventListener("click", callback);
		eventListeners[name] = callback;

		for (i = recordingCounter; i < recordingCounter + 10; i++) {//zurückseten der Befehle im Mc
			MicroCode[i] = 0;
			document.getElementsByClassName("Mccol2")[i].innerText = "";
		}


		//springen im Mc
		var myElement = document.getElementsByClassName('Mccol2')[recordingCounter - 10];
		var topPos = myElement.offsetTop;
		document.getElementById('testdiv').scrollTop = topPos;

		//als option bei der Eingabe einfügen
		if (!inUse) {
			newOption = document.createElement("option");
			Att = document.createAttribute("value");
			Att.value = recordingCounter / 10;
			newOption.setAttributeNode(Att);
			newOption.appendChild(document.createTextNode(zeroPad(recordingCounter / 10) + ": " + MicroCode[recordingCounter / 10 + 200]));
			document.getElementById("CommandSelect").appendChild(newOption)
		}

		aufnahmeBlinken();

	}
}

function aufnehmen(befehl) {

	if (recording) {
		MicroCode[recordingCounter] = befehl;	//schreiben des Befehls in mc

		//springen beim aufnehmen
		var myElement = document.getElementsByClassName('Mccol2')[recordingCounter - 10];
		var topPos = myElement.offsetTop;
		document.getElementById('testdiv').scrollTop = topPos;

		let newtd2 = document.getElementsByClassName("Mccol2")[recordingCounter];
		newtd2.innerText = microCodeToText(befehl);
		newtd2.addEventListener("click", updateMcInstruction);

		localStorage.setItem("johnny-microcode", JSON.stringify(MicroCode));

		recordingCounter++;
	}//if

}
var maxRecursion = 15
var currentRecursions = 0;
function executeProgramm() {
	//console.log("hi");
	SingleMacroStep();
	pause = false;

	if (!halt && alterProgrammzaeler != Programmzaeler) {// beenden beim Halt und bei endlosschleifen durch fehlende oder einen jmp befehl auf die selbe adresse
		if (currentRecursions < maxRecursion && turboMode) {
			currentRecursions++;
			alterProgrammzaeler = Programmzaeler;
			executeProgramm();

		} else {
			timeoutforexecution = setTimeout(executeProgramm, geschwindigkeit);
			currentRecursions = 0;
		}


		alterProgrammzaeler = Programmzaeler;
	}
}




function SingleMacroStep() {
	microStep(false);
	while (MicroCodeCounter != 0) {
		microStep(false);
	}

}


//für Ram
function AddOpnd(Address) { // TODO: should this be enabled in turbo mode?
	high = parseInt(zeroPad(Ram[Address], ramLength + 1).substr(0, 2)) + 200; //+200 um auslesen aus Microcode zu vereinfachen

	if (MicroCode[high] != undefined && high != 200) {
		document.getElementsByClassName("col4")[Address].innerHTML = MicroCode[high];
		document.getElementsByClassName("col5")[Address].innerHTML = parseInt(zeroPad(Ram[Address], ramLength + 1).substr(2, ramLength + 1));
	} else {
		document.getElementsByClassName("col4")[Address].innerHTML = "";
		document.getElementsByClassName("col5")[Address].innerHTML = "";
	}

}



//einlesen einer Microcodedatei
document.getElementById('microcodefile').onchange = function () {

	var file = this.files[0];

	var reader = new FileReader();
	reader.onload = function (progressEvent) {
		// Entire file
		// console.log(this.result);

		// By lines
		MicroCode = this.result.split('\n');

		for (i = 0; i < 200; i++) { //damit namen erhalten bleiben
			MicroCode[i] = parseInt(MicroCode[i]);
		}

		GenerateMicroCodeTable();//updaten von tabelle und macrobefehlsauswahl
	};
	reader.readAsText(file);


};

//einlesen einer Ramdatei
document.getElementById('ramfile').onchange = function () {

	var file = this.files[0];

	var reader = new FileReader();
	reader.onload = function (progressEvent) {
		// Entire file
		// console.log(this.result);

		// By lines
		Ram = this.result.split('\n');

		updateRam()

	};
	reader.readAsText(file);


};



//"download" von dateien
function download(data, filename, type) {
	var file = new Blob([data], { type: type });
	if (window.navigator.msSaveOrOpenBlob) // IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
		var a = document.createElement("a"),
			url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function () {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
}







function pauseProgramm() {
	if (!pause) {
		clearTimeout(timeoutforexecution);
		pause = true;

	} else {
		timeoutforexecution = setTimeout(executeProgramm, geschwindigkeit);
		pause = false;
	}


}




function nextRamModule() {
	//entfärben of Ram
	getRamRow().style.background = "";
	if (selectedRamModule < parseInt("9".repeat(ramLength - 1))) {
		selectedRamModule++;
	}

	//gelbfärbung der Spalte
	getRamRow().style.background = "yellow";

	if (getRamRow().getBoundingClientRect().top + tabelHeight / 2 < document.getElementById("RamDiv").getBoundingClientRect().bottom) {
		document.getElementById("RamEingabe").style.top = (getRamRow().getBoundingClientRect().top - RamEingabeHeight / 2 + tabelHeight / 2) + "px"; //neupositionierung des Peiles für die Rameingabe
	} else {
		document.getElementById("innerRamDiv").scrollTop = (selectedRamModule - 1) * tabelHeight;
		document.getElementById("RamEingabe").style.top = (getRamRow().getBoundingClientRect().top - RamEingabeHeight / 2 + tabelHeight / 2) + "px"; //neupositionierung des Peiles für die Rameingabe
	}
}

function EditRam(CellNumber) {
	if (!turboMode) {
		//entfärben des alten Moduls
		if (dataHighlightedRamModule != selectedRamModule) {
			getRamRow().style.background = "";
		}

		if (typeof (CellNumber) == "object") {
			// event type
			// console.log(CellNumber);
			//erkennen der Spalte
			selectedRamModule = parseInt(CellNumber.currentTarget.dataset.addr);
			// console.log("TEST ramModule (CellNumber.srcElement.parentNode.dataset.addr):", selectedRamModule);
			// console.log(CellNumber);
			// console.log(CellNumber.currentTarget);
			// console.log(CellNumber.currentTarget.dataset);
			// console.log(CellNumber.currentTarget.dataset.addr);
		} else {
			selectedRamModule = CellNumber;
			// console.log("TEST ramModule")
		}
		let selectedRamModuleTr = getRamRow();
		if (!selectedRamModuleTr) {
			console.error("RAM module row is undefined; RESET to 0");
			selectedRamModule = 0;
			return;
		}
		//gelbfärbung der Spalte
		if (dataHighlightedRamModule !== selectedRamModule) {
			selectedRamModuleTr.style.background = "yellow";
		}

		if (selectedRamModuleTr.getBoundingClientRect().top + (linesAheadBottom + 1) * tabelHeight >= document.getElementById("RamDiv").getBoundingClientRect().bottom) {
			// scroll when arrow leaves RAM table at the bottom
			let innerRamDiv = document.getElementById("innerRamDiv")
			innerRamDiv.scrollTop = (selectedRamModule + linesAheadBottom + 1) * tabelHeight - innerRamDiv.clientHeight;
		} else if (selectedRamModuleTr.getBoundingClientRect().top - (linesAheadTop + 1) * tabelHeight <= document.getElementById("RamDiv").getBoundingClientRect().top) {
			// scroll when arrow leaves RAM table at the top
			document.getElementById("innerRamDiv").scrollTop = (selectedRamModule - linesAheadTop) * tabelHeight;
		}
		document.getElementById("RamEingabe").style.top = (selectedRamModuleTr.getBoundingClientRect().top - RamEingabeHeight / 2 + tabelHeight / 2) + "px"; //neupositionierung des Peiles für die Rameingabe
		let ramInputField = document.getElementById("RamInput");
		ramInputField.value = selectedRamModuleTr.childNodes[1].innerText;
		ramInputField.focus();  // requesting write cursor
		// moving cursor to the input end
		let val = ramInputField.value;
		ramInputField.value = '';
		ramInputField.value = val;
		UpdateRamInputSelect();
	}

}




function highlightMc(collum) {	//übernimmt auch springen
	//springen im Mc
	//document.getElementsByClassName("MicroCodeTable")[MicroCodeCounter].style.background = "" //muss vor ändern des Mc counters ausgeführt werden
	if (!turboMode) {
		var myElement = document.getElementsByClassName('Mccol2')[collum];
		var topPos = myElement.offsetTop;
		document.getElementById('testdiv').scrollTop = topPos;

		document.getElementsByClassName("MicroCodeTable")[MicroCodeCounter].style.background = "yellow"
	}

}



function highlightRamAccess() {//übernimmt auch das ändern der unteren Tabelle

	if (dataHighlightedRamModule == selectedRamModule) {
		getRamRow().style.background = "yellow";

	} else {
		getHighlightRamRow().style.background = "";


	}

	if (MicroCodeCounter != 1) { //nichtanzeigen beim FETCH befehl

		dataHighlightedRamModule = Addressbus;
		getHighlightRamRow().style.background = "#00F45D";

	}

	console.log("hi")

}

function getHighlightRamRow() {
	return document.getElementById("RamTBody").childNodes[dataHighlightedRamModule];
}

function insertRowAbove(writeHistory=true) {
	getRamRow().style.background = ""; // reset background color
	let newSelect = selectedRamModule;
	let emptyRow = undefined;
	// console.log("selected", selectedRamModule);
	for (let i = 999; i >= 900; i--) {
		selectedRamModule = i;
		if (getRamRow().getElementsByClassName("col2")[0].innerText === "00.000") {
			emptyRow = getRamRow();
			break;
		}
	}
	if (!emptyRow) {
		console.error("All last 99 rows are used already");
		selectedRamModule = newSelect;
		EditRam(selectedRamModule);
		return;
	}
	
	selectedRamModule = newSelect;
	// Ram.splice(emptyRow.dataset.addr, 1);
	getRamRow().parentNode.insertBefore(emptyRow, getRamRow());

	fixRamNumbers(newSelect, +1);
	Ram.splice(newSelect, 1, 0);
	localStorage.setItem("johnny-ram", JSON.stringify(Ram));
	selectedRamModule = newSelect; // important; override in fixRamNumbers could happen (in future)
	if (writeHistory) {
		addToHistory({
			"action": "insert",
			"addr": selectedRamModule,
			"value": "00.000" // no one actually cares since it is always 0
		})
	}
	EditRam(selectedRamModule);
}

function fixRamNumbers(offset, delta) {
	let nodes = document.getElementById("RamTBody").childNodes;
	let addressCols = document.getElementById("RamTBody").getElementsByClassName("col1");
	let dataCols = document.getElementById("RamTBody").getElementsByClassName("col2");
	let maxNumber = (1 + "9".repeat(ramLength)).toString();
	delta = fixRAM ? delta : 0;

	// console.time("AddressFix");
	for (let row = 0; row < 1000; row++) {
		// fix Address
		nodes[row].dataset.addr = row;
		addressCols[row].innerText = row;
	}
	// console.timeEnd("AddressFix");
	// console.time("DataFix");
	for (let row = 0; row < 1000; row++) {
		let number = dataCols[row].innerText.split(".");

		// fix data; should fix asm and opand as well
		if (number[0] !== "00" && number[0] !== "10" && (parseInt(number[1]) > offset || (fixRamNumbersWithEq && parseInt(number[1]) === offset))) {
			writeToRam(CheckNumber(parseInt(number.join("")) + delta, maxNumber, 0), row, false);
		}
		else if (number[0] === "10") {
			writeToRam(parseInt(number.join("")), row);
		}
		else if (number[1] !== "000" || Ram[row] !== 0) {
			writeToRam(parseInt(number.join("")), row);
		}
	}
	localStorage.setItem("johnny-ram", JSON.stringify(Ram));
	// console.timeEnd("DataFix");
}


function deleteRow(writeHistory=true) {
	let row = getRamRow();
	let oldValue = row.getElementsByClassName("col2")[0].innerText;
	let oldRow = parseInt(row.dataset.addr);
	writeToRam(00000, selectedRamModule, false);
	row.style.background = "";
	let table = row.parentNode;
	Ram.splice(selectedRamModule, 1);
	Ram.push(0);

	// fix screen values
	table.insertBefore(row, table.childNodes[table.childNodes.length - 1]);
	fixRamNumbers(row.dataset.addr, -1);
	
	localStorage.setItem("johnny-ram", JSON.stringify(Ram));
	if (writeHistory) {
		addToHistory({
			"action": "delete",
			"addr": oldRow,
			"value": oldValue
		});
	}
	EditRam(selectedRamModule);
}


/*
//this is needed to prevent Safari (ipad) from making the background scroll funny
var scrollX = 0;
var scrollY = 0;
var scrollMinX = 0;
var scrollMinY = 0;
var scrollMaxX = document.body.scrollWidth - window.innerWidth;
var scrollMaxY = document.body.scrollHeight - window.innerHeight;

// where the magic happens
window.addEventListener('scroll', function (e) {
	e.preventDefault();
  scrollX = window.scrollX;
  scrollY = window.scrollY;

  if (scrollX <= scrollMinX) scrollTo(scrollMinX, window.scrollY);
  if (scrollX >= scrollMaxX) scrollTo(scrollMaxX, window.scrollY);

  if (scrollY <= scrollMinY) scrollTo(window.scrollX, scrollMinY);
  if (scrollY >= scrollMaxY) scrollTo(window.scrollX, scrollMaxY);
}, false);
*/
