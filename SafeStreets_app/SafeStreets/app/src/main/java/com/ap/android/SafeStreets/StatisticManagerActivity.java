/**
 * StatisticManagerActivity.java
 * this activity manages the statistics chart using the library BarChart from github (see build.gradle module app for dependency)
 * In order to get data from firebase this activity manages the choiches of the user to go down the statistics tree (see Design Document)
 */

package com.ap.android.SafeStreets;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.View;

import com.ap.android.SafeStreets.R;
import com.github.mikephil.charting.charts.BarChart;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.utils.ColorTemplate;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.ArrayAdapter;
import android.widget.Spinner;


public class StatisticManagerActivity extends AppCompatActivity {

    //list ov value to plot
    private List<BarEntry> series=new ArrayList<>();
    //list of label
    private List<String> legends=new ArrayList<>();
    final String TAG_INFO="<===INFO===>";
    final String TAG_ERROR="<===ERROR===>";
    //default type
    private String type="double_parking";
    private int timeChoice=0;
    //spinner result
    private Spinner spTypeChoice, spTimeChoice;
    //refs to firebase firestore
    private FirebaseFirestore db = FirebaseFirestore.getInstance();
    private CollectionReference treeRef;
    //chart dataset
    private BarDataSet bardataset;
    private BarChart barChart;


    /**
     * onCreate : called when the page is created, load the ui elements, set the event listeners and load the chart.
     * @param savedInstanceState
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //load ui
        setContentView(R.layout.activity_stats);
        barChart = (BarChart) findViewById(R.id.barchart);
        spTypeChoice = (Spinner) findViewById(R.id.typeChoiche);
        //spinner to manage user seletions
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,R.array.type_violation_choice, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spTypeChoice.setAdapter(adapter);
        spTypeChoice.setOnItemSelectedListener(new OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                switch (position){
                    case 0:
                    {
                        type="double_parking";
                        getListViolation();
                        break;
                    }
                    case 1:
                    {
                        type="cycle_parking";
                        getListViolation();
                        break;
                    }
                    case 2:
                    {
                        type="forbidden_parking";
                        getListViolation();
                        break;
                    }
                    case 3:
                    {
                        type="handicap_parking";
                        getListViolation();
                        break;
                    }
                    case 4:
                    {
                        type="sidewalk_parking";
                        getListViolation();
                        break;
                    }
                    case 5:
                    {
                        type="unpaid_parking";
                        getListViolation();
                        break;
                    }
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                type = "double_parking";
                timeChoice = 0;
                getListViolation();
            }
        });
        //spinner to manage time selection
        spTimeChoice= (Spinner) findViewById(R.id.timeChoice);
        ArrayAdapter<CharSequence> adapter1 = ArrayAdapter.createFromResource(this,R.array.time_choice, android.R.layout.simple_spinner_item);
        adapter1.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spTimeChoice.setAdapter(adapter1);
        spTimeChoice.setOnItemSelectedListener(new OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                timeChoice=position;
                getListViolation();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                timeChoice=0;
                getListViolation();
            }
        });
        getListViolation();
    }

    /**
     * updatePlot:
     * the list of labels coming from firebase are sorted as strings , the list is sorted in numerical order and
     * the list of values is sorted corresponding the list of labels.
     * Then the chart is plotted with the data.
     */
    private void updatePlot() {
        bardataset = new BarDataSet(series, "Cells");
        BarData data = new BarData(legends, bardataset);
        barChart.setData(data); // set the data and list of labels into chart
        barChart.setDescription("");  // set the description
        bardataset.setColors(ColorTemplate.COLORFUL_COLORS);
        barChart.animateY(1000);
    }


    /**
     * getListViolation: request data from firestore collection "statistics".
     * as mentioned in the DD the database of statistic is structured as a Tree, so depending on the requested
     * stat the request has to go deep in the tree and get the values
     */
    private void getListViolation(){
        legends.clear(); //array di label
        series.clear();// array di value
        //go down the tree in the branch corresponding to the selected type and stopping at the depth corresponding to the selected time choice
        switch (timeChoice)
        {
            case 0: //ever
            {
                treeRef=db.collection("statistics").document(type).collection("year");
                break;
            }
            case 1: //year
            {
                treeRef=db.collection("statistics").document(type).collection("year").document(Integer.toString(Calendar.getInstance().get(Calendar.YEAR))).collection("month");
                break;
            }
            case 2: //month
            {
                treeRef=db.collection("statistics").document(type).collection("year").document(Integer.toString(Calendar.getInstance().get(Calendar.YEAR))).collection("month").document(Integer.toString((Calendar.getInstance().get(Calendar.MONTH)+1))).collection("day");
                break;
            }
        }
        //get data from firestore
        treeRef.get().addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
            @Override
            public void onComplete(@NonNull Task<QuerySnapshot> task) {
                if (task.isSuccessful()) {
                    int i=0;
                    for (QueryDocumentSnapshot document : task.getResult()) {
                        Log.d(TAG_INFO, document.getId() + " => " + document.getData());
                        //add values to list
                        series.add(new BarEntry((float)document.getLong("Violation_number").intValue(),i));
                        //label is the ID of the document
                        legends.add(document.getId());
                        i++;
                    }
                    //sorting series and legends
                    Collections.sort(series, new Comparator<BarEntry>(){

                        @Override
                        public int compare(BarEntry t1, BarEntry t2) {
                            return Integer.compare(Integer.parseInt(legends.get(series.indexOf(t1))),Integer.parseInt(legends.get(series.indexOf(t1))));
                        }
                    });
                    Collections.sort(legends, new Comparator<String>(){

                        @Override
                        public int compare(String t1, String t2) {
                            return Integer.compare(Integer.parseInt(t1),Integer.parseInt(t2));
                        }
                    });


                    //after data received update the chart
                    updatePlot();
                } else {
                    Log.d(TAG_ERROR, "Error getting documents: ", task.getException());
                }
            }
        });

    }

}

