const grayScreen = document.createElement("div");
grayScreen.style.width = 100 + "%";
grayScreen.style.height = 100 + "%";
grayScreen.style.position = "fixed";
grayScreen.style.left = 0;
grayScreen.style.top = 0;
grayScreen.style.background = "#3339";

let dialogs = 0;

function customDialog(title, body, options) {
    console.debug("Custom dialog options", options);
    dialogs++;
    if (body == undefined || !title) {
        console.error("custom dialog expected a title and a list of objects for body");
        return;
    }
    let id = options?.id ?? "customDialog";
    let closeCallback = options?.closeCallback ?? undefined;
    let focusStart = options?.focusStart ?? undefined;
    let startCallback = options?.startCallback ?? undefined;

    document.body.appendChild(grayScreen);

    let dialogNode = document.createElement("dialog");
    dialogNode.id = id;

    let titleNode = document.createElement("h2");
    titleNode.innerText = title;
    dialogNode.appendChild(titleNode);
    
    let idNum = 0;
    
    body.forEach(element => {
        switch (element.type) {
            case "text":
                let textNode = document.createElement("p");
                textNode.innerText = element.content ?? "";
                textNode.id = element.id ?? "";
                if (element?.classes) {
                    textNode.classList.add(element.classes);
                }
                dialogNode.appendChild(textNode);
                break;

            case "entry":
                console.log(element);
                let inputNode = document.createElement("input");
                inputNode.type = "text";
                inputNode.placeholder = element.placeholder ?? "";
                inputNode.inputMode = element.inputMode ?? "";
                inputNode.required = element.required ?? false;
                inputNode.value = element.value ?? "";
                inputNode.onkeyup = element.onvalidate ?? undefined;
                inputNode.id = element.id ?? "";

                if (element?.classes) {
                    inputNode.classList.add(element.classes);
                }
                dialogNode.appendChild(inputNode);

                if (element?.selection) {
                    let dataListNode = document.createElement("datalist");
                    dataListNode.id = "datalist" + idNum;

                    inputNode.setAttribute("list", dataListNode.id);

                    console.log(inputNode.list);

                    element.selection.forEach(option => {
                        let opt = document.createElement("option");
                        opt.value = option;
                        dataListNode.appendChild(opt);
                    });
                    dialogNode.appendChild(dataListNode);
                }

                break;

            case "button-row":
                let rowNode = document.createElement("div");
                rowNode.classList.add("button-row");
                if (element?.buttons == undefined) {
                    console.warn("Do not understand given button row: ", row);
                    return;
                }
                element.buttons.forEach(b => {
                    let buttonNode = document.createElement("button");
                    buttonNode.id = b.id ?? "";

                    if (!b?.text) {
                        console.warn("No button text provided. Button gets ignore");
                        return
                    }
                    buttonNode.innerText = b.text;
                    if (b?.callback != undefined) {
                        buttonNode.onclick = (e) => {b.callback(dialogNode, e)};
                    }
                    if (b?.classes) {
                        buttonNode.classList.add(b.classes);
                    }
                    rowNode.appendChild(buttonNode);
                });
                dialogNode.appendChild(rowNode);
        }
        idNum++;
    });
    
    dialogNode.onclose = (e) => {
        if (closeCallback !== undefined) {
            closeCallback(e);
        }
        dialogs--;
        if (dialogs == 0) {
            document.body.removeChild(grayScreen);
        }
        document.body.removeChild(dialogNode);
    }
    
    dialogNode.onclick = (e) => {
        if (e.target.id !== "customDialog") {
            return;
        }
        // close when clicking outside of the modal
        else if (e.target.offsetTop > e.y || e.target.offsetTop + e.target.offsetHeight < e.y || e.target.offsetLeft > e.x || e.target.offsetLeft + e.target.offsetWidth < e.x) {
            dialogNode.close();
        }
    }

    document.body.appendChild(dialogNode);
    dialogNode.showModal();
    LeaveVimCmdMode();  // focuses the RAM input unconditionally
    if (startCallback) {
        startCallback(dialogNode);
    }
    if (focusStart) {
        let element = document.querySelector("#customDialog #" + focusStart);
        if (element !== null) {
            console.debug("Focusing", element);
            element.focus();
            if (element.localName === "input" && element.type === "text") {
                element.select();
            }
        }
    }
    else {
        dialogNode.focus({focusVisible: false});
    }
}


function warnDialog(warning) {
    customDialog(
        warning,
        [
            {
                type: "button-row",
                buttons: [
                    {
                        text: "Ok",
                        callback: (modal, _) => {modal.close()},
                        id: "customDialogSubmitButton",
                        classes: ["default-button"],
                    },
                ],
            },
        ],
        {
            startCallback: (modal) => { setTimeout(() => { modal.querySelector("#customDialogSubmitButton").focus(); }, 100); },
        },
    );
}


function confirmDialog(question, cancelDefault) {
    cancelDefault = cancelDefault || false;
    return new Promise(resolve => {
        customDialog(
            question,
            [
                {
                    type: "button-row",
                    buttons: [
                        {
                            text: "Cancel",
                            callback: (modal, _) => {
                                resolve(false);
                                modal.close();
                            },
                            classes: cancelDefault ? ["default-button"] : undefined,
                            id: cancelDefault ? "customDialogSubmitButton" : undefined,
                        },
                        {
                            text: "Ok",
                            callback: (modal, _) => {
                                resolve(true);
                                modal.close()
                            },
                            classes: cancelDefault ? undefined : ["default-button"],
                            id: cancelDefault ? undefined : "customDialogSubmitButton",
                        },
                    ],
                },
            ],
            {
                closeCallback: (e) => resolve(null),
                focusStart: "customDialogSubmitButton",
            },
        );
    });
}


function promptDialog(question, defaultInput, selection) {
    return new Promise(resolve => {
        customDialog(
            question,
            [
                {
                    type: "entry",
                    value: defaultInput,
                    selection: selection,
                    id: "textInput",
                    placeholder: selection ? "Click for suggestions" : undefined,
                    onvalidate: (e) => {
                        console.log(e);
                        if (e.key === "Enter") {
                            let input = document.querySelector("#customDialog #textInput").value  // reference to entry
                            document.querySelector("#customDialog").close();
                            resolve(input);
                        }
                    },
                },
                {
                    type: "button-row",
                    buttons: [
                        {
                            text: "Cancel",
                            callback: (modal, _) => {
                                modal.close();
                                resolve(null);
                            }
                        },
                        {
                            text: "Ok",
                            callback: (modal, _) => {
                                let input = modal.querySelector("#textInput").value  // reference to entry
                                modal.close();
                                resolve(input);
                            },
                            classes: "default-button",
                        },
                    ],
                },
            ],
            {
                focusStart: "textInput",
                closeCallback: (_) => { resolve(null); }
            }
        )
    });
}
