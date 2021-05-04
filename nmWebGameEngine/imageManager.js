
var valid = false;
var screenCanvas;
var screenContext;
var screenImageData;
var backScreenBuf;
var backScreenBuf8;
var backScreenData;
var tmpCanvas;
var tmpCanvasContext;
var canvasWidth = 0;
var canvasHeight = 0;
var backColor = [0, 0, 0];
var timerId;

var loadingImage = 0;
var loadCompleteImage = 0;

function imageManagerInit(roopFunc) {
    var gameDiv = document.getElementById("gameDiv");
    canvasWidth = parseInt(window.getComputedStyle(gameDiv).width);
    canvasHeight = parseInt(window.getComputedStyle(gameDiv).height);
    screenCanvas = document.getElementById("screen");
    if(!screenCanvas || !screenCanvas.getContext) {
        alert("本ページの閲覧はHTML5対応のブラウザでおこなって下さい");
        valid = false;
        return;
    }
    screenCanvas.width = canvasWidth;
    screenCanvas.height = canvasHeight;
    screenContext = screenCanvas.getContext("2d");
    screenImageData = screenContext.getImageData(0, 0, canvasWidth, canvasHeight);

    backScreenBuf = new ArrayBuffer(canvasWidth * canvasHeight * 4);
    backScreenBuf8 = new Uint8ClampedArray(backScreenBuf);
    backScreenData = new Uint32Array(backScreenBuf);

    tmpCanvas = document.getElementById("tmpCanvasForLoad");
    tmpCanvas.width = canvasWidth;
    tmpCanvas.height = canvasHeight;
    tmpCanvasContext = tmpCanvas.getContext("2d");

    var canvasSize = canvasWidth * canvasHeight;
    for (var pIdx = 0; pIdx < canvasSize; pIdx++) {
        backScreenData[pIdx] = (backColor[0] | (backColor[1] << 8) | (backColor[2] << 16) | (255 << 24));
    }
    screenImageData.data.set(backScreenBuf8);
    screenContext.putImageData(screenImageData, 0, 0, 0, 0, canvasWidth, canvasHeight);
    valid = true;
}

function imageManagerPreviousLoop() {
    if (!valid) {
        return;
    }
    var canvasSize = canvasWidth * canvasHeight;
    for (var pIdx = 0; pIdx < canvasSize; pIdx++) {
        backScreenData[pIdx] = (backColor[0] | (backColor[1] << 8) | (backColor[2] << 16) | (255 << 24));
    }
}

function imageManagerPostLoop() {
    if (!valid) {
        return;
    }
    screenImageData.data.set(backScreenBuf8);
    screenContext.putImageData(screenImageData, 0, 0, 0, 0, canvasWidth, canvasHeight);
}

class ImageManager {

    constructor(source, i_divX, i_divY) {
        if (!valid) {
            return
        }
        loadingImage++;
        this.divX = (i_divX > 0 ? i_divX: 1);
        this.divY = (i_divY > 0 ? i_divY: 1);
        this.width = 0;
        this.height = 0;
        this.divWidth = 0;
        this.divHeight = 0;
        this.loadComplete = false;
        this.imageDiv = new Array(this.divX);
        this.imageDivBuf = new Array(this.divX);
        this.imageDivBuf8 = new Array(this.divX);
        this.imageDivData = new Array(this.divX);
        for (var xIdx = 0; xIdx < this.divX; xIdx++) {
            this.imageDiv[xIdx] = new Array(this.divY);
            this.imageDivBuf[xIdx] = new Array(this.divX);
            this.imageDivBuf8[xIdx] = new Array(this.divX);
            this.imageDivData[xIdx] = new Array(this.divY);
        }
        this.imageSrc = new Image();
        this.imageSrc.addEventListener("load", e=>{this.onLoadFunction()});
        this.imageSrc.src = source + "?" + new Date().getTime();
    }
}

