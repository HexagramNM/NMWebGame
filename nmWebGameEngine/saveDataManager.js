
class SaveDataManager {

    constructor(key, defData) {
        this.key = key;
        try{
        this.data = localStorage.getItem(this.key);
            if (this.data == null) {
                this.data = defData;
                localStorage.setItem(this.key, defData);
            }
        }
        catch (e) {
            this.data = defData;
        }
    }
}

SaveDataManager.prototype.getData = function() {
    return this.data;
}

SaveDataManager.prototype.getDataAsInt = function() {
    return parseInt(this.data);
}

SaveDataManager.prototype.saveData = function(data) {
    this.data = data;
    try{
        localStorage.setItem(this.key, data);
    }
    catch(e) {
        
    }
}
