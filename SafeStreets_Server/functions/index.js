
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const increment = admin.firestore.FieldValue.increment(1);
admin.initializeApp();

//GLOBAL VARABLES
let db = admin.firestore();
let violations_list=["cycle_parking","double_parking","forbidden_parking","handicap_parking","sidewalk_parking","unpaid_parking"]
let years_list=[2018,2019,2020];
let veichles_type = ["Car","Byke","Motorbike","Truck"];
let suggestions_type = ["camera","barrier","police control"];
let offset = 1;
const api_key = "AIzaSyANNUNRD7gMAA3xgOW6GmD4HtqbOKlLHK4";
let accidentsToAdd = 50;
let violationsToAdd = 50;
let suggestionsToAdd = 20;
let Suggestion_threshold = 2;

//COORDINATES OF MILANO CITY
let lat_lowerBound=45.443;
let lat_upperBound=45.505;
let long_lowerBound=9.150;
let long_upperBound=9.230;

//EACH VIOLATION HAS A CORRESPONDING SUGGESTION
var suggestionsCorrespondings = {
    "cycle_parking": "barrier",
    "double_parking": "camera",
    "forbidden_parking": "police control",
    "handicap_parking": "camera",
    "sidewalk_parking": "barrier",
    "unpaid_parking": "police control"
}

//FUNCTION TO GET THE NUMBER OF DAYS IN A MONTH
function daysInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}

//FUNCTION TO CONVERT DATE AND TIME ACCORDING TO THE RIGHT TIME ZONE
function convertTimeZone(date){
    date.setHours(date.getHours()+offset);

    if(date.getHours()>=23)
        date.setDate(date.getDate()+1);

    if(date.getHours()>=23 && date.getDate===daysInMonth(date.getFullYear(),date.getMonth())){
        date.setDate(1);
        date.setMonth(date.getMonth()+1);
    }

    if(date.getHours()>=23 && date.getDate===daysInMonth(date.getFullYear(),date.getMonth()) && date.getMonth()===12){
        date.setDate(1);
        date.setMonth(1);
        date.setFullYear(date.getFullYear()+1);
    }
}

//FUNCTION TO ADD A NEW YEAR TO THE STATISTIC TREE
function addYear(newYear){

    for(var violation=0;violation<violations_list.length;violation++){
        db.collection("statistics").doc(violations_list[violation]).collection("year").doc(newYear.toString()).set({
            Violation_number: 0 })
        for(var month=1;month<13;month++){
            db.collection("statistics").doc(violations_list[violation]).collection("year").doc(newYear.toString()).collection("month").doc(month.toString()).set({
                Violation_number: 0 })
            for(var day=1;day<=daysInMonth(newYear,month);day++){
                db.collection("statistics").doc(violations_list[violation]).collection("year").doc(newYear.toString()).collection("month").doc(month.toString()).collection("day").doc(day.toString()).set({
                    Violation_number: 0 })
            }
        }
    }
}

//FUNCTION TO GENERATES RANDOM NUMBERS
function getRandomInRange(from, to, fixed) {
    var randomNumber = ((Math.random() * (to - from) + from).toFixed(fixed) * 1);
    return randomNumber;
}

//FUNCTION TO GENERATE RANDOM LICENSE PLATES
function randomPlate() { 
    var plate = "";

    plate += String.fromCharCode(getRandomInRange(65,90,0));
    plate += String.fromCharCode(getRandomInRange(65,90,0));
    plate += getRandomInRange(0,9,0).toString();
    plate += getRandomInRange(0,9,0).toString();
    plate += getRandomInRange(0,9,0).toString();
    plate += String.fromCharCode(getRandomInRange(65,90,0));
    plate += String.fromCharCode(getRandomInRange(65,90,0));

    return plate;
} 

