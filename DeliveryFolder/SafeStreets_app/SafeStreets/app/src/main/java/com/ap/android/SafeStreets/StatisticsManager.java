/**
 * StatisticManager class:
 * This class isn't and Android Activity, so it's not visible to the user
 * This class manages the computation of the statistics on the map.
 */


package com.ap.android.SafeStreets;

import android.util.Log;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.PolygonOptions;

import java.util.ArrayList;
import java.util.List;

public class StatisticsManager {

    //const to manage the unsafe areas, modify these parameters to change boundaries and number of zones
    final double MILANO_NORTH_OVEST_LAT = 45.509151;
    final double MILANO_NORTH_OVEST_LONG = 9.133125;
    final double MILANO_HEIGHT= 45.509151-45.433827;
    final double MILANO_WIDTH=9.237963-9.133125;
    final int NUMBER_SQUARE=5;
    //array of zones (Polygon)
    private List<Polygon> areas=new ArrayList<>();
    //array used to count accidents in zones and color them
    private int countAreas[]=new int[NUMBER_SQUARE*NUMBER_SQUARE];
    //array of color
    private int color[]={0xfff7a8a8,0xfff77474,0xfff55656,0xfff51d1d,0xffcc0202};

    /**
     * constructor
     */
    StatisticsManager()
    {
        Log.d("<===INFO===>","statistic manager created");
    }

    /**
     * unsafeArea: plot on the map NUMBER_SQUARE^2 squares coloring them with different gradiations based on number of accidents
     * @param map reference to google maps map
     * @param accidents list of accidents
     */
    public void unsafeArea(GoogleMap map,List<AccidentWrapper> accidents){

        //slacks variable: dimensions of a square
        double height_slack = MILANO_HEIGHT/NUMBER_SQUARE;
        double width_slack = MILANO_WIDTH/NUMBER_SQUARE;

        //see function countAreas()
        countAreas(accidents);

        //foreach square drow the polygon with the coordinates of the vertexes (loops incrementig the slacks)
        for(int i = 0; i < NUMBER_SQUARE; i++)
        {
            for (int j = 0; j < NUMBER_SQUARE; j++)
            {

                Polygon polygon = map.addPolygon(new PolygonOptions()
                        .clickable(true)
                        .add(
                                new LatLng(MILANO_NORTH_OVEST_LAT - i * height_slack, MILANO_NORTH_OVEST_LONG + j * width_slack),
                                new LatLng(MILANO_NORTH_OVEST_LAT - i * height_slack, MILANO_NORTH_OVEST_LONG + (j+1) * width_slack),
                                new LatLng(MILANO_NORTH_OVEST_LAT - (i+1) * height_slack, MILANO_NORTH_OVEST_LONG + (j+1) * width_slack),
                                new LatLng(MILANO_NORTH_OVEST_LAT - (i+1) * height_slack, MILANO_NORTH_OVEST_LONG + j * width_slack),
                                new LatLng(MILANO_NORTH_OVEST_LAT - i * height_slack, MILANO_NORTH_OVEST_LONG + j * width_slack)));
                areas.add(polygon);
                //in the array countAreas there are the index of the array color indicating the intensity of accidents in that zone
                areas.get(areas.size()-1).setFillColor(color[countAreas[(i+1)*(j+1)-1]]);
                areas.get(areas.size()-1).setStrokeColor(0xff000000);
                areas.get(areas.size()-1).setStrokeWidth(0.2f);
            }
        }
    }

    /**
     *countAreas: take a list of accidents, check if accidents are in the boundaries and compute the zones corresponding
     * to their coordinates, then divide each number of accidents of each zones by the max number and assign to each zone
     * a value indicating the intensity of the color to plot on the map
     * @param accs list of accidents
     */
    private void countAreas(List<AccidentWrapper> accs){
        //set the array to 0
        for(int i=0;i<NUMBER_SQUARE*NUMBER_SQUARE;i++)
            countAreas[i]=0;
        //check if the accidents are in the boundaries
        for(int i =0;i<accs.size();i++){
                int pos1 = (int) ((MILANO_NORTH_OVEST_LAT- accs.get(i).getLatitude()) / (MILANO_HEIGHT / NUMBER_SQUARE));
                int pos2 = (int) ((accs.get(i).getLongitude() - MILANO_NORTH_OVEST_LONG) / (MILANO_WIDTH / NUMBER_SQUARE));
                if((pos1>=0 && pos1<NUMBER_SQUARE)&&(pos2>=0 && pos2<NUMBER_SQUARE )) {
                    // countAreas is an array of length NUMBER_SQUARE^2, so to map the matrix of zones to the array
                    //the index mapping is M(i,j)=A[(i+1)*(j+1)-1]
                    countAreas[(pos1 + 1) * (pos2 + 1) - 1]++; //increments the number of accidents in that zones
                }
        }

        //see max()
        int max = max();

        //foreach zones maps the number of accidents to the index of color in the map (pink few accidents, red max accidents)
        for (int i=0;i<countAreas.length;i++)
        {
            if((((double)countAreas[i]/max)>=0) && (((double)countAreas[i]/max)<0.2))
                countAreas[i]=0;

            if((((double)countAreas[i]/max)>0.2) && (((double)countAreas[i]/max)<0.4))
                countAreas[i]=1;

            if((((double)countAreas[i]/max)>0.4) && (((double)countAreas[i]/max)<0.6))
                countAreas[i]=2;

            if((((double)countAreas[i]/max)>0.6) && (((double)countAreas[i]/max)<0.8))
                countAreas[i]=3;

            if((((double)countAreas[i]/max)>0.8) && (((double)countAreas[i]/max)<=1))
                countAreas[i]=4;
        }
    }

    /**
     *max: return the max value of the array, if the max is 0 return 1 to avoid division by 0
     */
    private int max(){
        int max = countAreas[0];
        for(int i = 0;i<countAreas.length;i++)
        {
            if(countAreas[i]>max)
                max=countAreas[i];
        }
        if(max==0)
            max=1;
        return max;
    }


    /**
     * mapViolation : plot all the violation in the map, setting as the lable the violation type
     * @param map reference to google maps map
     * @param violations list of violations
     */
    public void mapViolation(GoogleMap map,List<ViolationWrapper> violations)
    {
        for(int i = 0; i < violations.size(); i++)
        {
                map.addMarker(new MarkerOptions().position(new LatLng(violations.get(i).getLatitude(), violations.get(i).getLongitude())).title(violations.get(i).getType()));
        }
    }

}

