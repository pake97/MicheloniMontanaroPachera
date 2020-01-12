/**
 * ReportViolationManagerActivity:
 * this activity concludes the pipeline of reporting a violation
 * it contains all the methods to upload data on firebase, to manage
 * gpl location and system clock.
 */
package com.ap.android.SafeStreets;
import android.content.Context;
import android.content.Intent;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.FirebaseFunctionsException;
import com.google.firebase.functions.HttpsCallableResult;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.UploadTask;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

public class ReportViolationManagerActivity extends AppCompatActivity implements AdapterView.OnItemSelectedListener {

    final String TAG_INFO="<===INFO===>";
    final String TAG_ERROR="<===ERROR===>";
    //firebase reference
    private FirebaseFirestore mFirebaseFirestore;
    //firebase storage ref
    private StorageReference imageFolder;
    //firebase colection ref
    private CollectionReference dbRefViolation;
    //violation
    private Violation v;
    //type choice (index of violations array)
    int choice=0;
    private String[] violations={"double_parking","forbidden_parking","cycle_parking","unpayd_parking","sidewalk_parking","handicap_parking"};
    // ui button
    private Button conclude;
    //address
    private Address address;
    private String licPlateUri;
    private String[] paths;
    private TextView text_Address;
    private TextView text_Date;
    private TextView text_Plate;
    // date initialized to device's date in case of server function getDate() not responding
    private String date= new Date().toString();
    //license plate
    private String license;

    /**
     * onCreate : called when the page is created, load the ui elements and set the event listeners, get the GPS location and corresponding
     * address with the geocoder.
     * @param savedInstanceState
     */
    protected void onCreate(Bundle savedInstanceState)throws SecurityException {
        super.onCreate(savedInstanceState);
        //load ui
        setContentView(R.layout.activity_rvm);
        getDate();
        //load ui elements
        conclude = findViewById(R.id.buttonconclude);
        text_Address=findViewById(R.id.textAddress);
        text_Date=findViewById(R.id.textDate);
        text_Plate=findViewById(R.id.textPlate);
        //reference to firebase firestore
        mFirebaseFirestore = FirebaseFirestore.getInstance();
        //reference to firestore collection violations
        dbRefViolation = mFirebaseFirestore.collection("violations");
        // reference to firebase storage
        imageFolder =   FirebaseStorage.getInstance().getReference();

        //get location manager
        final LocationManager locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
        //set provider
        final String locationProvider = LocationManager.GPS_PROVIDER;
        //get location
        final Location loc=locationManager.getLastKnownLocation(locationProvider);
        Log.d(TAG_INFO,loc.toString());
        // use geocoder to get the address from the location
        Geocoder geocoder = new Geocoder(this, Locale.ITALY);
        try {
            address = geocoder.getFromLocation(
                    loc.getLatitude(),
                    loc.getLongitude(),
                    1).get(0);
        } catch (IOException ioException) {
            Log.e(TAG_ERROR, "unable to get address "+ioException.toString());
        } catch (IllegalArgumentException illegalArgumentException) {
            // Catch invalid latitude or longitude values.
            Log.e(TAG_ERROR, "wrong coordinates" + ": " +
                    "Latitude = " + loc.getLatitude() +
                    ", Longitude = " +
                    loc.getLongitude()+" "+ illegalArgumentException.toString());
        }
        //get data from previous activity
        Intent temp = getIntent();
        license = temp.getStringExtra("licensePlate");
        paths = temp.getStringArrayExtra("list_path");
        licPlateUri = temp.getStringExtra("licensePlateUri");

        //set text to the UI
        text_Plate.setText(license);
        text_Address.setText(address.getAddressLine(0));
        text_Date.setText(date);

        //set listener for type selection using spinner and array adapter (choices in res/values/choice.xml)
        Spinner spinner = (Spinner) findViewById(R.id.spinnertype);
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,R.array.type_violation_choice, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
        spinner.setOnItemSelectedListener(this);
        //set button listener
        conclude.setOnClickListener(
                new View.OnClickListener(){
                    @Override
                    public void onClick(View v) {
                        concludeReport(license,paths,loc);
                    }
                }
        );

    }

