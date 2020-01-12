/**
 * ViolationWrapper.java
 * The ViolationWrapper class contains the logic to save and retrieve some violation data
 **/

package com.ap.android.SafeStreets;

import com.google.firebase.firestore.GeoPoint;


public class ViolationWrapper {

    private GeoPoint location;
    private String type;


    public ViolationWrapper(GeoPoint location, String type){
        this.location=location;
        this.type= type;
    }

    public String getType()
    {
        return this.type;
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
