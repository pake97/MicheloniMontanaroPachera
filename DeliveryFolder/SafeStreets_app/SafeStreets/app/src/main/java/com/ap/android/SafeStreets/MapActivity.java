/**
 * MapActivity.java
 * this activity shows to the user the map using google maps API,
 * calls the function of StatisticManager class to compute unsafe areas
 * or plot violations.
 * To plot the map the activity uses fragments which is an element of Android
 * to manage ui elements that could be visible or invisible depending on availability.
 */

package com.ap.android.SafeStreets;

import androidx.annotation.NonNull;
import androidx.fragment.app.FragmentActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;
import java.util.ArrayList;
import java.util.List;

public class MapActivity extends FragmentActivity implements OnMapReadyCallback, AdapterView.OnItemSelectedListener {

    //list of violations and accidents
    private List<AccidentWrapper> mAccidents=new ArrayList<>();
    private List<ViolationWrapper> mVioalations=new ArrayList<>();
    //google maps map
    private GoogleMap mMap;
    final String TAG_INFO="<===INFO===>";
    final String TAG_ERROR="<===ERROR===>";
    //boolean to control the async response of firebase
    private Boolean gotAccidents=false;
    private Boolean gotViolations=false;
    // type choice
    private int choice=0;
    //ref to firestore
    private FirebaseFirestore db = FirebaseFirestore.getInstance();
    //object of StatisticManager
    private StatisticsManager stats;

    /**
     * onCreate : called when the page is created, load the ui elements, set the event listeners and load Goggle maps.
     * @param savedInstanceState
     */

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //load ui
        setContentView(R.layout.activity_map);
        //get accidents and violations from firebase firestore
        getListAccidents();
        getListViolation();
        // spinner to select type of map
        Spinner spinner = (Spinner) findViewById(R.id.spinner);
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,R.array.map_choice, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
        spinner.setOnItemSelectedListener(this);
        stats=new StatisticsManager();
        //load map, use fragment because the ui is loaded only when the map is ready
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);
    }
    /**
     *onMapReady: method of OnMapReadyCallback interface
     *load google maps map with center in Milan and call StatisticManager method to plot unsafe areas or violations
     */
    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;
        if(choice==0  && gotAccidents)
            stats.unsafeArea(mMap,mAccidents);
        else if(choice==1  && gotViolations)
            stats.mapViolation(mMap,mVioalations);
        LatLng milano = new LatLng(45.464043639236, 9.191265106201174);
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(milano,13f));
    }
    /**
     * onItemSelected: method of the AdapterView interface, handle the selection of the user
     * @param parent
     * @param view
     * @param pos
     * @param id
     */
    @Override
    public void onItemSelected(AdapterView<?> parent, View view,
                               int pos, long id) {
        if(parent.getItemAtPosition(pos)!=parent.getAdapter().getItem(0)) {
            choice = 1;
            //clear map and plot violations
            mMap.clear();
            stats.mapViolation(mMap,mVioalations);
        }
        else {
            choice = 0;
            //clear map and draws unsafe areas
            mMap.clear();
            stats.unsafeArea(mMap,mAccidents);
        }
    }
    /**
     * onNothingSelected: method of the AdapterView interface, handle the case of no selection
     * @param parent
     */
    @Override
    public void onNothingSelected(AdapterView<?> parent) {
        choice=0;
    }

    /**
     * getListAccidents: request to firebase firestore the list of accidents wrapping them
     * in objects of class Accident
     */
    private void getListAccidents(){
        //get reference to firestore collection
        CollectionReference accidentRefs = db.collection("accidents");
        accidentRefs
                .get()
                .addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
                    //when receive the response
                    @Override
                    public void onComplete(@NonNull Task<QuerySnapshot> task) {
                        if (task.isSuccessful()) {
                            for (QueryDocumentSnapshot document : task.getResult()) {
                                Log.d(TAG_INFO, document.getId() + " => " + document.getData());
                                //add to list
                                mAccidents.add(new AccidentWrapper(document.getGeoPoint("location")));
                            }
                            Log.d(TAG_INFO,mAccidents.size()+"");
                        } else {
                            Log.d(TAG_ERROR, "Error getting documents: ", task.getException());
                        }
                        Log.d(TAG_INFO,""+mAccidents.size());
                        //now it's possible to draw unsafe areas
                        gotAccidents=true;
                    }
                });
    }

    /**
     * getListViolation: request to firebase firestore the list of violations wrapping them
     * in objects of class ViolationWrapper
     */
    private void getListViolation(){
        //get collection reference
        CollectionReference violationRef = db.collection("violations");
        violationRef.whereEqualTo("validated", true)
                .get()
                .addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
                    //when receive the response
                    @Override
                    public void onComplete(@NonNull Task<QuerySnapshot> task) {
                        if (task.isSuccessful()) {
                            for (QueryDocumentSnapshot document : task.getResult()) {
                                //add to list
                                mVioalations.add(new ViolationWrapper(document.getGeoPoint("position"),document.getString("type").toString()));
                            }
                        } else {
                            Log.d(TAG_ERROR, "Error getting documents: ", task.getException());
                        }
                        //now it's possible to plot violations
                        gotViolations=true;
                    }
                });
    }
}