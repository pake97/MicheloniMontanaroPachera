class ViolationWrapper{
    constructor(id, location, type, date) {
        this.id=id;
        this.location=location;
        this.type=type;
        this.date = new Date(date);
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
    getType()
    {
        return this.type;
    }
    getDate()
    {
        return this.date;
    }
    
}