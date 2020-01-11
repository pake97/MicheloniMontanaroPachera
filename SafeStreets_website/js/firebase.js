/**
 * firebase.js
 * This module manages the logic and the UI of the violations section of the page
 * UI: there is a function to draw a container for each violation to display
 * LOGIC: There is a function to query the database in order to get all the violations not validated yet.
 *        A function to delete the selected violation from the database.
 *        A function to validate a violation and eventually modify it.
 *        A function to handle the logic of the buttons of each violation container.
 */

var database = firebase.firestore();
var dbRef= database.collection("violations").where("validated","==",false);
let body = document.getElementsByClassName("container")[1];
var i=0;
let heights=[600,500,400,300,250,200];
let list = [];

/**
 * dbRef.get(): this function queries the database in order to get the list of violations not validated yet. 
 *              for each violation's image it calls a function to retreive the corresponding url from the cloud storage.
 *              Then it calls the function to construct the container to hold it on the page.
 * @param listPic:  list holding the urls of the images of each violation
 * @param list_promises: list holding the promises returned from the function to retrieve the url of the images.
 */
dbRef.get().then((querySnapshot) => {

    querySnapshot.forEach((doc) => {
        var listPic=[];
        var list_promise = [];
        list_promise.push(
            getImgUrl(doc.data().img1)
        )
        if(doc.data().img2!=null){
            list_promise.push(
                getImgUrl(doc.data().img2)
            )
        }
        if(doc.data().img3!=null){
            list_promise.push(
                getImgUrl(doc.data().img3)
            )
        }
        if(doc.data().img4!=null){
            list_promise.push(
                getImgUrl(doc.data().img4)
            )
        }
        if(doc.data().img5!=null){
            list_promise.push(
                getImgUrl(doc.data().img5)
            )
        }
        if(doc.data().imgT!=null){
            list_promise.push(
                getImgUrl(doc.data().imgT)
            )
        }

        Promise.all(list_promise).then(urls =>{
            urls.forEach(url =>{
                listPic.push(url);
            })
            createDiv(new Violation(doc.id,doc.data().address,doc.data().date,doc.data().type,doc.data().plate,listPic,listPic.length));
        }).catch(error => console.log("Error getting violation images:",error))
    });
});

/**
 * getImgUrl(imgName): this function takes ad imput the name of an image and returns its ulr from the cloud storage
 * @param storeRef: reference to the cloud storage
 * @param peomise: a promise to hold the request of getting image's url from the storage
 * @return promise: the function returns the promise.
 */
function getImgUrl(imgName){
    imgName = imgName.split("/")[imgName.split("/").length-1];
    var storeRef= firebase.storage().ref();
    var promise = new Promise((resolve,reject)=>{
        resolve(storeRef.child(imgName).getDownloadURL());
    })

    return promise;
}

/**
 * createDiv(doc): this function manages the creation of the container to hold the violation in the page.
 *                 Then it calls the function to to handle the logic of its buttons.
 * @params div: a set of div to construct the container to hold violations.
 */
