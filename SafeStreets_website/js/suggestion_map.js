var database = firebase.firestore();
var dbRefS= database.collection("suggestions");
let suggestion_list=[];

dbRefS.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
        suggestion_list.push(new SuggestionWrapper(doc.id,doc.data().location,doc.data().type));
    });
    map3(["barrier","camera","police control"]);
});

let button31=document.getElementById("show_suggestions");
button31.onclick=function(){
    var type=[];
    for(let i=1;i<4;i++){
        var check=document.getElementById('suggType'+i.toString());
        if(check.checked)
        {
            type.push(check.value);
        }
      }
      console.log(type);
map3(type);
google.maps.event.addDomListener(window, 'load', map3);
};

    
let latitude=45.464043639236;
let longitude=9.191265106201174;

function map3(typeS){
    var myLatlng = new google.maps.LatLng(latitude,longitude);
    var mapOptions = {
        zoom: 13,
        scrollwheel: true,
        center: myLatlng
    };
    let map = new google.maps.Map(document.getElementById('suggestions-map'), mapOptions);
    if(suggestion_list.length>0)
    suggestion_list.forEach((elem)=>{
        console.log(typeS.includes(elem.getType()));
            if(typeS.includes(elem.getType()))
            {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(elem.getLatitude(),elem.getLongitude()),
                label: elem.getType(),
                map: map
            });
            marker.setMap(map);
            }
    });
    

};