ImageManager.prototype.onLoadFunction = function() {
    if (!valid) {
        return;
    }
    this.width = this.imageSrc.width;
    this.height = this.imageSrc.height;
    this.divWidth = Math.floor(this.width / this.divX);
    this.divHeight = Math.floor(this.height / this.divY);
    if (this.divWidth > canvasWidth) {
        tmpCanvasForLoad.width = this.divWidth;
    }
    if (this.divHeight > canvasHeight) {
        tmpCanvasForLoad.height = this.divHeight;
    }
    var tmpImageData;
    for (var xIdx = 0; xIdx < this.divX; xIdx = (xIdx + 1) | 0) {
        for (var yIdx = 0; yIdx < this.divY; yIdx = (yIdx + 1) | 0) {
            tmpCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
            tmpCanvasContext.drawImage(this.imageSrc, -this.divWidth * xIdx, -this.divHeight * yIdx);
            this.imageDiv[xIdx][yIdx]  = tmpCanvasContext.getImageData(0, 0, this.divWidth, this.divHeight);
            this.imageDivBuf[xIdx][yIdx] = new ArrayBuffer(this.imageDiv[xIdx][yIdx].data.length);
            this.imageDivBuf8[xIdx][yIdx] = new Uint8ClampedArray(this.imageDivBuf[xIdx][yIdx]);
            this.imageDivData[xIdx][yIdx] = new Uint32Array(this.imageDivBuf[xIdx][yIdx]);
            for (var px = 0; px < this.divWidth * this.divHeight * 4; px++) {
                this.imageDivBuf8[xIdx][yIdx][px] = this.imageDiv[xIdx][yIdx].data[px];
            }
        }
    }
    tmpCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    if (this.divWidth > canvasWidth) {
        tmpCanvasForLoad.width = canvasWidth;
    }
    if (this.divHeight > canvasHeight) {
        tmpCanvasForLoad.height = canvasHeight;
    }
    this.loadComplete = true;
    loadCompleteImage++;
}

ImageManager.prototype.drawImage = function(x, y, divXId, divYId) {
    if (!valid) {
        return;
    }
    if (divXId < 0 || divXId >= this.divX) {
        return;
    }
    if (divYId < 0 || divYId >= this.divY) {
        return;
    }
    if (this.loadComplete) {
        var startX = Math.floor(x);
        var startY = Math.floor(y);
        var endX = startX + this.divWidth;
        var endY = startY + this.divHeight;
        var sourceImageData = this.imageDivData[divXId][divYId];
        var currentSourcePixelIndex = 0;
        for (var yIdx = startY; yIdx < endY; yIdx = (yIdx + 1) | 0) {
            var currentTargetPixelIndex = (yIdx) * canvasWidth + startX;
            for (var xIdx = startX; xIdx < endX; xIdx = (xIdx + 1) | 0) {
                if (xIdx >= 0 && xIdx < canvasWidth && yIdx >= 0 && yIdx < canvasHeight) {
                    var sourceColor = sourceImageData[currentSourcePixelIndex];
                    var sourceOpacity =  ((sourceColor >> 24) & 0xff) / 255;
                    if (sourceOpacity > 0.0) {
                        var targetColor = backScreenData[currentTargetPixelIndex];
                        var sourceR = (sourceColor & 0xff);
                        var sourceG = ((sourceColor >> 8) & 0xff);
                        var sourceB = ((sourceColor >> 16) & 0xff);
                        var targetR = (targetColor & 0xff);
                        var targetG = ((targetColor >> 8) & 0xff);
                        var targetB = ((targetColor >> 16) & 0xff);

                        targetR = targetR * (1.0 - sourceOpacity);
                        targetR += sourceR * sourceOpacity;
                        targetG = targetG * (1.0 - sourceOpacity);
                        targetG += sourceG * sourceOpacity;
                        targetB = targetB * (1.0 - sourceOpacity);
                        targetB += sourceB * sourceOpacity;
                        targetColor = (targetR | (targetG << 8) | (targetB << 16) | (255 << 24));
                        backScreenData[currentTargetPixelIndex] = targetColor;
                    }
                }
                currentSourcePixelIndex = currentSourcePixelIndex + 1;
                currentTargetPixelIndex = currentTargetPixelIndex + 1;
            }
        }
    }
}

