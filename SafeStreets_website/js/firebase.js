/*

previous variables

let database = firebase.firestore();
var dbRefViol = database.collection("violations");
var dbRefStat = database.collection("statistics");
var dbRefAcc = database.collection("accidents");
var storage = firebase.storage();
var storeRef = storage.ref();
let violationList = [];
*/

var dbRefViol = database.ref("violations");
var dbRefStat = database.ref("statistics");
var dbRefAcc = database.ref("accidents");
var storeRef = storage.ref();



//handle the accident upload request
function onAddAccident(){

    var address;
    var date;
    var vehicles = [];
    var addressRef = document.getElementById("accidentAddress");
    var dateRef = document.getElementById("accidentDate");
    var vehicleInvolvedRef = document.getElementById("accidentCheckBox");

    //adding address
    address = addressRef.value;

    //adding date
    date = dateRef.value;

    //adding vehicles involved
    for(var i = 1; i < 5; ++i){

        if(vehicleInvolvedRef[i].checked){

            vehicles[i] = vehicleInvolvedRef[i].value;
        }
    }

    //upload accident to firebase
    if(address != null && date != null && vehicles != null){
        uploadAccident(address, date, vehicles);
    }else{

    //alert user to fill all the fields

    }

}

//upload accident on firebase accident reference
function uploadAccident(address, date, vehicles){

     // Accident entry.
      var accident = {
        address: address,
        date: date,
        vehicle1: vehicles[0],
        vehicle2: vehicles[1],
        vehicle3: vehicles[2],
        vehicle4: vehicles[3]
      };

      // Get a key for a new Accident.
      var newAccidentKey = dbRefAcc.push().key;

      // Write the new accident's data.
      var updates = {};
      updates['/accident/' + newAccidentKey] = Accident;

      return firebase.database().ref().update(updates);
}


function displayViolations(){

    var violationListRef = document.getElementById("listViolation");

    //getting all violations
    var violationList = getViolations();


    //appending each violation to html violation web page
    var i;
    for(i = 0; i < violationList.length; ++i){

        var tmp = document.getElementById("violationWrapper1");
        var violWrapper = tmp.cloneNode(true);

        //assigning new ID
        violWrapper.id = "violationWrapper" + (i + 2);


        //adding violation data to row
        violWrapperRow = violWrapper[0];

        violWrapperRow[0][0].innerHTML = violationList[i].address;
        violWrapperRow[1][0].innerHTML = violationList[i].date;
        violWrapperRow[2][0].innerHTML = violationList[i].licensePlate;
        violWrapperRow[3][0].innerHTML = violationList[i].type;


        //adding src for all the pictures
        var pictureHtmlRef = violWrapper[1][1];

        if(violationList[i].picture1 != null){

            pictureHtmlRef[0][0].src = violationList[i].picture1;
        }
        if(violationList[i].picture2 != null){

            pictureHtmlRef[1][0].src = violationList[i].picture2;
        }
        if(violationList[i].picture3 != null){

            pictureHtmlRef[2][0].src = violationList[i].picture3;
        }
        if(violationList[i].picture4 != null){

            pictureHtmlRef[3][0].src = violationList[i].picture4;
        }
        if(violationList[i].picture5 != null){

            pictureHtmlRef[4][0].src = violationList[i].picture5;
        }

        //adding violation data to displayInformation div
        var displayInformation = violWrapper[2];

        displayInformation[0][0].innerHTML = violationList[i].address;
        displayInformation[1][0].innerHTML = violationList[i].date;
        displayInformation[2][0].innerHTML = violationList[i].licensePlate;


        violationListRef[0].appendChild(viol);

    }

}

//get references to all violations
function getViolations(){

    var violationList = dbRefViol.on("value", getData, errData);

    return violationList;
}


//it returns all the violation keys
function getData(data){

    var violation = data.val();
    var keys = Object.keys(violation);

    return keys;
}

//handling violation error
function errData(err){
    console.log("Error Occurred:" + err);
}

/*
storeRef.child('violations_pic/v1.jpg').getDownloadURL().then(function(url) {
    console.log(url);
});

storeRef.child('violations_pic/').listAll().then(function(result){

    result.item.forEach(function(element){

        //creating a div with a unique ID for a violation
        var violationListRef = document.getElementById("list_violation");
        violationListRef.getElementsByClass("violationRow");


        //appending to the initial div
        document.getElementsByTagName('list_violation').appendChild(iDiv);
    })
});

dbRefStat.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
    });
});

storeRef.child('statistics/').listAll().then(function(result){
    result.item.forEach(function(element){
        console.log("ref:" + elem.toString());
    })
});

dbRefAcc.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
    });
});

storeRef.child('accidents/').listAll().then(function(result){
    result.item.forEach(function(element){
        console.log("ref:" + elem.toString());
    })
});
*/