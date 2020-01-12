/**
 * LicensePlateRecognizerActivity:
 * This activity takes the photo of the license plate and runs the OCR to extract the text from
 * the picture, saving both the text and the image in the temporary memory
 * This activity uses two externals API :
 * CameraKit , to have a cropped preview and focuses the camera on thelicense plate
 * Google Vision TextRecognizer : ocr to extract license plate from img
 */



package com.ap.android.SafeStreets;
import com.google.android.gms.vision.Frame;
import com.google.android.gms.vision.text.TextBlock;
import com.google.android.gms.vision.text.TextRecognizer;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.util.Log;
import android.util.SparseArray;
import android.view.View;
import com.camerakit.CameraKitView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.time.LocalDateTime;
import androidx.appcompat.app.AppCompatActivity;



public class LicensePlateRecognizerActivity extends AppCompatActivity {

    final String TAG_INFO="<===INFO===>";
    final String TAG_ERROR="<===ERROR===>";
    private CameraKitView cameraKitView;
    private TextRecognizer detector;
    private String lic_plate="";
    private Bitmap bitmapImage;
    //path from previous activity
    private String[] list_path;


    /**
     * onCreate : called when the page is created, load the ui elements and set the event listeners.
     * @param savedInstanceState
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //load ui
        setContentView(R.layout.activity_prova);
        cameraKitView = findViewById(R.id.camera);
        //load text dedector
        detector = new TextRecognizer.Builder(getApplicationContext()).build();
        //get intent from previous activity
        Intent temp = getIntent();
        //get paths
        list_path=temp.getStringArrayExtra("list_path");
        //set button and listener
        FloatingActionButton mButtonTakePhoto = findViewById(R.id.take_photo_button);
        mButtonTakePhoto.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                takePhoto();
            }
        });
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
     * takePhoto: take the picture, extracts the bitmap , get the URI and absolute path,
     * pass the bitmap to the extractText function and finally send the results to the next activity
     */
    private void takePhoto(){
        cameraKitView.captureImage(new CameraKitView.ImageCallback() {
            @Override
            public void onImage(CameraKitView cameraKitView, final byte[] photo) {
                //get bitmpap
                bitmapImage = BitmapFactory.decodeByteArray(photo, 0, photo.length, null);
                //get uri and path
                String LicPlateImgfilePath= tempFileImage(LicensePlateRecognizerActivity.this, bitmapImage,""+Math.random()+ LocalDateTime.now().toString());
                //Temporary stores the captured photo into a file that will be used from the Result activity
                Log.d(TAG_INFO,LicPlateImgfilePath);
                try {
                    extractText();
                    }
                catch (Exception e) {
                    Log.e(TAG_ERROR, e.toString());
                }
                Log.d(TAG_INFO,lic_plate);
                //send result and previous path to next activity
                Intent proceed = new Intent(LicensePlateRecognizerActivity.this, LicensePlateActivity.class);
                proceed.putExtra("list_path",list_path);
                proceed.putExtra("license_plate",lic_plate);
                proceed.putExtra("license_plateUri",LicPlateImgfilePath);
                startActivity(proceed);
            }
        });
    }

    /**
     * extractText: uses the OCR to extract text from the bitmap and saves it
     */
    private void extractText(){
        if (detector.isOperational() && bitmapImage != null) {
            Frame frame = new Frame.Builder().setBitmap(bitmapImage).build();
            SparseArray<TextBlock> textBlocks = detector.detect(frame);
            lic_plate+=textBlocks.valueAt(0).getComponents().get(0).getValue();
            Log.d(TAG_INFO,lic_plate);
        } else {
            //Could not set up the detector!
            lic_plate ="None";
        }

    }

    /**
     *onStart: called when the activity is started
     */
    @Override
    protected void onStart() {
        super.onStart();
        cameraKitView.onStart();
    }
    /**
     *onResume: called when the activity is resumed
     */
    @Override
    protected void onResume() {
        super.onResume();
        cameraKitView.onResume();
    }
    /**
     *onPause: called when the activity is paused
     */
    @Override
    protected void onPause() {
        cameraKitView.onPause();
        super.onPause();
    }
    /**
     *onStop: called when the activity is stopped
     */
    @Override
    protected void onStop() {
        cameraKitView.onStop();
        super.onStop();
    }

    /**
     * Handle permission for CameraKit
     * @param requestCode code for request permission
     * @param permissions permission code
     * @param grantResults result code
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        cameraKitView.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

}
