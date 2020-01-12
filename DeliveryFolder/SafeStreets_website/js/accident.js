/**
 * accident.js
 * This module contains the Accident class.
 */

class Accident{
    /**
     * costructor(id, location,vehicles): costructor of the accident class
     * @param id: id of the accident
     * @param location: geographical coordinates of the accidents
     * @param vehicles: vehicles invovled in the accident
     */
    constructor(id, location,vehicles) {
        this.id=id;
        this.location=location;
        this.vehicles=vehicles;
    }

    /**
     * getId():returns the id of the accident
     * @returns id of the accident
     */
    getId()
    {
        return this.id;
    }

    /**
     * getLatitude():returns the latitude of the accident location 
     * @returns latitude of the accident location
     */
    getLatitude()
    {
        return this.location.latitude;
    }

    /**
     * getLongitude():returns the longitude of the accident location 
     * @returns longitude of the accident location
     */
    getLongitude()
    {
        return this.location.longitude;
    }

    /**
     * getVehicles():returns the vehicles involved in the accident 
     * @returns cehicles involved in the accident
     */
    getVehicles()
    {
        return this.vehicles;
    }
}