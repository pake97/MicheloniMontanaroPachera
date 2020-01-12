const MILANO_NORTH_OVEST_LAT = 45.509151;
const MILANO_NORTH_OVEST_LONG = 9.133125;
const MILANO_HEIGHT= 45.509151-45.433827;
const MILANO_WIDTH=9.237963-9.133125;
const NUMBER_SQUARE=5;
var database = firebase.firestore();
var dbRefA= database.collection("accidents");
var dbRefV= database.collection("violations").where("validated","==",true);
let accident_list=[];
let viol_list=[];
let color_zones = [];
let violationFilter;
let timeFilter;
let violationType = "All types";
let violationTime = "Ever";
let button21 = document.getElementById('a1');
let button22 = document.getElementById('a2');
let button23 = document.getElementById('a3');
let div = document.getElementById('modifable');
let vis ="appear";
let invis ="disappear";
let latitude=45.464043639236;
let longitude=9.191265106201174;
let colors=["#f7a8a8","#f77474","#f55656","#f51d1d","#cc0202"];
let year = 0;
let month = 0;
let week = 0;
let viooo = 0;


dbRefA.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        accident_list.push(new Accident(doc.id,doc.data().location,doc.data().vehicles));
    });
    map1();
});

dbRefV.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        viol_list.push(new ViolationWrapper(doc.id,doc.data().position,doc.data().type,doc.data().date.toMillis()));
        viooo++;
    });
});

button21.onclick=function(){
    if(button21.className!=classA)
    {
        button21.className=classA;
        button22.className=classI;
        div.className=invis;
    }
    map1();
    google.maps.event.addDomListener(window, 'load', map1);
};

button22.onclick=function(){
    if(button22.className!=classA)
    {
        button22.className=classA;
        button21.className=classI;
        div.className=vis;
    }
    console.log(violationType,violationTime);
    map2(violationType,violationTime);
    google.maps.event.addDomListener(window, 'load', map2);
};

button23.onclick=function(){

    violationFilter = document.getElementById("type_filter");
    violationType = mapping(violationFilter.options[violationFilter.selectedIndex].text);

    timeFilter = document.getElementById("time_filter");
    violationTime = timeFilter.options[timeFilter.selectedIndex].text;

    map2(violationType,violationTime);
    google.maps.event.addDomListener(window, 'load', map2);
};

function map1(){
    computezones();
    var myLatlng = new google.maps.LatLng(latitude,longitude);
    var mapOptions = {
        zoom: 13,
        scrollwheel: false,
        center: myLatlng
    };
    let map = new google.maps.Map(document.getElementById('google-map'), mapOptions);

    let height_slack = MILANO_HEIGHT/NUMBER_SQUARE;
    let width_slack = MILANO_WIDTH/NUMBER_SQUARE;

    for(var i = 0; i < NUMBER_SQUARE; i++)
    {
        for (var j = 0; j < NUMBER_SQUARE; j++)
        {
            var polygonCoords = [
                {lat: MILANO_NORTH_OVEST_LAT - i * height_slack, lng: MILANO_NORTH_OVEST_LONG + j * width_slack},
                {lat: MILANO_NORTH_OVEST_LAT - i * height_slack, lng: MILANO_NORTH_OVEST_LONG + (j+1) * width_slack},
                {lat: MILANO_NORTH_OVEST_LAT - (i+1) * height_slack, lng: MILANO_NORTH_OVEST_LONG + (j+1) * width_slack},
                {lat: MILANO_NORTH_OVEST_LAT - (i+1) * height_slack, lng: MILANO_NORTH_OVEST_LONG + j * width_slack},
                {lat: MILANO_NORTH_OVEST_LAT - i * height_slack, lng: MILANO_NORTH_OVEST_LONG + j * width_slack},
              ];
              var poly = new google.maps.Polygon({
                paths: polygonCoords,
                strokeColor: '#000000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: colors[color_zones[(i+1)*(j+1)-1]],
                fillOpacity: 0.35,
                map:map
              });
              poly.setMap(map)
        }
    }
};