//FUNCTION TO CONVERT COORDINATES INTO ADDRESS
function convertToStreet(latitude,longitude){

    var latlng = latitude.toString() + "," + longitude.toString();
    const url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlng +"&key=" + api_key;
    const request = new XMLHttpRequest();

    var promise = new Promise((resolve,reject) =>{
        request.open('GET', url);
        request.send();

        request.onload = function() {
            if (request.status === 200){ 
                resolve(JSON.parse(request.responseText));
            } else if (request.status <= 500){                     
                console.log("unable to geocode! Response code: " + request.status);
                var err = JSON.parse(request.responseText);
                console.log(err.status.message);
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

//FUNCTION TO CONVERT ADDRESS INTO COORDINATES
function convertToCoordinates(address){

    //address parsing
    var split=address.split(" ");
    var add="";
    add+="1";
    for(let k=0;k<split.length-1;k++)
      add+="+"+split[k];
    add+="+Milano";

    const url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + add +"&key=" + api_key;
    const request = new XMLHttpRequest();

    var promise = new Promise((resolve,reject) =>{
        request.open('GET', url);
        request.send();

        request.onload = function() {
            if (request.status === 200){ 
                var data = JSON.parse(request.responseText);
                var latitude = data.results[0].geometry.location.lat;
                var longitude = data.results[0].geometry.location.lng;
                resolve(new admin.firestore.GeoPoint(latitude,longitude));
            } else if (request.status <= 500){                     
                console.log("unable to geocode! Response code: " + request.status);
                var err = JSON.parse(request.responseText);
                console.log(err.status.message);
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

//FUNCTION THAT RETURNS, FOR A STREET, THE VIOLATION WHICH HAS THE GREATEST NUMBER OF OCCURENCES
function countViolationsType(ViolationsList){

    var typeNumber = {
        "cycle_parking": 0,
        "double_parking": 0,
        "forbidden_parking": 0,
        "handicap_parking": 0,
        "sidewalk_parking": 0,
        "unpaid_parking": 0
    }

    var maximum = {
        type: ViolationsList[0].type,
        number: typeNumber[ViolationsList[0].type]
    }

    for(var i=0;i<ViolationsList.length;i++){
        typeNumber[ViolationsList[i].type] = typeNumber[ViolationsList[i].type] + 1;
    }

    var types = Object.keys(typeNumber);

    types.forEach((type) =>{
        if(typeNumber[type]>maximum.number){
            maximum.number=typeNumber[type]
            maximum.type=type.toString();
        }
    })
    
    return maximum;
}

//FUNCTION TO GROUP OBJECTS ACCORDING TO A CERTAIN KEY
function groupBy(array, key) {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
        );
        return result;
    }, {});   
}

//FUNCTION TO GET CURRENT DATE AND TIME
exports.getDateTime = functions.https.onRequest((request, response) => {
    var date = new Date();
    convertTimeZone(date);
    return response.send(date);
});

//FUNCTION TO ADD RANDOM ACCIDENTS IN THE CLOUD STORAGE
exports.addRandomAccidents = functions.https.onRequest((request, response) => {

    var accidentsPos = [];
    for(var j=1;j<=accidentsToAdd;j++){
        accidentsPos.push({
            latitude: getRandomInRange(lat_lowerBound,lat_upperBound,16),
            longitude: getRandomInRange(long_lowerBound,long_upperBound,16)
        })
    }

    var accidentDate = [];
    for(var h=1;h<=accidentsToAdd;h++){
        randomYear = getRandomInRange(2018,2020,0);
        randomMonth = getRandomInRange(0,11,0);
        randomDay = getRandomInRange(1,daysInMonth(randomYear,randomMonth),0);
        accidentDate.push({
            year: randomYear,
            month: randomMonth,
            day: randomDay
        })
    }

    const rootRef = db.collection("accidents");
    for(var i=0;i<accidentsPos.length;i++){
        rootRef.add({
            address: 'Piazza Leonardo da Vinci',
            location: new admin.firestore.GeoPoint(accidentsPos[i].latitude, accidentsPos[i].longitude),
            date: new Date(accidentDate[i].year,accidentDate[i].month,accidentDate[i].day),
            vehicles: veichles_type[getRandomInRange(0,veichles_type.length-1,0)]
        })
    }
    return;
});

//FUNCTION TO ADD RANDOM VIOLATIONS IN THE CLOUD STORAGE
exports.addRandomViolations = functions.https.onRequest((request, response) => {

    var violationPos = [];
    for(var j=1;j<=violationsToAdd;j++){
        violationPos.push({
            latitude: getRandomInRange(lat_lowerBound,lat_upperBound,16),
            longitude: getRandomInRange(long_lowerBound,long_upperBound,16)
        })
    }

    var violationDate = [];
    for(var h=1;h<=violationsToAdd;h++){
        randomYear = getRandomInRange(2018,2020,0);
        randomMonth = getRandomInRange(0,11,0);
        randomDay = getRandomInRange(1,daysInMonth(randomYear,randomMonth),0);
        violationDate.push({
            year: randomYear,
            month: randomMonth,
            day: randomDay
        })
    }

    const rootRef = db.collection("violations");
    for(var i=0;i<violationPos.length;i++){
        rootRef.add({
            type: violations_list[getRandomInRange(0,violations_list.length-1,0)],
            date: new Date(violationDate[i].year,violationDate[i].month,violationDate[i].day),
            position: new admin.firestore.GeoPoint(violationPos[i].latitude,violationPos[i].longitude),
            address: "Piazza Leonardo Da Vinci",
            plate: randomPlate(),
            img1: "v1.png",
            img2: "v2.png",
            img3: "v3.png",
            img4: "v4.png",
            img5: "v5.png",
            imgT: "v6.png",
            validated: Boolean(getRandomInRange(0,1,0))
        })
    }
    return;
});

//FUNCTION TO ADD RANDOM SUGGESTIONS IN THE CLOUD STORAGE
exports.addRandomSuggestions = functions.https.onRequest((request, response) => {

    var suggestionPos = [];
    for(var j=1;j<=suggestionsToAdd;j++){
        suggestionPos.push({
            latitude: getRandomInRange(lat_lowerBound,lat_upperBound,16),
            longitude: getRandomInRange(long_lowerBound,long_upperBound,16)
        })
    }

    const rootRef = db.collection("suggestions");
    for(var i=0;i<suggestionPos.length;i++){
        rootRef.add({
            location: new admin.firestore.GeoPoint(suggestionPos[i].latitude, suggestionPos[i].longitude),
            type: suggestions_type[getRandomInRange(0,suggestions_type.length-1,0)]
        })
    }
    return;
});

//FUNCTION TO BUILT THE STATISTICS TREE
exports.buildStatisticsTree = functions.https.onRequest((request, response) => {

    for(let violation=0;violation<violations_list.length;violation++){
        db.collection("statistics").doc(violations_list[violation]).set({ 
            Violation_number: 0 })
        for(let year=0;year<years_list.length;year++){
            db.collection("statistics").doc(violations_list[violation]).collection("year").doc(years_list[year].toString()).set({
                Violation_number: 0 })
            for(let month=1;month<13;month++){
                db.collection("statistics").doc(violations_list[violation]).collection("year").doc(years_list[year].toString()).collection("month").doc(month.toString()).set({
                    Violation_number: 0 })
                for(let day=1;day<=daysInMonth(years_list[year],month);day++){
                    db.collection("statistics").doc(violations_list[violation]).collection("year").doc(years_list[year].toString()).collection("month").doc(month.toString()).collection("day").doc(day.toString()).set({
                        Violation_number: 0 })
                }
            }
        }
    }

});

//FUNCTION TO INITIALIZE THE STATISTICS TREE'S VALUES TO ZERO
exports.initializeTree = functions.https.onRequest((request, response) => {
    db.collection("statistics").listDocuments().then(Violations =>{
        return Violations.forEach(ViolationType =>{
            ViolationType.set({ Violation_number: 0 })
            ViolationType.collection("year").listDocuments().then(Years =>{
                return Years.forEach(Year =>{
                    Year.set({ Violation_number: 0 })
                    Year.collection("month").listDocuments().then(Months =>{
                        return Months.forEach(Month =>{
                            Month.set({ Violation_number: 0 })
                            Month.collection("day").listDocuments().then(Days =>{
                                return Days.forEach(Day =>{
                                    Day.set({ Violation_number: 0 })
                                })
                            }).catch(error => { console.log("Error initializing days",error) })
                        })
                    }).catch(error => { console.log("Error initializing months",error) })
                })
            }).catch(error => { console.log("Error initializing years",error) })
        })
    }).catch(error => { console.log("Error initializing ever",error) })
});

//FUNCTION TO COMPUTE STATISTICS ON ALL THE VALIDATED VIOLATIONS STORED INTO THE DATABASE
exports.computeStatisticsOnce = functions.https.onRequest((request, response) => {

    //FUNCTION TO GET ALL THE VALIDATED VIOLATIONS
    db.collection("violations").where("validated", "==", true).get().then(snapshot => {

        if(snapshot.length===0){
            console.log("There are no violations on which compute statistics!");
            return;
        }

        var validatedViolations = [];
        snapshot.forEach(doc => {
            validatedViolations.push({
                type: doc.data().type,
                date: doc.data().date.toDate()
            })
            convertTimeZone(validatedViolations[validatedViolations.length-1].date);
        })

        //FUNCTION TO CHECKS IF THE STATISTICS TREE HAS ALL THE NECESSARY YEARS, OTHERWISE IT ADDS THEM
        return db.collection("statistics").doc(violations_list[0]).collection("year").get().then(snap => {
            let yearsInTree = [];
            snap.forEach(doc => {
                yearsInTree.push(parseInt(doc.id));
            })
            for(var i=0;i<validatedViolations.length;i++){
                if(!yearsInTree.includes(validatedViolations[i].date.getFullYear())){
                    addYear(validatedViolations[i].date.getFullYear());
                }
            }

            //UPDATE THE STATISTIC TREE WITH NEW VALUES
            for(var j=0;j<validatedViolations.length;j++){

                var year = validatedViolations[j].date.getFullYear().toString();
                var month = (validatedViolations[j].date.getMonth()+1).toString();
                var day = validatedViolations[j].date.getDate().toString();
    
                const rootRef =  db.collection("statistics").doc(validatedViolations[j].type);
                    rootRef.update({ Violation_number: increment })
                const yearRef = rootRef.collection("year").doc(year);
                    yearRef.update({ Violation_number: increment })
                const monthRef = yearRef.collection("month").doc(month);
                    monthRef.update({ Violation_number: increment })
                const dayRef = monthRef.collection("day").doc(day);
                    dayRef.update({ Violation_number: increment })
                }
                return;

        }).catch(error => {console.log("Error Checking the statistics tree:",error) })
    }).catch(error => { console.log("Error getting the validated violations:",error) })
});

//FUNCTION TO COMPUTE STATISTICS DAILY
exports.computeStatisticsDaily = functions.pubsub.schedule('59 23 * * *').timeZone('Europe/Rome').onRun((context) => {

    var start = new Date();
    convertTimeZone(start);

    start.setHours(0,0,0,0);

    var end = new Date();
    end.setFullYear(start.getFullYear());
    end.setMonth(start.getMonth());
    end.setDate(start.getDate());
    end.setHours(23,59,0,0);
    
    //FUNCTION TO GET ALL THE VALIDATED VIOLATIONS
    db.collection("violations").where("validated", "==", true).where("date", ">=", start).where("date", "<=", end).get().then(snapshot => {

        if(snapshot.length===0){
            console.log("There are no violations on which to compute statistics");
            return;
        }
        
        var validatedViolationsDaily = [];
        snapshot.forEach(doc => {
            validatedViolationsDaily.push({
                type: doc.data().type,
                date: doc.data().date.toDate()
            })
            convertTimeZone(validatedViolationsDaily[validatedViolationsDaily.length-1].date);
        })

        //FUNCTION TO CHECKS IF CURRENT YEAR IS PRESENT IN THE STATISTC TREE
        return db.collection("statistics").doc(violations_list[0]).collection("year").get().then(snap => {
            let yearsInTree = [];
            snap.forEach(doc => {
                yearsInTree.push(parseInt(doc.id));
            })
            let currentDate = new Date();
            convertTimeZone(currentDate);
            let currentYear = currentDate.getFullYear();
            if(!yearsInTree.includes(currentYear))
                addYear(currentYear);

            //FUNCTION TO UPDATE VALUES OF THE STATISTICS TREE
            for(var i=0;i<validatedViolationsDaily.length;i++){

                var year = validatedViolationsDaily[i].date.getFullYear().toString();
                var month = (validatedViolationsDaily[i].date.getMonth()+1).toString();
                var day = validatedViolationsDaily[i].date.getDate().toString();
    
                const rootRef =  db.collection("statistics").doc(validatedViolationsDaily[i].type);
                    rootRef.update({ Violation_number: increment })
                const yearRef = rootRef.collection("year").doc(year);
                    yearRef.update({ Violation_number: increment })
                const monthRef = yearRef.collection("month").doc(month);
                    monthRef.update({ Violation_number: increment })
                const dayRef = monthRef.collection("day").doc(day);
                    dayRef.update({ Violation_number: increment })
            }
            return;
        }).catch(error =>{ console.log("Error checking years of the statistic tree:", error) })
    }).catch(error => { console.log("Error getting the validated violations:",error) })

});

//FUNCTION TO COMPUTE SUGGESTIONS'S STATISTICS ON ALL THE VALIDATED VIOLATIONS(ONCE A MONTH)
exports.computeSuggestions = functions.pubsub.schedule('00 00 1 * *').timeZone('Europe/Rome').onRun((context) => {

    var currentDate = new Date();
    convertTimeZone(currentDate);
    var start = new Date();
    var end = new Date();
    start.setDate(1);
    start.setHours(0,0,0,0);
    if(currentDate.getMonth() === 0){
        start.setFullYear(currentDate.getFullYear()-1);
        start.setMonth(11);
    }
    else{
        start.setFullYear(currentDate.getFullYear());
        start.setMonth(currentDate.getMonth()-1);
    }

    end.setFullYear(start.getFullYear());
    end.setMonth(start.getMonth());
    end.setDate(daysInMonth(start.getFullYear(),start.getMonth()+1));
    end.setHours(23,59,59,999);
        
    return db.collection("violations").where("validated", "==", true).where("date", ">=", start).where("date", "<=", end).get().then(snapshot => {

        if(snapshot.length===0){
            console.log("There are not any violations on which compute suggestions' statistics!");
            return;
        }
        
        var ViolationsSuggestions = [];
        snapshot.forEach(doc => {
            ViolationsSuggestions.push({
                type: doc.data().type,
                location: new admin.firestore.GeoPoint(doc.data().position.latitude,doc.data().position.longitude),
            })
        })

        var promise_list = [];
        for(var i=0;i<ViolationsSuggestions.length;i++){
            promise_list.push(
                convertToStreet(ViolationsSuggestions[i].location.latitude,ViolationsSuggestions[i].location.longitude)
            )
        }

        var streetViolations = [];
        Promise.all(promise_list).then(responses =>{
            var i=0;
            responses.forEach(res =>{
                streetViolations.push({
                    street: res.results[0].address_components[1].short_name,
                    type: ViolationsSuggestions[i].type
                })
                i++;
            })

            var groupedViolations = [];
            groupedViolations=groupBy(streetViolations,"street");

            var streets = Object.keys(groupedViolations);

            var suggestions = [];
            streets.forEach((street) =>{
                var maximum;
                maximum = countViolationsType(groupedViolations[street]);
                if(maximum.number>Suggestion_threshold){
                    suggestions.push({
                        address: street,
                        type: suggestionsCorrespondings[maximum.type]
                    })
                }
            })

            db.collection("suggestions").listDocuments().then(snap =>{
                snap.forEach(doc => {
                    doc.delete();
                })

                var promises = [];
                for(var j=0;j<suggestions.length;j++){
                    promises.push(
                        convertToCoordinates(suggestions[j].address)
                    )
                }

                return Promise.all(promises).then(coordinates => {
                    var h=0;
                    return coordinates.forEach(coordinate => {
                        db.collection("suggestions").add({ 
                            type: suggestions[h].type,
                            location: coordinate
                        })
                        h++;
                    })
                }).catch(error => {console.log(error) })
            }).catch(error => {console.log(error)});
        
        return;

        }).catch(error => {console.log("Error geocoding the validated violations:",error) })

        return;

    }).catch(error => { console.log("Error getting the validated violations:",error) })

});