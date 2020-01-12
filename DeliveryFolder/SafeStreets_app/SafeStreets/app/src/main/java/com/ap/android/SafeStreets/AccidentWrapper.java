/**
 * AccidentWrapper.java
 * The AccidentWrapper class contains the logic to save and retrieve all accident's data
 **/

package com.ap.android.SafeStreets;

import com.google.firebase.firestore.GeoPoint;


public class AccidentWrapper {
    private GeoPoint location;

    public AccidentWrapper(GeoPoint location){
        this.location=location;
    }

    public GeoPoint getGeoPoint()
    {
        return this.location;
    }

    public double getLatitude(){
        return this.location.getLatitude();
    }
    public double getLongitude(){
        return this.location.getLongitude();
    }


}
