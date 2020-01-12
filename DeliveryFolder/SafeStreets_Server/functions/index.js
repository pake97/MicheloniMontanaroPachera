/**
 * index.js
 * This module contains all the functions and the main logic features of the application's server:
 * A function to return current date and time.
 * A function to add random accidents in the cloud storage.
 * A function to add random violations in the cloud storage.
 * A function to add random suggestions in the cloud storage.
 * A function to build an empty statistics' tree in the cloud storage.
 * A function to initialize all the statistics' tree's nodes to zero.
 * A function to compute all the statistics(based on all the validated violations) and update the statistics' tree with the new values.
 * A function to compute daily statistics(based on daily validated violations).
 * A function to compute monthly suggestions(based on monthly validated violations).
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const increment = admin.firestore.FieldValue.increment(1);
admin.initializeApp();

//global variables
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

//coordinates of Milano city
let lat_lowerBound=45.443;
let lat_upperBound=45.505;
let long_lowerBound=9.150;
let long_upperBound=9.230;

//each violation's type has a corresponding suggestion.
var suggestionsCorrespondings = {
    "cycle_parking": "barrier",
    "double_parking": "camera",
    "forbidden_parking": "police control",
    "handicap_parking": "camera",
    "sidewalk_parking": "barrier",
    "unpaid_parking": "police control"
}

/**
 * daysInMonth(year, month): this function take as input an year and a month and returns the number of days in that month.
 * @return: number of days in the month.
 */
function daysInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}

/**
 * convertTimeZone(date): this function convert a date's timestamp according to the right timezone.
 */
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

/**
 * addYear(newYear): this function adds a new "year" brach to the statistics tree.
 */
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

/**
 * getRandomInRange(from, to, fixed): this function generates random numbers.
 * @param randomNumber: variable holding the random number generated.
 * @return the random number generated.
 */
function getRandomInRange(from, to, fixed) {
    var randomNumber = ((Math.random() * (to - from) + from).toFixed(fixed) * 1);
    return randomNumber;
}

/**
 * randomPlate(): this function generates random license plate numbers by calling the getRandomInRange() function.
 * @param plate: variable holding the random license plate number.
 * @return: random license plate number.
 */
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

/**
 * convertToStreet(latitude,longitude): this function takes as input some coordinates and convert them into
 * the corresponding address by sending a request to the google geocoding API.
 * @param latlng: variable holding parsed coordinates according to the https request structure.
 * @param url: variable holding the https request for google geocoding API.
 * @param request: variable holding the XMLHttpRequest() object.
 * @param promise: variable holding the promise of getting the address from google geocoding API.
 * @return: the function returns the promise of getting the address from google geocoding API.
 */
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

/**
 * convertToCoordinates(address): this function takes as input an address and convert it into the corresponding
 * coordinates using google Geocoding API.
 * @param split: list holding variable's components splitted in correspondence of spaces.
 * @param add: variable holding parsed addres according to the https request structure.
 * @param url: variable holding the https request for goggole geocoding API.
 * @param request: variable holding the XMLHttpRequest() object.
 * @param promise: variable holding the promise of getting the address from google geocoding API.
 * @param data: variable holding the data returned by google geocoding API.
 * @param latitude: variable holding the latitude returend by google geocoding API.
 * @param longitude: variable holding the longitude returend by google geocoding API.
 * @return: the function returns the promise of getting the coordinates from google geocoding API.
 */
function convertToCoordinates(address){
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

/**
 * countViolationsType(ViolationsList): This function returns, for a list of violations grouped by street, 
 * the violation type which has the gretest number of occurrences.
 * @param typeNumber: dictionary holding the number of occurrences of each violation's type.
 * @param maximum: dictionary holding violation's type and the number of occurences of the violation which
 *                 appears most times.
 * @param types: variable holding the keys values of the typeNumber dictionaries.
 * @return: the function returns the violation type which has the gretest number of occurrences and the number itself.
 */
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

/**
 * groupBy(array, key): given a dictionary and a key, this function group it according to the same key values.
 * @return a new dictionary grouped by the same key values.
 */
function groupBy(array, key) {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
        );
        return result;
    }, {});   
}

