
class ControlManager {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        //（0..左, 1..真ん中, 2..右）
        this.mouseClicked = new Array(3);
        this.mouseClickedStableCount = new Array(3);
        for (var id = 0; id < 3; id++) {
            this.mouseClicked[id] = false;
            this.mouseClickedStableCount[id] = 0;
        }
        this.keyDowned =  new Array(256);
        this.keyDownedStableCount = new Array(256);
        for (var id = 0; id < 256; id++) {
            this.keyDowned[id] = false;
            this.keyDownedStableCount[id] = 0;
        }

        screenCanvas.setAttribute("tabindex", 0);
        screenCanvas.addEventListener("mousedown", e=>{this.mouseDown(e)});
        screenCanvas.addEventListener("mouseup", e=>{this.mouseUp(e)});
        screenCanvas.addEventListener("mousemove", e=>{this.mouseMove(e)});
        screenCanvas.addEventListener("keydown", e=>{ if (e.preventDefault) {e.preventDefault();} this.keyBoardDown(e)});
        screenCanvas.addEventListener("keyup", e=>{this.keyBoardUp(e)});

        screenCanvas.focus();
        this.isFocus = true;

        //ボタンのスマホ対応
        //https://iwb.jp/javascript-event-long-push-mouse-button-tap/
        var userAgent = navigator.userAgent.toLowerCase();
        var isSmartPhone = /iphone|ipot|ipad|android/.test(userAgent);
        var smartPhoneButtonsDiv = document.getElementsByClassName("smartPhoneButtons");

        if (isSmartPhone) {
            var allWidth = (canvasWidth + smartPhoneButtonsDiv.length * parseInt(window.getComputedStyle(smartPhoneButtonsDiv[0]).width) + 100);
            document.body.style.width = allWidth + "px";
            var metaData = document.getElementsByTagName("meta");
            for (var idx = 0; idx < metaData.length; idx++) {
                if (metaData[idx].name === "viewport") {
                    metaData[idx].content = "width=" + allWidth + "px";
                }
            }

            var buttons = [];
            for (var idx = 0; idx < smartPhoneButtonsDiv.length; idx++) {
                var buttonCandidate = smartPhoneButtonsDiv[idx].getElementsByTagName("input");
                for (var bIdx = 0; bIdx < buttonCandidate.length; bIdx++) {
                    if (buttonCandidate[bIdx].type == "hidden") {
                        buttonCandidate[bIdx].type = "button";
                        buttons.push(buttonCandidate[bIdx]);
                    }
                }
            }

            for (var idx = 0; idx < buttons.length; idx++) {
                var checkButtonCode = this.keyNameEncoder(buttons[idx].name);
                if (checkButtonCode >= 0) {
                    buttons[idx].addEventListener("touchstart", e=>{
                        e.preventDefault();
                        var buttonCode = this.keyNameEncoder(e.target.name);
                        if (this.keyDowned[buttonCode] != true) {
                            this.keyDownedStableCount[buttonCode] = 0;
                        }
                        this.keyDowned[buttonCode] = true;
                    });

                    buttons[idx].addEventListener("touchend", e=>{
                        e.preventDefault();
                        var buttonCode = this.keyNameEncoder(e.target.name);
                        if (this.keyDowned[buttonCode] != false) {
                            this.keyDownedStableCount[buttonCode] = 0;
                        }
                        this.keyDowned[buttonCode] = false;
                    });

                    buttons[idx].addEventListener("touchmove", e=>{
                        e.preventDefault();
                        var elem = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
                        if (elem !== e.target) {
                            var buttonCode = this.keyNameEncoder(e.target.name);
                            if (this.keyDowned[buttonCode] != false) {
                                this.keyDownedStableCount[buttonCode] = 0;
                            }
                            this.keyDowned[buttonCode] = false;
                        }
                    });
                }
            }
        }
        else {
            for (var idx = smartPhoneButtonsDiv.length - 1; idx >= 0; idx--) {
                smartPhoneButtonsDiv[idx].remove();
            }
            screenCanvas.addEventListener("focus", e=>{this.isFocus = true;});
            screenCanvas.addEventListener("blur", e=>{this.isFocus = false;});
        }
    }
}

ControlManager.prototype.mouseDown = function(e) {
    if (e.which >= 1 && e.which <= 3) {
        if (this.mouseClicked[e.which - 1] != true) {
            this.mouseClickedStableCount[e.which - 1] = 0;
        }
        this.mouseClicked[e.which - 1] = true;
    }
}

ControlManager.prototype.mouseUp = function(e) {
    if (e.which >= 1 && e.which <= 3) {
        if (this.mouseClicked[e.which - 1] != false) {
            this.mouseClickedStableCount[e.which - 1] = 0;
        }
        this.mouseClicked[e.which - 1] = false;
    }
}

ControlManager.prototype.mouseMove = function(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    this.mouseX = x;
    this.mouseY = y;
}

ControlManager.prototype.keyNameEncoder = function(keyName) {
    var charCode = keyName.charCodeAt(0);

    if (keyName == "enter") {
        return 13;
    }
    else if (keyName == "shift") {
        return 16;
    }
    else if (keyName == "space") {
        return 32;
    }
    else if (keyName == "left") {
        return 37;
    }
    else if (keyName == "up") {
        return 38;
    }
    else if (keyName == "right") {
        return 39;
    }
    else if (keyName == "down") {
        return 40;
    }
    else if (charCode >= 97 && charCode <= 122) {
        return 65 + (charCode - 97);
    }
    else if (charCode >= 65 && charCode <= 90) {
        return charCode;
    }
    else if (charCode >= 48 && charCode <= 57) {
        return charCode;
    }
    else {
        return -1;
    }
}

//該当するキーボードが押されていれば、押され続けているカウント数を返し、そうでなければ-1を返す。
ControlManager.prototype.isKeyDown = function(keyName) {
    var keyCode = this.keyNameEncoder(keyName);
    if (keyCode < 0) {
        return -1;
    }
    else if (this.keyDowned[keyCode]) {
        return this.keyDownedStableCount[keyCode];
    }
    else {
        return -1;
    }
}

ControlManager.prototype.keyBoardDown = function(e) {
    if (this.keyDowned[e.keyCode] != true) {
        this.keyDownedStableCount[e.keyCode] = 0;
    }
    this.keyDowned[e.keyCode] = true;
}

ControlManager.prototype.keyBoardUp = function(e) {
    if (this.keyDowned[e.keyCode] != false) {
        this.keyDownedStableCount[e.keyCode] = 0;
    }
    this.keyDowned[e.keyCode] = false;
}

//該当するマウスボタンが押されていれば、押され続けているカウント数を返し、そうでなければ-1を返す。
ControlManager.prototype.isMouseDown = function(mouseIdx) {
    if (mouseIdx < 0 || mouseIdx > 2) {
        return -1;
    }
    else if (this.mouseClicked[mouseIdx]) {
        return this.mouseClickedStableCount[mouseIdx];
    }
    else {
        return -1;
    }
}

ControlManager.prototype.hasFocus = function() {
    return this.isFocus;
}

ControlManager.prototype.updateState = function() {
    for (var id = 0; id < 3; id++) {
        this.mouseClickedStableCount[id]++;
    }
    for (var id = 0; id < 256; id++) {
        this.keyDownedStableCount[id]++;
    }
}
