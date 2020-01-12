/**
 * StartReportActivity.java
 * This activity manages the process of taking photos of the violation, with the possibility to
 * delete them and retaking them.
 * The logic behind consists in an array of 5 ImageVIew and an array of 5 bitmaps (up to 5).
 * At the end of the process all the images are saved in the temporary memory and their paths are forwarded to the next activity
 **/

package com.ap.android.SafeStreets;
import androidx.appcompat.app.AppCompatActivity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class StartReportActivity extends AppCompatActivity implements View.OnClickListener {

    final int REQUEST_CODE = 1; //handling camera
    //ImageViews
    private ImageView pic;
    private ImageView pic1;
    private ImageView pic2;
    private ImageView pic3;
    private ImageView pic4;
    private ImageView pic5;
    private Button delete;
    private Button proceed;
    // index of the Bitmap setted in the center of the screen
    private int settedImgIndex=0;
    //array of bitmaps,imageViews and paths
    private List<Bitmap> images=new ArrayList<>();
    private List<ImageView> pics=new ArrayList<>();

    private List<String> list_path=new ArrayList<>();
    final String TAG_ERROR = "<======ERROR=====>";
    final String TAG_INFO="<=====INFO=====>";

    /**
     * onCreate : called when the page is created, load the ui elements and set the event listeners.
     * @param savedInstanceState
     */
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //ui load
        setContentView(R.layout.activity_report);
        //get the intent from the previous activity
        Intent intent=getIntent();
        //get the uri of the img (needed at the end)
        list_path.add(intent.getStringExtra("pathImageUri"));
        //get the absolute path of the img
        String pathImage=intent.getStringExtra("pathImage");
        Log.d(TAG_INFO,pathImage);
        //decode the img and add to the array
        images.add(BitmapFactory.decodeFile(pathImage));
        //load ui elements
        pic=findViewById(R.id.pic);
        pic1=findViewById(R.id.pic1);
        pic2=findViewById(R.id.pic2);
        pic3=findViewById(R.id.pic3);
        pic4=findViewById(R.id.pic4);
        pic5=findViewById(R.id.pic5);
        delete=findViewById(R.id.del);
        proceed=findViewById(R.id.proceed);
        //add to array
        pics.add(pic1);
        pics.add(pic2);
        pics.add(pic3);
        pics.add(pic4);
        pics.add(pic5);

        //set the bitmap in the center of the screen with the img taken in MainActivity resizing it
        pic.setImageBitmap(Bitmap.createScaledBitmap(images.get(images.size()-1),600,1000,false));
        //set the same bitmap to the thumbnail in the bottom of the screen
        pic1.setImageBitmap(images.get(0));

        //set listeners

        pic1.setOnClickListener(this);
        pic2.setOnClickListener(this);
        pic3.setOnClickListener(this);
        pic4.setOnClickListener(this);
        pic5.setOnClickListener(this);
        delete.setOnClickListener(this);
        proceed.setOnClickListener(this);


    }

    /**
     * onCLick: the handler of the user's action
     * @param v : the button clicked
     */
    @Override
    public void onClick(View v) {
        switch(v.getId()){
            case R.id.pic1:
            {
                //set the clicked img to the center of the screen
                if(images.size()>0){
                    pic.setImageBitmap(Bitmap.createScaledBitmap(images.get(0),600,1000,false));
                    settedImgIndex=0;
                }
                break;
            }
            case R.id.pic2:
            {
                //set the clicked img to the center of the screen, if the img is not already taken, open camera
                if(images.size()>1){
                    pic.setImageBitmap(Bitmap.createScaledBitmap(images.get(1),600,1000,false));
                    settedImgIndex=1;
                }
                else
                    takePhoto();
                break;
            }
            case R.id.pic3:
                 {
                     //set the clicked img to the center of the screen, if the img is not already taken, open camera
                        if(images.size()>2){
                            pic.setImageBitmap(Bitmap.createScaledBitmap(images.get(2),600,1000,false));
                            settedImgIndex=2;
                        }
                        else
                            takePhoto();
                        break;
                 }
            case R.id.pic4:
            {
                //set the clicked img to the center of the screen, if the img is not already taken, open camera
                if(images.size()>3){
                    pic.setImageBitmap(Bitmap.createScaledBitmap(images.get(3),600,1000,false));
                    settedImgIndex=3;
                }
                else
                    takePhoto();
                break;
            }
            case R.id.pic5:
            {
                //set the clicked img to the center of the screen, if the img is not already taken, open camera
                if(images.size()>4){
                    pic.setImageBitmap(Bitmap.createScaledBitmap(images.get(4),600,1000,false));
                    settedImgIndex=4;
                }
                else
                    takePhoto();
                break;
            }
            case R.id.del:
            {
                //delete img
                deletePic();
                break;
            }
            case R.id.proceed:
            {
                //continue
                continueReport();
                break;
            }
        }
    }

    /**
     * takePhoto: send an intent to the Camera application of the OS
     */
    protected void takePhoto(){
        Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        startActivityForResult(cameraIntent,REQUEST_CODE);
    }
    /**
     * onActivityResult: catch the return of the camera application, save the image on temporary memory
     * and add the bitmap to the array after setting it to the center of the screen.
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
                //add bitmap to array
                images.add(bitmap);
                //set bitmap to thumbnail on bottom screen
                pics.get(images.size()-1).setImageBitmap(bitmap);
                //set bitmap to center of screen
                pic.setImageBitmap(Bitmap.createScaledBitmap(bitmap,600,1000,false));
                //take path
                String filePath = tempFileImage(StartReportActivity.this, bitmap, ""+Math.random()+ LocalDateTime.now().toString());
                //add path to the list
                list_path.add(filePath);
        }}
        else{
            Log.d(TAG_ERROR, "error in taking photo");
        }
    }

    /**
     * tempFileImage: save the picture in the temporary memory and return the path
     * (uri is needed to upload on firebase, no absolute path needed in next activities)
     * @param context: context of the application
     * @param bitmap: picture to save
     * @param name: name of the image to save
     * @return: uri of img saved
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
        return imageFile.toURI().toString();
    }


    /**
     *continueReport: saves the list of paths into an array and passes them to the next activity
     */
    protected void continueReport(){
        Intent activityChangeIntent = new Intent(StartReportActivity.this, LicensePlateRecognizerActivity.class);
        String[] paths = new String[list_path.size()];
        for(int i = 0;i<list_path.size();i++)
            paths[i]=list_path.get(i);
        activityChangeIntent.putExtra("list_path",paths);
        startActivity(activityChangeIntent);
    }

    /**
     * deletePic: delete the setted bitmp on the center of the screen, scale backward all the thumbnail
     * and return to MainActivity if every bitmap are deleted
     */
    protected void deletePic(){
        //if last bitmap deleted return back
        if(images.size()==1){
            Intent activityChangeIntent = new Intent(StartReportActivity.this, MainActivity.class);
            startActivity(activityChangeIntent);
        }
        else{
            //remove the setted bitmap
            images.remove(settedImgIndex);
            settedImgIndex=0;
            //Set the first one
            pic.setImageBitmap(Bitmap.createScaledBitmap(images.get(0),600,1000,false));
            //rescale backward updating both thumbnail and "plus" icon
            for(int i =0;i<images.size();i++)
                pics.get(i).setImageBitmap(images.get(i));
            for(int i = images.size();i<5;i++)
                pics.get(i).setImageBitmap(Bitmap.createScaledBitmap(BitmapFactory.decodeResource(this.getResources(),R.drawable.add),50,80,false));
        }
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