function createDiv(doc){

    newdiv = document.createElement('div');  
    newdiv.id = 'newid'+i.toString();
    newdiv.className="violationwrapper";
    body.appendChild(newdiv); 

    div2=document.createElement('div');
    div2.id='row'+i.toString();
    div2.className="violationRow";
    newdiv.appendChild(div2);

    div3=document.createElement('div');
    div3.innerHTML = doc.getAddress();
    div3.setAttribute("style","width: 30%; height: 25px; float: left;");
    div2.appendChild(div3);
    
    div4=document.createElement('div');
    div4.innerHTML = doc.getDate().toDate().toString();
    div4.setAttribute("style","width: 25%; height: 25px; float: left;");
    div2.appendChild(div4);

    div5=document.createElement('div');
    div5.innerHTML = doc.getLicensePlate();
    div5.setAttribute("style","width: 15%; height: 25px; float: left;");
    div2.appendChild(div5);

    div6=document.createElement('div');
    div6.innerHTML = doc.getType();
    div6.setAttribute("style","width: 20%; height: 25px; float: left;");
    div2.appendChild(div6);

    div7=document.createElement('div');
    div7.setAttribute("style","width: 10%; height: 25px; float: left;");
    div2.appendChild(div7);

    button = document.createElement('button');
    button.id="see"+i.toString();
    button.className="buttonsee class inactive";
    button.innerHTML="see";
    div7.appendChild(button);
    
    div8=document.createElement('div');
    div8.id="hidden"+i.toString();
    div8.className="hidden_vi";
    newdiv.appendChild(div8);

    div9=document.createElement('div');
    div9.setAttribute("style","width: 100%; height:25px; display: inline-block;");
    div8.appendChild(div9);

    div10=document.createElement('div');
    div10.setAttribute("style","width: 90%; float: left;");
    div10.innerHTML=doc.getId();
    div9.appendChild(div10);
    
    div11=document.createElement('div');
    div11.setAttribute("style","width: 10%; float: left;");
    div9.appendChild(div11);

    btn1 = document.createElement('button');
    btn1.id="btnhide"+i.toString();
    btn1.className="buttonsee class active";
    btn1.innerHTML="hide";
    div11.appendChild(btn1);

    div12=document.createElement('div');
    div12.setAttribute("style","width: 100%; display: inline-block; padding-top: 20px;padding-bottom: 20px;");
    div8.appendChild(div12);

    //ciclo for, dim = 100/numvio
        let width= 99/doc.getNumPics();
        doc.getPics().forEach((image)=>{
            d = document.createElement('div');
            d.setAttribute("style","width:"+width.toString()+"%; float:left;");
            im = document.createElement('img');
            im.setAttribute("src",image.toString());
            im.setAttribute("height",heights[doc.getNumPics()-1].toString()+"px");
            d.appendChild(im);
            div12.appendChild(d);
        });

    div16=document.createElement('div');
    div16.setAttribute("style","width: 100%; display: inline-block; padding-top: 20px;padding-bottom: 20px;padding-left: 50px;");
    div8.appendChild(div16);

    div17=document.createElement('div');
    div17.setAttribute("style","width: 35%; height: 25px; float: left;padding-top: 5px;");
    div16.appendChild(div17);
    strong1=document.createElement('strong');
    strong1.className='class';
    strong1.setAttribute("style","font-size: large;");
    strong1.innerHTML=doc.getAddress();
    div17.appendChild(strong1);


    div18=document.createElement('div');
    div18.setAttribute("style","width: 25%; height: 25px; float: left;padding-top: 5px;");
    div16.appendChild(div18);
    strong2=document.createElement('strong');
    strong2.className='class';
    strong2.setAttribute("style","font-size: large;");
    strong2.innerHTML=doc.getDate().toDate().toString();
    div18.appendChild(strong2);

    div17=document.createElement('div');
    div17.setAttribute("style","width: 15%; height: 25px; float: left;padding-top: 5px;");
    div16.appendChild(div17);
    strong1=document.createElement('strong');
    strong1.className='class';
    strong1.setAttribute("style","font-size: large;");
    strong1.innerHTML=doc.getLicensePlate();
    div17.appendChild(strong1);


    div18=document.createElement('div');
    div18.setAttribute("style","width: 15%; height: 25px; float: left;padding-top: 5px;");
    div16.appendChild(div18);
    select=document.createElement('select');
    select.id='selection'+i.toString();
    select.className='select-css1 class';
    opt1=document.createElement('option');
    opt1.setAttribute("value","double_parking");
    opt1.innerHTML="Double parking";
    opt2=document.createElement('option');
    opt2.setAttribute("value","handicap_parking");
    opt2.innerHTML="Park on handicap";
    opt3=document.createElement('option');
    opt3.setAttribute("value","cycle_parking");
    opt3.innerHTML="Park on cycle-lane";
    opt4=document.createElement('option');
    opt4.setAttribute("value","sidewalk_parking");
    opt4.innerHTML="Park on sidewalk";
    opt5=document.createElement('option');
    opt5.setAttribute("value","unpaid_parking");
    opt5.innerHTML="Unpaid park";
    opt6=document.createElement('option');
    opt6.setAttribute("value","forbidden_parking");
    opt6.innerHTML="Forbidden park";
    select.appendChild(opt1);
    select.appendChild(opt2);
    select.appendChild(opt3);
    select.appendChild(opt4);
    select.appendChild(opt5);
    select.appendChild(opt6);
    div18.appendChild(select);


    div19=document.createElement('div');
    div19.setAttribute("style","width: 100%; display: inline-block; margin-top:20px;padding-top: 20px;padding-bottom: 1px;padding-left: 50px;padding-right: 40px;");
    div16.appendChild(div19);


    div20=document.createElement('div');
    div20.setAttribute("style","width: 60%; height: 10px; float: left;");

    div21=document.createElement('div');
    div21.setAttribute("style","width: 20%; height: 10px; float: left;");

    btnhi1=document.createElement('button');
    btnhi1.className="buttonsee class active";
    btnhi1.id="val"+i.toString();
    btnhi1.innerHTML="Validate";
    div21.appendChild(btnhi1);

    div22=document.createElement('div');
    div22.setAttribute("style","width: 20%; height: 10px; float: left;");

    btnhi2=document.createElement('button');
    btnhi2.className="buttonsee class inactive";
    btnhi2.id="del"+i.toString();
    btnhi2.innerHTML="Delete";
    div22.appendChild(btnhi2);
    div19.appendChild(div20);
    div19.appendChild(div21);
    div19.appendChild(div22);
    
    setClicks(i,doc);
    i++;
};

/**
 * setClicks(j,doc): this function manages the activation of buttons contained in each violation container
 */
function setClicks(j,doc){
        btn=document.getElementById('see'+j.toString());
        btn1=document.getElementById('btnhide'+j.toString());
        btn2=document.getElementById('val'+j.toString());
        btn3=document.getElementById('del'+j.toString());
        btn.onclick=function(){
            divB1=document.getElementById('hidden'+j.toString());
            divrow1=document.getElementById('row'+j.toString());
            divB1.className='show_vi';
            divrow1.className='violationRowAfter';
        };
        btn1.onclick=function(){
            divB1=document.getElementById('hidden'+j.toString());
            divrow1=document.getElementById('row'+j.toString());
            divB1.className='hidden_vi';
            divrow1.className='violationRow';
        };

        var sel=document.getElementById('selection'+j.toString());
        var type=sel.options[sel.selectedIndex].value;


        btn2.onclick=function(){
            val=document.getElementById('newid'+j.toString());
            validateViolation(doc.getId(),type);
            val.parentNode.removeChild(val);
        };
        btn3.onclick=function(){
            del=document.getElementById('newid'+j.toString());
            deleteViolation(doc.getId());
            del.parentNode.removeChild(del);
        };
};


function deleteViolation(id)
{
    database.collection("violations").doc(id).delete().then(function() {
        console.log("Violation successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing violation: ", error);
    });
};

function validateViolation(id,newType){
	
	var violationRef = database.collection("violations").doc(id);
	
	violationRef.update({
        type:newType,
	    validated: true
	})
	.then(function() {
	    console.log("Violation successfully updated!");
	})
	.catch(function(error) {
	    console.error("Error updating violation: ", error);
	});

};