/**
 * getDateTime: This function is activated through an https request and returns the current date and time.
 * @param date: variable holding the current date.
 * @return: the function returns an https response containing the current date and time.
 */
exports.getDateTime = functions.https.onRequest((request, response) => {
    var date = new Date();
    convertTimeZone(date);
    return response.send(date);
});

/**
 * addRandomAccidents: This function is activated through an https request and adds some random accidents into
 * the cloud storage.
 * @param accidentsPos: list holding all the accidents' position.
 * @param accidentDate: list holding all the accidents' date.
 * @param rootRef: variable holding the reference to the "accidents" collection of the cloud storage.
 */
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

/**
 * addRandomViolations: This function is activated through an https request and adds some random violations into
 * the cloud storage.
 * @param violationPos: list holding all the violations' position.
 * @param violationDate: list holding all the violations' date.
 * @param rootRef: variable holding the reference to the "violations" collection of the cloud storage.
 */
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

/**
 * addRandomSuggestions: This function is activated through an https request and adds some random suggestions into
 * the cloud storage.
 * @param suggestionPos: list holding all the suggestions' position.
 * @param rootRef: variable holding the reference to the "suggestions" collection of the cloud storage.
 */
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

/**
 * buildStatisticsTree: This function is activated through an https request and 
 * builds an statistics' tree in the cloud storage with all the values set to zero.
 * @param Violation_number: nodes' values representing the number of violations with the node's time granularity.
 */
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

/**
 * initializeTree: This function is activated through an https request and 
 * initialize the statistics tree by setting all its nodes' values to zero.
 * @param Violation_number: nodes' values representing the number of violations with the node's time granularity.
 */
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

/**
 * computeStatisticsOnce:  This function is activated through an https request and computes the statistics with all the
 * validated violations of the cloud storage.
 * @param validatedViolations: list holding all the validated violations of the cloud storage.
 * @param yearsInTree: list holding all the years' branches values of the statistics tree.
 * @param year: variable holding the year of the ith violation.
 * @param month: variable holding the month of the ith violation.
 * @param day: variable holding the day of the ith violation.
 * @param rootRef: variable holding the reference to the "violation_type" collection of statistics' tree in the cloud storage.
 * @param yearRef: variable holding the reference to the "year" collection of statistics' tree in the cloud storage.
 * @param monthRef: variable holding the reference to the "month" collection of statistics' tree in the cloud storage.
 * @param dayRef: variable holding the reference to the "day" collection of statistics' tree in the cloud storage.
 */
