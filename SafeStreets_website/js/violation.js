class Violation{
    constructor(id, adress, date, type, license_plate, pics,numpics) {
        this.id=id;
        this.adress=adress;
        this.date=date;
        this.type=type;
        this.license_plate=license_plate;
        this.pics=pics;
        this.numpics=numpics;
    }

    getId()
    {
        return this.id;
    }
    getAddress()
    {
        return this.adress;
    }
    getDate()
    {
        return this.date;
    }
    getType()
    {
        return this.type;
    }
    getLicensePlate()
    {
        return this.license_plate;
    }
    getPics()
    {
        return this.pics;
    }
    getNumPics()
    {
        return this.numpics;
    }
}