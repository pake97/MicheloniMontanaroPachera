var database = firebase.firestore();
var dbRefS= database.collection("statistics");
let classA="buttontime class active";
let classI="buttontime class inactive";
let time_choices=["ever","year","month","week"];
let type_choices=["all","double_parking","handicap_parking","sidewalk_parking","unpaid_parking","forbidden_parking","cycle_parking"];
let violation_types=["double_parking","handicap_parking","sidewalk_parking","unpaid_parking","forbidden_parking","cycle_parking"];
let time_choice_button=[];
let type_choice_button=[];

let time_choice=time_choices[0];
let type_choice=type_choices[0];

let list_value=[];
let list_label=[];

let div_chart = document.getElementById('chart_div');

dbRefS.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        list_value.push(doc.data().Violation_number);
        list_label.push(doc.id);
    });
    addChart();
});

for(let i=1;i<5;i++)
    time_choice_button.push(document.getElementById('b'+i.toString()));
for(let j=1;j<8;j++)
    type_choice_button.push(document.getElementById('b1'+j.toString()));

time_choice_button.forEach((btn)=>{
    btn.onclick=function(){
        time_choice_button.forEach((b)=>{
            b.className=classI;
        });
        btn.className=classA;
        time_choice=time_choices[parseInt(btn.id.charAt(1))-1];
        getViolationLists();
    }
});

type_choice_button.forEach((btn)=>{
    btn.onclick=function(){
        type_choice_button.forEach((b)=>{
            b.className=classI;
        });
        btn.className=classA;
        type_choice=type_choices[parseInt(btn.id.charAt(2))-1];
        getViolationLists();
    }
});




function drawChart() {
    temp=[]
    temp.push(['Type','Number']);
    for(let i=0;i<list_value.length;i++)
        {
            temp.push([list_label[i],list_value[i]]);
        }
    let data=google.visualization.arrayToDataTable(temp);
      var options = {
        title: 'Number of violations',
        legend: { position: 'top', maxLines: 2 },
        visibleInLegend:true,
        interpolateNulls: false,
      };
        var chart = new google.visualization.ColumnChart(div_chart);
        chart.draw(data, options);
}

function addChart(){
    customSort(list_label,list_value);
    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawChart);
}





function getViolationLists(){
    list_label=[];
    list_value=[];
    if(type_choice==(type_choices[0]))
    {
        switch(time_choice){
            case time_choices[0]:
                {
                    dbRefS.get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            list_value.push(doc.data().Violation_number);
                            list_label.push(doc.id);
                        });
                        addChart();
                    });
                    break;
                }
            case time_choices[1]:
                {
                    violation_types.forEach((choice)=>{
                        dbRefS.doc(choice).collection("year").doc((new Date().getFullYear()).toString()).get().then(function(doc){
                                list_value.push(doc.data().Violation_number);
                                list_label.push(choice);
                                addChart();
                        });
                    })
                    break;
                }
            case time_choices[2]:
                {
                    violation_types.forEach((choice)=>{
                        dbRefS.doc(choice).collection("year").doc((new Date().getFullYear()).toString()).collection("month").doc((new Date().getMonth()+1).toString()).get().then(function(doc){
                                list_value.push(doc.data().Violation_number);
                                list_label.push(choice);
                                console.log(list_label);
                                console.log(list_value);
                                addChart();
                        });
                    })
                    break;
                }
            case time_choices[3]:
                {
                    violation_types.forEach((choice)=>{
                        dbRefS.doc(choice).collection("year").doc((new Date().getFullYear()).toString()).collection("month").doc((new Date().getMonth()+1).toString()).collection("day").doc((new Date().getDay()).toString()).get().then(function(doc){
                                list_value.push(doc.data().Violation_number);
                                list_label.push(choice);
                                console.log(list_label);
                                console.log(list_value);
                                addChart();
                        }); 
                    });
                    break;
                }
        }
    }
    else{
        let ref=dbRefS.doc(type_choice);
        switch(time_choice){
            case time_choices[0]:
                {
                    ref.collection("year").get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            list_value.push(doc.data().Violation_number);
                            list_label.push(doc.id);
                        });
                        console.log(list_label);
                        console.log(list_value);
                        addChart();
                    });
                    break;
                }
            case time_choices[1]:
                {
                    ref.collection("year").doc((new Date().getFullYear()).toString()).collection("month").get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            list_value.push(doc.data().Violation_number);
                            list_label.push(doc.id);
                        });
                        console.log(list_label);
                        console.log(list_value);
                        addChart();
                    });
                    break;
                }
            case time_choices[2]:
                {
                    console.log((new Date().getMonth()+1).toString());
                    ref.collection("year").doc((new Date().getFullYear()).toString()).collection("month").doc((new Date().getMonth()+1).toString()).collection("day").get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            list_value.push(doc.data().Violation_number);
                            list_label.push(doc.id);
                        });
                        console.log(list_label);
                        console.log(list_value);
                        addChart();
                    });
                    break;
                }
            case time_choices[3]:
                {
                    var today=new Date();
                    if(today.getDate()>6)
                        {
                            for(let i=today.getDate()-6;i<today.getDate()+1;i++)
                            ref.collection("year").doc((new Date().getFullYear()).toString()).collection("month").doc((new Date().getMonth()+1).toString()).collection("day").doc(i.toString()).get().then(function(doc){
                                list_value.push(doc.data().Violation_number);
                                list_label.push(i.toString());
                                console.log(list_label);
                                console.log(list_value);
                                addChart();
                        }); 
                        }
                    else{
                        for(let i=1;i<8;i++)
                        ref.collection("year").doc((new Date().getFullYear()).toString()).collection("month").doc((new Date().getMonth()+1).toString()).collection("day").doc(i.toString()).get().then(function(doc){
                            list_value.push(doc.data().Violation_number);
                            list_label.push(i.toString());
                            console.log(list_label);
                            console.log(list_value);
                            addChart();
                    });
                    }/*
                    ref.collection("year").doc((new Date().getFullYear()).toString()).collection("month").doc((new Date().getMonth()+1).toString()).collection("day").get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            
                            list_value.push(doc.data().Violation_number);
                            list_label.push(doc.id);
                        });
                        console.log(list_label);
                        console.log(list_value);
                        addChart();
                    });*/
                    break;
                }
        }
    }
}




function swap(items, firstIndex, secondIndex){
    var temp = items[firstIndex];
    items[firstIndex] = items[secondIndex];
    items[secondIndex] = temp;
}

function partition(items, left, right) {

    var pivot   = items[Math.floor((right + left) / 2)],
        i       = left,
        j       = right;


    while (i <= j) {

        while (items[i] < pivot) {
            i++;
        }

        while (items[j] > pivot) {
            j--;
        }

        if (i <= j) {
            swap(items, i, j);
            swap(list_value, i, j);
            swap(list_label, i, j);
            i++;
            j--;
        }
    }

    return i;
}
 
function quickSort(items, left, right) {

    var index;

    if (items.length > 1) {

        index = partition(items, left, right);

        if (left < index - 1) {
            quickSort(items, left, index - 1);
        }

        if (index < right) {
            quickSort(items, index, right);
        }

    }

}

function customSort(stringList, valueList){
 
 if(stringList.length != 0 && stringList.length == valueList.length){
  
  var array = [];
  for(var i = 0; i < stringList.length; ++i){
   
   array[i] = parseInt(stringList[i]);
  }
  

  quickSort(array, 0, array.length - 1);
  
 }
}