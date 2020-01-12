/**
 * violationWrapper.js
 * This module contains the ViolationWrapper class.
 */
class ViolationWrapper{
    /**
     * constructor(id, location, type, date): constructor of the class.
     * @param id: violation's id. 
     * @param location: violation's location. 
     * @param type: violation's type. 
     * @param date: violation's date.
     */
    constructor(id, location, type, date) {
        this.id=id;
        this.location=location;
        this.type=type;
        this.date = new Date(date);
    }

    /**
     * getId(): this function returns the violation's id.
     * @returns id: violation's id.
     */
    getId()
    {
        return this.id;
    }

    /**
     * getLatitude(): this function returns the violation's latitude.
     * @returns latitude: violation's latitude.
     */
    getLatitude()
    {
        return this.location.latitude;
    }

    /**
     * getLongitude(): this function returns the violation's longitude.
     * @returns ilongituded: violation's longitude.
     */
    getLongitude()
    {
        return this.location.longitude;
    }

    /**
     * getType(): this function returns the violation's type
     * @returns type: violation's type.
     */
    getType()
    {
        return this.type;
    }

    /**
     * getDate(): this function returns the violation's date
     * @returns date: violation's date.
     */
    getDate()
    {
        return this.date;
    }
    
}