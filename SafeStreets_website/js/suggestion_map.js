//ref to firebase
var database = firebase.firestore();
//ref to suggestions collection
var dbRefS= database.collection("suggestions");
//list of suggestions
let suggestion_list=[];

//request to firebase firestore for the list of suggestions
dbRefS.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
        suggestion_list.push(new SuggestionWrapper(doc.id,doc.data().location,doc.data().type));
    });
    //at first loading shows all suggestions
    map3(["barrier","camera","police control"]);
});

//ref to button
let button31=document.getElementById("show_suggestions");
//when button clicked
button31.onclick=function(){
    var type=[];
    //read type chosen
    for(let i=1;i<4;i++){
        var check=document.getElementById('suggType'+i.toString());
        if(check.checked)
        {
            type.push(check.value);
        }
      }
      console.log(type);
//show map
map3(type);
google.maps.event.addDomListener(window, 'load', map3);
};

// coordinate center of Milan
let latitude=45.464043639236;
let longitude=9.191265106201174;

/** map3: plot on map a marker for each suggestion labelling with the type 
*@param typeS : suggestion type chosen by user
*/
function map3(typeS){
    var myLatlng = new google.maps.LatLng(latitude,longitude);
    var mapOptions = {
        zoom: 13,
        scrollwheel: true,
        center: myLatlng
    };
    //create map
    let map = new google.maps.Map(document.getElementById('suggestions-map'), mapOptions);
    if(suggestion_list.length>0)
    suggestion_list.forEach((elem)=>{
        console.log(typeS.includes(elem.getType()));
            if(typeS.includes(elem.getType()))
            {
            //create the marker
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(elem.getLatitude(),elem.getLongitude()),
                label: elem.getType(),
                map: map
            });
            //set the marker
            marker.setMap(map);
            }
    });

};