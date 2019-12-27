let button21= document.getElementById('a1');
let button22= document.getElementById('a2');
let div= document.getElementById('modifable');
let vis="appear";
let invis="disappear";

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
    map2();
    google.maps.event.addDomListener(window, 'load', map2);
};

    const MILANO_NORTH_OVEST_LAT = 45.509151;
    const MILANO_NORTH_OVEST_LONG = 9.133125;
    const MILANO_HEIGHT= 45.509151-45.433827;
    const MILANO_WIDTH=9.237963-9.133125;
    const NUMBER_SQUARE=5;
    let latitude=45.464043639236;
    let longitude=9.191265106201174;
    let colors=["#f7a8a8","#f77474","#f55656","#f51d1d","#cc0202"]
function map1(){
    var myLatlng = new google.maps.LatLng(latitude,longitude);
    var mapOptions = {
        zoom: 13,
        scrollwheel: false,
        center: myLatlng
    };
    let map = new google.maps.Map(document.getElementById('google-map'), mapOptions);
    /*var marker = new google.maps.Marker({
        position: myLatlng,
        map: map
    });*/
    //marker.setMap(map);

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
                fillColor: colors[i],
                fillOpacity: 0.35,
                map:map
              });
              poly.setMap(map)
        }
    }
};



function map2(){
    var myLatlng = new google.maps.LatLng(latitude,longitude);
    var mapOptions = {
        zoom: 13,
        scrollwheel: false,
        center: myLatlng
    };
    let map = new google.maps.Map(document.getElementById('google-map'), mapOptions);
    /*var marker = new google.maps.Marker({
        position: myLatlng,
        map: map
    });*/
    //marker.setMap(map);

};