    /**
     * concludeReport: upload the violation calling the other methods and return to the MainActivity
     * @param licPlate license plate
     * @param imagePaths array of paths
     * @param location GPS location
     */
    public void concludeReport(String licPlate,String[] imagePaths,Location location)
    {
        //get list of URI from array of Strings
        List<Uri> paths=new ArrayList<>();
        for(int i = 0;i<imagePaths.length;i++)
            paths.add(Uri.parse(imagePaths[i]));
        //upload picture to firebase storage
        pictureUpload(paths,Uri.parse(licPlateUri));
        //wrap al the information about the violation in an object of class Violation
        if(address==null)
             v = new Violation(violations[choice],"not found",location,licPlate,imagePaths[imagePaths.length-1],imagePaths);
        else
             v = new Violation(violations[choice],address.getAddressLine(0),location,licPlate,imagePaths[imagePaths.length-1],imagePaths);
        //upload violation to firebase firestore
        uploadViolation(v);
        Toast.makeText(this,"VIOLATION UPLOADED", Toast.LENGTH_LONG);
        //return to main
        Intent finish = new Intent(ReportViolationManagerActivity.this, MainActivity.class);
        startActivity(finish);
    }


    /**
     * pictureUpload: upload all the pics of a violation to firebase storage
     * @param pictures pictures of violation
     * @param licensePlate license plate picture of a violation
     */
    public void pictureUpload(List<Uri> pictures, Uri licensePlate) {

        int uploads=0;
        //for loop foreach picture
        for (uploads=0; uploads < pictures.size() && uploads < Violation.MAX_NUM_PICTURES; uploads++){
            //get the uri
            Uri img = pictures.get(uploads);
            //reference to firebase storage
            final StorageReference imagename = imageFolder.child(img.getLastPathSegment());
            //upload the picture
            imagename.putFile(img).addOnSuccessListener(this, new OnSuccessListener<UploadTask.TaskSnapshot>() {
                @Override
                public void onSuccess(UploadTask.TaskSnapshot taskSnapshot) {
                            Log.d(TAG_INFO,"uploaded");
                        }
                });
        }

        //upload the license plate picture
        final StorageReference imagename = imageFolder.child(licensePlate.getLastPathSegment());
        imagename.putFile(licensePlate).addOnSuccessListener(new OnSuccessListener<UploadTask.TaskSnapshot>() {
            @Override
            public void onSuccess(UploadTask.TaskSnapshot taskSnapshot) {

                        Log.d(TAG_INFO,"uploaded");
                    } });
    }


    /**
     * uploadViolation: upload violation to firebase firestore
     * @param v violation to upload
     */
    public void uploadViolation(Violation v) {
        //get the map of a violation
        Map<String, Object> violation = v.getMap();
        // pushing violation with a auto-generated primary key
        dbRefViolation.add(violation)
                .addOnSuccessListener(new OnSuccessListener<DocumentReference>() {
                    @Override
                    public void onSuccess(DocumentReference documentReference) {
                        Log.d(TAG_INFO, "DocumentSnapshot written with ID: " + documentReference.getId());
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.w(TAG_ERROR, "Error adding document", e);
                    }
                });
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
        choice=pos;
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
     * getDate: this method send an httprequest to the firebase server to get the date from the system clock
     * avoiding the user to change the device's datetime.
     */
    private void getDate() {
         //reference to firebase function  and request
         FirebaseFunctions.getInstance()
                .getHttpsCallable("getDateTime")
                .call()
                .continueWith(new Continuation<HttpsCallableResult, String>() {
                    @Override
                    public String then(@NonNull Task<HttpsCallableResult> task) throws Exception {
                        String result = task.getResult().getData().toString();
                        date=result;
                        return result;
                    }
                })
                .addOnCompleteListener(new OnCompleteListener<String>() {
                    @Override
                    public void onComplete(@NonNull Task<String> task) {
                        if (!task.isSuccessful()) {
                            Exception e = task.getException();
                            if (e instanceof FirebaseFunctionsException) {
                                FirebaseFunctionsException ffe = (FirebaseFunctionsException) e;
                                FirebaseFunctionsException.Code code = ffe.getCode();
                                Object details = ffe.getDetails();
                            }
                        }
                    }
                });
    }
    /**
     *onStop: called when the activity is stopped
     */
    @Override
    protected void onStop(){
        super.onStop();
        Log.d(TAG_INFO,"application stopped");
    }

    /**
     *onPaused: called when the activity is paused
     */
    @Override
    protected void onPause(){
        super.onPause();
        Log.d(TAG_INFO,"application paused");
    }

    /**
     *onDestroy: called when the activity is destroyed
     */
    @Override
    protected void onDestroy(){
        super.onDestroy();
        Log.d(TAG_INFO,"application destroyed");
    }

    /**
     *onResume: called when the activity is resumed
     */
    @Override
    protected void onResume(){
        super.onResume();
        Log.d(TAG_INFO,"application resumed");
    }

    /**
     *onRestart: called when the activity is restarted
     */
    @Override
    protected void onRestart(){
        super.onRestart();
        Log.d(TAG_INFO,"application restarted");
    }
}