ImageManager.prototype.drawImageWithScaleTrimOpacity = function(x, y, divXId, divYId, xScale, yScale,
    xStartRate, xEndRate, yStartRate, yEndRate, opacity) {

    if (!valid) {
        return;
    }
    if (divXId < 0 || divXId >= this.divX) {
        return;
    }
    if (divYId < 0 || divYId >= this.divY) {
        return;
    }
    if (this.loadComplete) {
        var drawBoxWidth = this.divWidth * xScale;
        var drawBoxHeight = this.divHeight * yScale;
        var startX = Math.floor(x);
        var startY = Math.floor(y);
        var imageStartX = Math.floor(drawBoxWidth * xStartRate);
        var imageEndX = Math.floor(drawBoxWidth * xEndRate);
        var imageStartY = Math.floor(drawBoxHeight * yStartRate);
        var imageEndY = Math.floor(drawBoxHeight * yEndRate);

        var invXScale = 1.0 / xScale;
        var invYScale = 1.0 / yScale;
        var sourceImageData = this.imageDivData[divXId][divYId];

        for (var py = imageStartY; py < imageEndY; py = (py + 1) | 0) {
            var sourceY = Math.floor(py * invYScale);
            var currentPixelIndex = (py + startY) * canvasWidth + (imageStartX + startX);
            for (var px = imageStartX; px < imageEndX; px = (px + 1) | 0) {
                if (startX + px >= 0 && startX + px  < canvasWidth && startY + py >= 0 && startY + py < canvasHeight) {
                    var sourceX = Math.floor(px * invXScale);
                    var sourcePixelIndex = (sourceY * this.divWidth + sourceX);
                    var sourceColor = sourceImageData[sourcePixelIndex];
                    var sourceOpacity =  ((sourceColor >> 24) & 0xff) / 255 * opacity;
                    if (sourceOpacity > 0) {
                        var targetColor = backScreenData[currentPixelIndex];
                        var sourceR = (sourceColor & 0xff);
                        var sourceG = ((sourceColor >> 8) & 0xff);
                        var sourceB = ((sourceColor >> 16) & 0xff);
                        var targetR = (targetColor & 0xff);
                        var targetG = ((targetColor >> 8) & 0xff);
                        var targetB = ((targetColor >> 16) & 0xff);

                        targetR = (1.0 - sourceOpacity) * targetR;
                        targetR += sourceOpacity * sourceR;
                        targetG = (1.0 - sourceOpacity) * targetG;
                        targetG += sourceOpacity * sourceG;
                        targetB = (1.0 - sourceOpacity) * targetB;
                        targetB += sourceOpacity * sourceB;
                        targetColor = (targetR | (targetG << 8) | (targetB << 16) | (255 << 24));
                        backScreenData[currentPixelIndex] = targetColor;
                    }
                }
                currentPixelIndex++;
            }
        }
    }
}

