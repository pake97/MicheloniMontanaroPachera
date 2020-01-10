
var submitAccident=document.getElementById("sub");
let types=['Car','Bike','Truck','Motorbike'];
const apikey = 'AIzaSyAQq-BV7RKiSgpmneqR0LHuaTmse-SkRJs';



submitAccident.onclick=function(){
  var date = document.getElementById("dateId").value;

  let address = document.getElementById("addressId").value;

  var type="";
  for(let i=1;i<5;i++){
    if(document.getElementById('vehicle'+i.toString()).checked)
    {
        type+=types[i-1]+" ";
    }
  }

  getPoint(address).then(response =>{
    var latitude = response.results[0].geometry.location.lat;
    var longitude = response.results[0].geometry.location.lng;
    uploadAccident(date,address,new firebase.firestore.GeoPoint(latitude,longitude),type);
    return console.log(latitude,longitude);
  }).catch(error => {console.log("Error converting address into coordinates:",error) });
 
  
};



function getPoint(address){
  address = parseAddress(address);
  console.log(address);
    var request_url = "https://maps.googleapis.com/maps/api/geocode/json?address="+ address + "&key="+apikey;

    const request = new XMLHttpRequest();

    var promise = new Promise((resolve,reject) => {

      request.open('GET',request_url);
      request.send();
    
      request.onload = function() {
        console.log("porcodio");
        if (request.status == 200){ 
          resolve(JSON.parse(request.responseText));
       } else if (request.status <= 500){                    
          console.log("unable to geocode! Response code: " + request.status);
          var data = JSON.parse(request.responseText);
          console.log(data.status.message);
        } else {
          console.log("server error");
        }

      };
    
      request.onerror = function() {
        console.log("unable to connect to Google Geocoding API server");        
      };

    })

    return promise;
}

//upload accident on the database
function uploadAccident(date, address,location, typeV){
  var dbAcRef = firebase.firestore().collection("accidents");
    let data = {
      address : address,
      location: location,
      date : new Date(date),
      vehicles : typeV,
    };

    
    dbAcRef.add(data);
}


//parse address in a correct way
function parseAddress(address){
  console.log(address);
  address = address.replace(",","");
  console.log(address);
  var split=address.split(" ");
  let temp="";
  temp+=split[split.length-1];
  for(let k=0;k<split.length-1;k++)
      temp+="+"+split[k];
  temp+="+Milano";

  return temp;
}