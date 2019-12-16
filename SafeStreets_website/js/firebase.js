var database = firebase.firestore()
var dbRef= database.collection("violations");
dbRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
    });
});

var storage = firebase.storage()
var storeRef = storage.ref()
storeRef.child('violations_pic/v1.jpg').getDownloadURL().then(function(url) {
    console.log(url)
})

storeRef.child('violations_pic/').listAll().then(function(result){
    result.item.forEach(function(element){
        console.log("ref:" + elem.toString())
    })
})