ImageManager.prototype.drawImageWithRotateScaleOpacity = function(x, y, divXId, divYId, rotateRad, xScale, yScale, opacity) {
    if (!valid) {
        return;
    }
    if (divXId < 0 || divXId >= this.divX) {
        return;
    }
    if (divYId < 0 || divYId >= this.divY) {
        return;
    }
    if (this.loadComplete) {
        var sinValue = Math.sin(rotateRad);
        var cosValue = Math.cos(rotateRad);
        var sourceCenterX = this.divWidth / 2;
        var sourceCenterY = this.divHeight / 2;
        var drawBoxSize = Math.floor(Math.sqrt(this.divWidth * this.divWidth + this.divHeight * this.divHeight) * (xScale > yScale ? xScale: yScale));
        if (drawBoxSize <= 0) {
            return;
        }
        var drawBoxCenter = drawBoxSize / 2;
        var startX = Math.floor(x - drawBoxCenter);
        var startY = Math.floor(y - drawBoxCenter);

        var invXScale = 1.0 / xScale;
        var invYScale = 1.0 / yScale;
        var sourceImageData = this.imageDivData[divXId][divYId];

        for (var py = 0; py < drawBoxSize; py = (py + 1) | 0) {
            var tmpY = py - drawBoxCenter;
            var currentPixelIndex = (startY + py) * canvasWidth + (startX);
            for (var px = 0; px < drawBoxSize; px = (px + 1) | 0) {
                var tmpX = px - drawBoxCenter;

                if (startX + px >= 0 && startX + px < canvasWidth && startY + py >= 0 && startY + py < canvasHeight) {
                    var sourceX = cosValue * tmpX + sinValue * tmpY;
                    var sourceY = -sinValue * tmpX + cosValue * tmpY;
                    sourceX *= invXScale;
                    sourceY *= invYScale;
                    sourceX += sourceCenterX;
                    sourceY += sourceCenterY;
                    sourceX = Math.floor(sourceX);
                    sourceY = Math.floor(sourceY);

                    if (sourceX >= 0 && sourceX < this.divWidth && sourceY >= 0 && sourceY < this.divHeight) {
                        var sourcePixelIndex = (sourceY * this.divWidth + sourceX);
                        var sourceColor = sourceImageData[sourcePixelIndex];
                        var sourceOpacity = ((sourceColor >> 24) & 0xff) / 255 * opacity;
                        if (sourceOpacity > 0) {
                            var sourceR = (sourceColor & 0xff);
                            var sourceG = ((sourceColor >> 8) & 0xff);
                            var sourceB = ((sourceColor >> 16) & 0xff);
                            var targetColor = backScreenData[currentPixelIndex];
                            var targetR = (targetColor & 0xff);
                            var targetG = ((targetColor >> 8) & 0xff);
                            var targetB = ((targetColor >> 16) & 0xff);

                            targetR = (1.0 - sourceOpacity) * targetR;
                            targetR += sourceOpacity * sourceR;
                            targetG = (1.0 - sourceOpacity) * targetG;
                            targetG += sourceOpacity * sourceG;
                            targetB = (1.0 - sourceOpacity) * targetB;
                            targetB += sourceOpacity * sourceB;
                            targetColor = (targetR | (targetG << 8) | (targetB << 16) | (255 << 24));
                            backScreenData[currentPixelIndex] = targetColor;
                        }
                    }
                }
                currentPixelIndex++;
            }
        }
    }
}

