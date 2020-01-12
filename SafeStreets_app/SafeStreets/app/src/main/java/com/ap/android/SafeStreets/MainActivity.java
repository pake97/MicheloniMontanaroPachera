/**
 * MainActivity.java
 * This Activity is the first page of the application.
 * It contains both ui elements and logic elements.
 * UI: there are 3 buttons with their event listener to manage the menu of the application.
 * LOGIC: a function that checks the user's device settings to proceed on reporting a violation and
 * a function that requests all the permission needed by the OS.
 * */
package com.ap.android.SafeStreets;

//import library

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Log;
import android.view.View;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class MainActivity extends AppCompatActivity implements View.OnClickListener{

    final int REQUEST_CODE = 0; //for the camera
    final String TAG_ERROR = "<======ERROR=====>"; //debug
    final String TAG_INFO = "<======INFO=====>"; //debug
    private static final int REQUEST_PERMISSION =1 ; //to handle permission
    private boolean deviceSettings=false; //control the device settings
    //array of permissions needed
    private String[] permission ={Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.CAMERA,Manifest.permission.INTERNET};

    /**
     * onCreate : called when the page is created, load the ui elements and set the event listeners.
     * @param savedInstanceState
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //load ui
        setContentView(R.layout.activity_main);

        //set listeners
        findViewById(R.id.button_violation).setOnClickListener(this);
        findViewById(R.id.button_map).setOnClickListener(this);
        findViewById(R.id.button_stats).setOnClickListener(this);
    }

    /**
     * onCLick: the handler of the user's action
     * @param v : the button clicked
     */
    @Override
    public void onClick(View v) {
        if (v.getId() == R.id.button_violation) {
                deviceSettings=checkDeviceSettings();
                if(deviceSettings)
                    startReport();
        }
        if (v.getId() == R.id.button_map) {
                startMap();
        }
        if (v.getId() == R.id.button_stats) {
                startStats();
        }
    }

    /**
     * startReport: send an intent to the Camera application of the OS
     */
    protected void startReport(){
        Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        startActivityForResult(cameraIntent,REQUEST_CODE);
    }

    /**
     * onActivityResult: catch the return of the camera application, save the image on temporary memory
     * and send an intent to the StartReportActivity with the path of the image taken.
     * @param requestCode: code to manage the camera
     * @param resultCode: result code received by the OS
     * @param data: intent data received by the OS containing the picture taken
     */
    protected void onActivityResult(int requestCode,int resultCode, Intent data){
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode==REQUEST_CODE) {
            //if the picture is taken
            if(data.getExtras()!=null){

                //get the bitmap
                Bitmap bitmap = (Bitmap) data.getExtras().get("data");

                //get the path
                String filePath = tempFileImage(MainActivity.this, bitmap, ""+Math.random()+LocalDateTime.now().toString());

                Intent report = new Intent(MainActivity.this, StartReportActivity.class);
                report.putExtra("pathImageUri", filePath.split(",")[0]);
                report.putExtra("pathImage", filePath.split(",")[1]);

                //send intent to StartReportActivity
                startActivity(report);}
        }
        Log.d(TAG_ERROR, "error in taking photo");
    }

    /**
     * tempFileImage: save the picture in the temporary memory and return the path
     * (uri is needed to upload on firebase and absolutePath is needed to show the image in the next activity)
     * @param context: context of the application
     * @param bitmap: picture to save
     * @param name: name of the image to save
     * @return: String with uri and absolutePath
     */
    private String tempFileImage(Context context, Bitmap bitmap, String name)
    {
        File outputDir = context.getCacheDir();
        File imageFile = new File(outputDir, name + ".jpg");

        OutputStream os;
        try {
            os = new FileOutputStream(imageFile);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, os);
            os.flush();
            os.close();
        } catch (Exception e) {
            Log.e(context.getClass().getSimpleName(), "Error writing file", e);
        }
        return imageFile.toURI().toString()+","+imageFile.getAbsolutePath();
    }


    /**
     * startMap: send an intent to MapActivity
     */
    protected void startMap(){
        Intent activityChangeIntent = new Intent(MainActivity.this, MapActivity.class);
        startActivity(activityChangeIntent);
    }

    /**
     * startMap: send an intent to StatisticManagerActivity
     */
    protected void startStats(){
        Intent activityChangeIntent = new Intent(MainActivity.this, StatisticManagerActivity.class);
        startActivity(activityChangeIntent);
    }

    /**
     * onRequestPermissionsResult: receives the result of permission requests and manage the answer by the user
     * @param requestCode: code to handle permissions
     * @param permissions: array of permissions
     * @param grantResults: code to handle permissions
     */
    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        if (requestCode == REQUEST_PERMISSION) {
            HashMap<String, Integer> permissionResult = new HashMap<>();
            int deniedCount = 0;
            //count denied permission
            for (int i = 0; i < grantResults.length; i++) {
                if (grantResults[i] == PackageManager.PERMISSION_DENIED) {
                    permissionResult.put(permission[i], grantResults[i]);
                    deniedCount++;
                }
            }
            if (deniedCount == 0)
                deviceSettings = true;
            else {
                for (Map.Entry<String, Integer> entry : permissionResult.entrySet()) {
                    String permName = entry.getKey();
                    int permResult = entry.getValue();
                    // alert the user that the application needs the permissions
                    if (ActivityCompat.shouldShowRequestPermissionRationale(this, permName)) {
                        AlertDialog.Builder builder = new AlertDialog.Builder(this);
                        builder.setMessage("Camera, Read Contacts and Write External" +
                                " Storage permissions are required to do the task.");
                        builder.setTitle("Please grant those permissions");
                        //create alert dialog
                        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                deviceSettings = checkDeviceSettings();
                            }
                        });
                        builder.setNeutralButton("Cancel", null);
                        AlertDialog dialog = builder.create();
                        dialog.show();
                    }
                }
            }
        }
    }

    /**
     * checkDeviceSettings: checks if all the permissions are granted in order to continue the report of a violation
     * @return: boolean flag indicating if it's possible to continue with the report.
     */
    private boolean checkDeviceSettings()
    {
        List<String> listPermissionNeeded= new ArrayList<>();
        boolean ret = true;
        for(String perm : permission)
        {
            if(ContextCompat.checkSelfPermission(this,perm)!= PackageManager.PERMISSION_GRANTED)
                listPermissionNeeded.add(perm);
        }
        if(!listPermissionNeeded.isEmpty())
        {
            ActivityCompat.requestPermissions(this,listPermissionNeeded.toArray(new String[listPermissionNeeded.size()]),REQUEST_PERMISSION);
            ret = false;
        }

        return ret;
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


