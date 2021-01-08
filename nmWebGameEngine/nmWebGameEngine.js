var control;
var loadingFunction;
var mainFunction;
var timeId;

function nmGameInit(myInit, myLoading, myMain, myTweet) {
    imageManagerInit();
    soundManagerInit();
    if (myTweet == null) {
        document.getElementById("tweetButtonDiv").remove();
        document.getElementById("volumeOptionDiv").style.width = canvasWidth + "px";
    }
    else {
        document.getElementById("tweetShare").addEventListener("mousedown", function(e) {
            tweetText=myTweet();
            document.getElementById("tweetShare").href='https://twitter.com/share?ref_src=twsrc%5Etfw&text='
                + tweetText + "&url=" + location.href;
        });
    }
    control = new ControlManager();
    myInit();
    loadingFunction = myLoading;
    mainFunction = myMain;
    timerId = setInterval("nmGameMain()", 33);
}

function nmGameMain() {
    imageManagerPreviousLoop();
    if (loadingImage == loadCompleteImage && loadingSound == loadCompleteSound) {
        control.updateState();
        mainFunction();
        if (!control.hasFocus()) {
            fillCanvas(255, 255, 255, 0.5);
            drawText(canvasWidth / 2, canvasHeight / 2 - 25, "画面をクリックしてください", 50, "rgb(0, 0, 0)", "center", "MSゴシック");
        }
    }
    else {
        loadingFunction();
    }
    imageManagerPostLoop();
}