ImageManager.prototype.drawImageWithRotateSquashOpacity = function(x, y, divXId, divYId, rotateRad, squashRad, xScale, yScale, opacity) {
    if (!valid) {
        return;
    }
    if (divXId < 0 || divXId >= this.divX) {
        return;
    }
    if (divYId < 0 || divYId >= this.divY) {
        return;
    }
    if (this.loadComplete) {
        var diffSquashRotateRad = squashRad - rotateRad;
        var sinSquashValue = Math.sin(diffSquashRotateRad);
        var cosSquashValue = Math.cos(diffSquashRotateRad);
        var sinRotateValue = Math.sin(rotateRad);
        var cosRotateValue = Math.cos(rotateRad);
        var sourceCenterX = this.divWidth / 2;
        var sourceCenterY = this.divHeight / 2;
        var drawBoxSize = Math.floor(Math.sqrt(this.divWidth * this.divWidth + this.divHeight * this.divHeight) * (xScale > yScale ? xScale: yScale));
        if (drawBoxSize <= 0) {
            return;
        }
        var drawBoxCenter = drawBoxSize / 2;
        var startX = Math.floor(x - drawBoxCenter);
        var startY = Math.floor(y - drawBoxCenter);

        var invXScale = 1.0 / xScale;
        var invYScale = 1.0 / yScale;
        var sourceImageData = this.imageDivData[divXId][divYId];
        var tmpPosX = 0.0;
        var tmpPosY = 0.0;

        for (var py = 0; py < drawBoxSize; py = (py + 1) | 0) {
            var pyFromCenter = py - drawBoxCenter;
            var currentPixelIndex = (startY + py) * canvasWidth + (startX);
            for (var px = 0; px < drawBoxSize; px = (px + 1) | 0) {
                var pxFromCenter = px - drawBoxCenter;

                if (startX + px >= 0 && startX + px < canvasWidth && startY + py >= 0 && startY + py < canvasHeight) {
                    var sourceX = cosRotateValue * pxFromCenter + sinRotateValue * pyFromCenter;
                    var sourceY = -sinRotateValue * pxFromCenter + cosRotateValue * pyFromCenter;
                    tmpPosX = sourceX;
                    tmpPosY = sourceY;
                    sourceX = cosSquashValue * tmpPosX + sinSquashValue * tmpPosY;
                    sourceY = -sinSquashValue * tmpPosX + cosSquashValue * tmpPosY;
                    sourceX *= invXScale;
                    sourceY *= invYScale;
                    tmpPosX = sourceX;
                    tmpPosY = sourceY;
                    sourceX = cosSquashValue * tmpPosX - sinSquashValue * tmpPosY;
                    sourceY = sinSquashValue * tmpPosX + cosSquashValue * tmpPosY;
                    sourceX += sourceCenterX;
                    sourceY += sourceCenterY;
                    sourceX = Math.floor(sourceX);
                    sourceY = Math.floor(sourceY);

                    if (sourceX >= 0 && sourceX < this.divWidth && sourceY >= 0 && sourceY < this.divHeight) {
                        var sourcePixelIndex = (sourceY * this.divWidth + sourceX);
                        var sourceColor = sourceImageData[sourcePixelIndex];
                        var sourceOpacity = ((sourceColor >> 24) & 0xff) / 255 * opacity;
                        if (sourceOpacity > 0) {
                            var sourceR = (sourceColor & 0xff);
                            var sourceG = ((sourceColor >> 8) & 0xff);
                            var sourceB = ((sourceColor >> 16) & 0xff);
                            var targetColor = backScreenData[currentPixelIndex];
                            var targetR = (targetColor & 0xff);
                            var targetG = ((targetColor >> 8) & 0xff);
                            var targetB = ((targetColor >> 16) & 0xff);

                            targetR = (1.0 - sourceOpacity) * targetR;
                            targetR += sourceOpacity * sourceR;
                            targetG = (1.0 - sourceOpacity) * targetG;
                            targetG += sourceOpacity * sourceG;
                            targetB = (1.0 - sourceOpacity) * targetB;
                            targetB += sourceOpacity * sourceB;
                            targetColor = (targetR | (targetG << 8) | (targetB << 16) | (255 << 24));
                            backScreenData[currentPixelIndex] = targetColor;
                        }
                    }
                }
                currentPixelIndex++;
            }
        }
    }
}

function drawRect(x, y, width, height, r, g, b, opacity) {
    var startX = Math.floor(x);
    var startY = Math.floor(y);
    var endX = startX + Math.floor(width);
    var endY = startY + Math.floor(height);
    var tmpR = r * opacity;
    var tmpG = g * opacity;
    var tmpB = b * opacity;
    var currentSourcePixelIndex = 0;
    for (var yIdx = startY; yIdx < endY; yIdx = (yIdx + 1) | 0) {
        var currentTargetPixelIndex = (yIdx) * canvasWidth + startX;
        for (var xIdx = startX; xIdx < endX; xIdx = (xIdx + 1) | 0) {
            if (xIdx >= 0 && xIdx < canvasWidth && yIdx >= 0 && yIdx < canvasHeight) {
                if (opacity > 0.0) {
                    var targetColor = backScreenData[currentTargetPixelIndex];
                    var targetR = (targetColor & 0xff);
                    var targetG = ((targetColor >> 8) & 0xff);
                    var targetB = ((targetColor >> 16) & 0xff);

                    targetR = targetR * (1.0 - opacity) + tmpR;
                    targetG = targetG * (1.0 - opacity) + tmpG;
                    targetB = targetB * (1.0 - opacity) + tmpB;
                    targetColor = (targetR | (targetG << 8) | (targetB << 16) | (255 << 24));
                    backScreenData[currentTargetPixelIndex] = targetColor;
                }
            }
            currentSourcePixelIndex = currentSourcePixelIndex + 1;
            currentTargetPixelIndex = currentTargetPixelIndex + 1;
        }
    }
}



