
var soundVolume = 1.0;
var soundVolumeSaveData;
var loadingSound = 0;
var loadCompleteSound = 0;

function soundManagerInit() {
    loadingSound = 0;
    loadCompleteSound = 0;
    soundVolumeSaveData = new SaveDataManager("NagayaVolume", 100);
    var soundInt = soundVolumeSaveData.getDataAsInt();
    soundVolume = soundInt / 100;

    var volumeSlider = document.getElementById("volumeSlider");
    volumeSlider.value = soundInt;
    volumeSlider.addEventListener("input", e=>{soundVolumeChange(e);}, false);

    var volumeOutput = document.getElementById("volumeOutput");
    volumeOutput.value = soundInt;
}

function soundVolumeChange(event) {
    var volumeOutput = document.getElementById("volumeOutput");
    soundVolume = event.target.value / 100;
    soundVolumeSaveData.saveData(event.target.value);
    volumeOutput.value = event.target.value;
}

class SoundManager {
    constructor(filePath, localVolume, isLoop, loopStartSec, endTime) {
        loadingSound++;
        this.audio = new Audio();
        this.isLoaded = false;
        this.audio.addEventListener("canplay", e=>{if (!this.isLoaded){loadCompleteSound++; this.isLoaded = true;}}, false);
        this.audio.src = filePath;
        this.localVolume = localVolume;
        this.audioLoopStartSec = loopStartSec;
        this.audioEndTime = endTime;
        this.promise = null;

        //範囲再生やループへの対応
        if (isLoop) {
            if (endTime != null){
                this.audio.addEventListener("timeupdate", e=>{
                    if (this.audio.currentTime >= this.audioEndTime) {
                        this.audio.currentTime = this.audioLoopStartSec;
                        this.promise = this.promise.then(_ => {return this.audio.play();}).catch(error => {});
                    }
                }, false);
            }
            else {
                this.audio.addEventListener("ended", e=>{
                    this.audio.currentTime = this.audioLoopStartSec;
                    this.promise = this.promise.then(_ => {return this.audio.play();}).catch(error => {});
                }, false);
            }
        }
        else {
            if (endTime != null) {
                this.audio.addEventListener("timeupdate", e=>{
                    if (this.audio.currentTime >= this.audioEndTime) {
                        if (this.promise) {
                            this.promise.then(_ => {this.audio.pause(); this.audio.currentTime = 0;}).catch(error => {});
                        }
                        else {
                            this.audio.pause();
                            this.audio.currentTime = 0;
                        }
                    }
                }, false);
            }
        }

        //途中の音量変更に対応
        this.audio.addEventListener("timeupdate", e=>{
            this.audio.volume = soundVolume * this.localVolume
        }, false);
    }
}

SoundManager.prototype.play = function(isFromStart) {
    if (this.promise) {
        this.promise.then(_ => {this.audio.pause();}).catch(error => {});
    }
    this.audio.volume = soundVolume * this.localVolume;
    if (isFromStart) {
        this.audio.currentTime = 0;
    }
    if (this.promise) {
        this.promise = this.promise.then(_ => {return this.audio.play();}).catch(error => {});
    }
    else {
        this.promise = this.audio.play();
    }
}

SoundManager.prototype.playRate = function(rate) {
    this.audio.playbackRate = rate;
}

SoundManager.prototype.pause = function() {
    if (this.promise) {
        this.promise.then(_ => {this.audio.pause();}).catch(error => {});
    }
    else {
        this.audio.pause();
    }
}