exports.computeStatisticsOnce = functions.https.onRequest((request, response) => {

    //function to get all the validated violations
    db.collection("violations").where("validated", "==", true).get().then(snapshot => {

        if(snapshot.length===0){
            console.log("There are no violations on which compute statistics!");
            return;
        }

        var validatedViolations = [];
        snapshot.forEach(doc => {
            if(violations_list.includes(doc.data().type)){
                validatedViolations.push({
                    type: doc.data().type,
                    date: doc.data().date.toDate()
                })
                convertTimeZone(validatedViolations[validatedViolations.length-1].date);
            }
        })

        //function to checks if the statistics tree has all the necessary years' branches, otherwise it adds them.
        return db.collection("statistics").doc(violations_list[0]).collection("year").get().then(snap => {
            let yearsInTree = [];
            snap.forEach(doc => {
                yearsInTree.push(parseInt(doc.id));
            })
            for(var i=0;i<validatedViolations.length;i++){
                if(!yearsInTree.includes(validatedViolations[i].date.getFullYear())){
                    addYear(validatedViolations[i].date.getFullYear());
                    yearsInTree.push(validatedViolations[i].date.getFullYear());
                }
            }


            //update the statistics tree with the new values
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

/**
 * computeStatisticsDaily:  This function is automatically activated once a day(at 23:59) to compute the daily statistics with all the
 * daily validated violations of the cloud storage.
 * @param start: variable holding the today's date with a 00:00 timestamp.
 * @param end: variable holding the today's date with a 23:59 timestamp.
 * @param validatedViolationsDaily: list holding all the daily validated violations of the cloud storage.
 * @param yearsInTree: list holding all the years' branches values of the statistics tree.
 * @param year: variable holding the year of the ith violation.
 * @param month: variable holding the month of the ith violation.
 * @param day: variable holding the day of the ith violation.
 * @param rootRef: variable holding the reference to the "violation_type" collection of statistics tree in the cloud storage.
 * @param yearRef: variable holding the reference to the "year" collection of statistics tree in the cloud storage.
 * @param monthRef: variable holding the reference to the "month" collection of statistics tree in the cloud storage.
 * @param dayRef: variable holding the reference to the "day" collection of statistics tree in the cloud storage.
 */
exports.computeStatisticsDaily = functions.pubsub.schedule('59 23 * * *').timeZone('Europe/Rome').onRun((context) => {

    var start = new Date();
    convertTimeZone(start);

    start.setHours(0,0,0,0);

    var end = new Date();
    end.setFullYear(start.getFullYear());
    end.setMonth(start.getMonth());
    end.setDate(start.getDate());
    end.setHours(23,59,0,0);
    
    //function to get all the daily validated violations.
    db.collection("violations").where("validated", "==", true).where("date", ">=", start).where("date", "<=", end).get().then(snapshot => {

        if(snapshot.length===0){
            console.log("There are no violations on which to compute statistics");
            return;
        }
        
        var validatedViolationsDaily = [];
        snapshot.forEach(doc => {
            if(violations_list.includes(doc.data().type)){
                validatedViolationsDaily.push({
                    type: doc.data().type,
                    date: doc.data().date.toDate()
                })
                convertTimeZone(validatedViolationsDaily[validatedViolationsDaily.length-1].date);
            }
        })

        //function to checks if the statistics tree has the current year branch, otherwise it adds it.
        return db.collection("statistics").doc(violations_list[0]).collection("year").get().then(snap => {
            let yearsInTree = [];
            snap.forEach(doc => {
                yearsInTree.push(parseInt(doc.id));
            })
            let currentDate = new Date();
            convertTimeZone(currentDate);
            let currentYear = currentDate.getFullYear();
            if(!yearsInTree.includes(currentYear)){
                addYear(currentYear);
                yearsInTree.push(currentYear);
            }

            //update the statistics tree with the new values
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

/**
 * computeSuggestions:  This function is automatically activated once a month(the fist day of the month at 00:00) to compute 
 * monthly suggestions on all the monthly validated violations of the cloud storage.
 * @param currentDate: variable holding the today's date.
 * @param start: variable holding the first day of the current month's date.
 * @param end: variable holding the last day of the current month's date.
 * @param ViolationsSuggestions: list holding all the monthly validated violations of the cloud storage.
 * @param promise_list: list holding all the promises to convert the violations's coordinates
 *                      into the corresponding address using Google geocoding API.
 * @param streetViolations: list of dictionaries holding type and address of all the violation's returned by Google geocoding API.
 * @param groupedViolations: list of dictionaries of all the violations grouped by the same street.
 * @param street: list holding all the key values of the groupedViolations dictionary.
 * @param suggestions: list of dictionaries holding all the suggestions to upload in the cloud storage.
 * @param maximum: dictionary holding the type and the number of occurrences of the violation that appears most times
 *                 on a certain street.
 * @param promise: list holding all the promises to convert an address into the corresponding coordinates using google geocoding API.
 */
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
            if(violations_list.includes(doc.data().type)){
                ViolationsSuggestions.push({
                    type: doc.data().type,
                    location: new admin.firestore.GeoPoint(doc.data().position.latitude,doc.data().position.longitude),
                })
            }
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