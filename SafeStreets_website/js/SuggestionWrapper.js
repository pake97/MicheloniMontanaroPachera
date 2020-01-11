/**
 * SuggestionWrapper.js
 * This module contains the SuggestionWrapper class
 */

class SuggestionWrapper{

    /**constructor(id,location,type): class constructor.
     * @param id: id of the suggestion
     * @param location: location of the suggestion
     * @param type: suggestion's type.
     */
    constructor(id,location,type){
        this.id = id;
        this.location = location;
        this.type = type;
    }

    /**
     * getId(): this function returns the id of the suggestion.
     * @returns id: id of the suggestion.
     */
    getId(){
        return this.id;
    }

    /**
     * getType(): this function returns the suggestion's type.
     * @returns type: suggestion's type.
     */
    getType(){
        return this.type;
    }

    /**
     * getLatitude(): this function returns the latitude of the suggestion.
     * @returns latitude: latitude of the suggestion.
     */
    getLatitude(){
        return this.location.latitude;
    }

    /**
     * getLongitude(): this function returns the longitude of the suggestion.
     * @returns longitude: longitude of the suggestion.
     */
    getLongitude(){
        return this.location.longitude;
    }
}