function fillCanvas(r, g, b, opacity) {
    var canvasSize = canvasWidth * canvasHeight;
    var tmpR = r * opacity;
    var tmpG = g * opacity;
    var tmpB = b * opacity;
    for (var pIdx = 0; pIdx < canvasSize; pIdx = (pIdx + 1) | 0) {
        var targetColor = backScreenData[pIdx];
        var targetR = (targetColor & 0xff);
        var targetG = ((targetColor >> 8) & 0xff);
        var targetB = ((targetColor >> 16) & 0xff);
        targetR = (targetR * (1.0 - opacity)) + tmpR;
        targetG = (targetG * (1.0 - opacity)) + tmpG;
        targetB = (targetB * (1.0 - opacity)) + tmpB;
        targetColor = (targetR | (targetG << 8) | (targetB << 16) | (255 << 24));
        backScreenData[pIdx] = targetColor;
    }
}

function drawText(x, y, text, size, color, align, font) {
    if (!valid) {
        return;
    }

    tmpCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    tmpCanvasContext.fillStyle = color;
    if (font != null) {
        tmpCanvasContext.font = size + "px " + font;
    }
    else {
        tmpCanvasContext.font = size + "px";
    }
    tmpCanvasContext.textAlign = "left";
    tmpCanvasContext.textBaseline = "top";
    tmpCanvasContext.fillText(text, 0, 0);
    var textWidth = parseInt(tmpCanvasContext.measureText(text).width) + 1;
    var textHeight = parseInt(size * 1.5) + 1;
    var textImage = tmpCanvasContext.getImageData(0, 0, textWidth, textHeight);
    var textImageBuf = new ArrayBuffer(textImage.data.length);
    var textImageBuf8 = new Uint8ClampedArray(textImageBuf);
    var textImageData = new Uint32Array(textImageBuf);
    for (var px = 0; px < textWidth * textHeight * 4; px = (px + 1) | 0) {
        textImageBuf8[px] = textImage.data[px];
    }
    tmpCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    //left
    var startX = Math.floor(x);
    var startY = Math.floor(y);
    if (align == "right") {
        startX = startX - textWidth;
    }
    else if (align == "center") {
        startX = startX - Math.floor(textWidth / 2);
    }

    var currentSourcePixelIndex = 0;
    for (var yIdx = 0; yIdx < textHeight; yIdx = (yIdx + 1) | 0) {
        var currentTargetPixelIndex = (startY + yIdx) * canvasWidth + startX;
        for (var xIdx = 0; xIdx < textWidth; xIdx = (xIdx + 1) | 0) {
            if (xIdx + startX >= 0 && xIdx + startX < canvasWidth && yIdx + startY >= 0 && yIdx + startY < canvasHeight) {
                var sourceColor = textImageData[currentSourcePixelIndex];
                var opacity = ((sourceColor >> 24) & 0xff) / 255;
                if (opacity > 0) {
                    var sourceR = (sourceColor & 0xff);
                    var sourceG = ((sourceColor >> 8) & 0xff);
                    var sourceB = ((sourceColor >> 16) & 0xff);
                    var targetColor = backScreenData[currentTargetPixelIndex];
                    var targetR = (targetColor & 0xff);
                    var targetG = ((targetColor >> 8) & 0xff);
                    var targetB = ((targetColor >> 16) & 0xff);
                    targetR = targetR * (1.0 - opacity);
                    targetR += sourceR * opacity;
                    targetG = targetG * (1.0 - opacity);
                    targetG += sourceG * opacity;
                    targetB = targetB * (1.0 - opacity);
                    targetB += sourceB * opacity;
                    targetColor = (targetR | (targetG << 8) | (targetB << 16) | (255 << 24));
                    backScreenData[currentTargetPixelIndex] = targetColor;
                }
            }
            currentSourcePixelIndex = currentSourcePixelIndex + 1;
            currentTargetPixelIndex = currentTargetPixelIndex + 1;
        }
    }
}
