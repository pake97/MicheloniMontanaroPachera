/**
 * violation.js
 * This module contains the Violation class.
 */

class Violation{
    /**
     * constructor(id, adress, date, type, license_plate, pics,numpics): constructor of the class.
     * @param id: id of the violation. 
     * @param adress: address of the violation.
     * @param date: date of the violation. 
     * @param type: violation type. 
     * @param license_plate: license plate number. 
     * @param pics: violation's pics.
     * @param numpics: number of violation's pics. 
     */
    constructor(id, adress, date, type, license_plate, pics,numpics) {
        this.id=id;
        this.adress=adress;
        this.date=date;
        this.type=type;
        this.license_plate=license_plate;
        this.pics=pics;
        this.numpics=numpics;
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
     * getAddress(): this function returns the violation's address.
     * @returns address: violation's address.
     */
    getAddress()
    {
        return this.adress;
    }

    /**
     * getDate(): this function returns the violation's date.
     * @returns date: violation's date.
     */
    getDate()
    {
        return this.date;
    }

    /**
     * getType(): this function returns the violation's type.
     * @returns type: violation's type.
     */
    getType()
    {
        return this.type;
    }

    /**
     * getLicensePlate(): this function returns the license plate number.
     * @returns license_plate: license plate number.
     */
    getLicensePlate()
    {
        return this.license_plate;
    }

    /**
     * getPics(): this function returns the violation's pictures.
     * @returns pics: violation's pictures.
     */
    getPics()
    {
        return this.pics;
    }


    /**
     * getNumPics(): this function returns the violation's pictures number.
     * @returns numpics: violation's pictures number.
     */
    getNumPics()
    {
        return this.numpics;
    }
}