function map2(violationType,violationTime){
    var myLatlng = new google.maps.LatLng(latitude,longitude);
    var mapOptions = {
        zoom: 13,
        scrollwheel: false,
        center: myLatlng
    };
    let map = new google.maps.Map(document.getElementById('google-map'), mapOptions);
    viol_list.forEach((elem)=>{
        if(compareType(elem, violationType) && compareDate(elem,violationTime) ){
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(elem.getLatitude(),elem.getLongitude()),
            label: elem.getType(),
            map: map
        });
        marker.setMap(map);
        }
    });

};

function computezones(){
    let zones = [];
    for(var i=0;i<NUMBER_SQUARE*NUMBER_SQUARE;i++){
        zones.push(0);
        color_zones.push(0);
    }
    accident_list.forEach((elem)=>{
        var pos1 = Math.round((MILANO_NORTH_OVEST_LAT- elem.getLatitude()) / (MILANO_HEIGHT / NUMBER_SQUARE));
        var pos2 = Math.round((elem.getLongitude() - MILANO_NORTH_OVEST_LONG) / (MILANO_WIDTH / NUMBER_SQUARE));
            if((pos1>=0 && pos1<NUMBER_SQUARE)&&(pos2>=0 && pos2<NUMBER_SQUARE )){
                index = ((pos1 + 1) * (pos2 + 1) -1);
                zones[index]++;
            }
    });
    var max = maxZ(zones);
    if(max!=0)
        for (var i=0;i<zones.length;i++)
        {
            if(zones[i]/max>=0 && zones[i]/max<0.2)
                color_zones[i]=0;

            if(zones[i]/max>=0.2 && zones[i]/max<0.4)
                color_zones[i]=1;

            if(zones[i]/max>=0.4 && zones[i]/max<0.6)
                color_zones[i]=2;

            if(zones[i]/max>=0.6 && zones[i]/max<0.8)
                color_zones[i]=3;

            if(zones[i]/max>=0.8 && zones[i]/max<=1)
                color_zones[i]=4;
        }
};


function maxZ(zones){
    var max = zones[0];
    for(var i = 0;i<zones.length;i++){
        if(zones[i]>max)
            max=zones[i];
        console.log(zones[i]);
    }
    return max;
};

function compareDate(elem, violationTime){
    let ret = false;
    var violationDate = elem.getDate();
    var requestedDate = new Date(); 
    
    if(violationTime == ("Year")){
        requestedDate.setFullYear(requestedDate.getFullYear() - 1);
    }
    if(violationTime == ("Month")){
        requestedDate.setMonth(requestedDate.getMonth() - 1);
    }
    if(violationTime == ("Week")){
        requestedDate.setDate(requestedDate.getDate() - 7);
    }

    
    if(violationTime == ("Ever") || violationDate.getTime() >= requestedDate.getTime()){

        if(violationTime == "Year"){
            ++year;
        }
        if(violationTime == "Month"){
            ++month;
        }
        if(violationTime == "Week"){
            ++week;
        }
     
        ret = true;
    }

    return ret;
};

function compareType(elem, violationType){
    let ret = false;

    if(violationType == ("All types") || violationType == (elem.getType())){
        ret = true;
    }
    
    return ret;
};

function mapping(type){
    let ret = "All types";
    if(type == ("Double parking")){
        ret = "double_parking";    
    }
    if(type == ("Park on handicap")){
        ret = "handicap_parking";    
    }
    if(type == ("Park on cycle-lane")){
        ret = "cycle_parking";    
    }
    if(type == ("Park on sidewalk")){
        ret = "sidewalk_parking";    
    }
    if(type == ("Unpaid park")){
        ret = "unpaid_parking";    
    }
    if(type == ("Forbidden park")){
        ret = "forbidden_parking";    
    }

    return ret;
};
