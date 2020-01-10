class SuggestionWrapper{
    constructor(id,location,type){
        this.id = id;
        this.location = location;
        this.type = type;
    }

    getId(){
        return this.id;
    }

    getType(){
        return this.type;
    }

    getLatitude(){
        return this.location.latitude;
    }

    getLongitude(){
        return this.location.longitude;
    }
}