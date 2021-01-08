var titleRogoImage;
var selectTitleSound;
var hiScoreData;
var count;

function gameInit() {
    titleRogoImage = new ImageManager("img/titleRogo.png", 1, 1);
    //selectTitleSound = new SoundManager("sound/selectTitle.mp3", 1.0, false, 0, null);
    backColor=[220,255,255];
    countData = new SaveDataManager("saveCount", 0);
    count = countData.getDataAsInt();
}

function gameLoading() {
    fillCanvas(0, 0, 0, 1.0);
    drawText(canvasWidth / 2, canvasHeight / 2 - 25, "Now Loading...", 50, "rgb(255, 255, 255)", "center", "MSゴシック");
}

function gameMain() {
    titleRogoImage.drawImageWithRotateScaleOpacity(control.mouseX, control.mouseY, 0, 0, count * Math.PI / 180.0, 1, 1, 1);
    if (!control.mouseClicked[0]) {
        count++;
    }
    else if (control.mouseClickedStableCount[0] == 0) {
        countData.saveData(count);
    }
    if (count >= 360) {
        count = 0;
    }
    if (control.isKeyDown("z") == 1) {
        //selectTitleSound.play(true);
    }
}

function gameTweet() {
    return "ツイートするテキスト"
}
