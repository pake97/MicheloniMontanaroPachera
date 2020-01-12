/**
 * uploadAccident.js
 * This module manages all the logic behind the "Accidents" section of the website.
 * It has a function to manage the logic of the "Add accident" button.
 * A function to manage the integration with "google geocoding API" used to convert an address into the corresponding coordinates.
 * A function to parse the accident's address in a correct way in order to limit the possibility of geocoding's errors.
 * A function to upload the accident's infromation into the database.
 */
var submitAccident=document.getElementById("sub");
let types=['Car','Bike','Truck','Motorbike'];
const apikey = 'AIzaSyAQq-BV7RKiSgpmneqR0LHuaTmse-SkRJs';

/**
 * submitAccident.onclick: This function catches the clicked event of the "Add accident" button. 
 * It calls the function to geocode the address of the accident.
 * Finally it calls the function to upload the accident in the storage.
 * @param date: variable holding the date of the accident.
 * @param address: variable holding the address of the accident.
 * @param type: variable holding the vehicles' type involved in the accident.
 * @param latitude: variable holding the latitude of the accident.
 * @param longitude: variable holding the longitude of the accident.
 */
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


/**
 * getPoint(address): this function sends a request to the google geocoding API containing the address to geocode.
 * @param request_url: variable holding the https request of the geocoding API.
 * @param request: variable holding an XMLHttpRequest object.
 * @param promise: variable holding the promise of getting the geocoded address.
 * @return promise: the function returns the promise of getting the geocoded address.
 */
function getPoint(address){
  address = parseAddress(address);
  console.log(address);
    var request_url = "https://maps.googleapis.com/maps/api/geocode/json?address="+ address + "&key="+apikey;

    const request = new XMLHttpRequest();

    var promise = new Promise((resolve,reject) => {

      request.open('GET',request_url);
      request.send();
    
      request.onload = function() {
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

/**
 * uploadAccident(date, address,location, typeV): this function takes as input the information on the accident to add 
 * and manages the upload of the accident into the datatabase.
 * @param dbAcRef: reference to the "accidents" collection of the database.
 * @param data: variable holding information on the accident to upload.
 */
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


/**
 * parseAddredd(address): It parse the accident address in a correct way, in order to make it compatible with 
 * the request to google geocoding API.
 * @param split: list holding address components splitted by spaces.
 * @param add: variable holding the parsed address
 * @return add: the function returns the parsed address.
 */
function parseAddress(address){
  address = address.replace(",","");
  var split=address.split(" ");
  let add="";
  add+=split[split.length-1];
  for(let k=0;k<split.length-1;k++)
      add+="+"+split[k];
  add+="+Milano";
  return add;
}