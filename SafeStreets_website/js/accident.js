class Accident{
    constructor(id, location,vehicles) {
        this.id=id;
        this.location=location;
        this.vehicles=vehicles;
    }

    getId()
    {
        return this.id;
    }
    getLatitude()
    {
        return this.location.latitude;
    }
    getLongitude()
    {
        return this.location.longitude;
    }
    getVehicles()
    {
        return this.vehicles;
    }
}