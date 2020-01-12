/**
 * LicensePlateActivity:
 * This activity shows to the user the picture of the license plate and the extract text,
 * the user can continue if the OCR worked well or retry to take the picture
 */


package com.ap.android.SafeStreets;
import android.app.Activity;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

public class LicensePlateActivity extends Activity implements View.OnClickListener {

    final String TAG_INFO = "<===INFO===>";
    final String TAG_ERROR = "<===ERROR===>";
    private TextView statusMessage;
    private TextView textValue;
    private String[] list_paths;
    private String licenseplate;
    private String licenseplateUri;

    /**
     * onCreate : called when the page is created, load the ui elements and set the event listeners.
     * @param savedInstanceState
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //load ui
        setContentView(R.layout.activity_report2);
        //get intent from previous activity
        Intent temp = getIntent();
        //list paths
        list_paths = temp.getStringArrayExtra("list_path");
        //license plate text
        licenseplate = temp.getStringExtra("license_plate");
        //license plate img uri
        licenseplateUri = temp.getStringExtra("license_plateUri");
        //set the bitmap of the license plate in the center of the screen
        ((ImageView)findViewById(R.id.licPlate_view)).setImageBitmap(BitmapFactory.decodeFile(licenseplateUri.split(",")[1]));
        //load ui elements
        statusMessage = (TextView) findViewById(R.id.status_message);
        textValue = (TextView) findViewById(R.id.text_value);

        //set text
        setText();

        //set listeners
        findViewById(R.id.read_text).setOnClickListener(this);
        findViewById(R.id.cocnlude).setOnClickListener(this);
    }

    /**
     * setText: set the status message on top of the screen based on the result
     */
    private void setText(){
        if(licenseplate=="None") {
            statusMessage.setText("No License Plate detected");
            textValue.setText(licenseplate);
        }
        else
        {
            statusMessage.setText("License Plate detected");
            textValue.setText(licenseplate);
        }
    }
    /**
     * onCLick: the handler of the user's action
     * @param v : the button clicked
     */
    @Override
    public void onClick(View v) {
        //retry to read the text so intent to previous activity
        if (v.getId() == R.id.read_text) {
            Intent retry = new Intent(LicensePlateActivity.this, LicensePlateRecognizerActivity.class);
            retry.putExtra("list_path", list_paths);
            startActivity(retry);
        }
        //conclude the report so intent to the final activity
        if (v.getId() == R.id.cocnlude) {
            Intent continueReport = new Intent(LicensePlateActivity.this, ReportViolationManagerActivity.class);
            continueReport.putExtra("list_path", list_paths);
            continueReport.putExtra("licensePlate", licenseplate);
            continueReport.putExtra("licensePlateUri", licenseplateUri.split(",")[0]);
            startActivity(continueReport);
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

