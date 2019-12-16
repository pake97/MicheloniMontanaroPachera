let button1= document.getElementById('b1');
let button2= document.getElementById('b2');
let button3= document.getElementById('b3');
let button4= document.getElementById('b4');
let button11= document.getElementById('b11');
let button12= document.getElementById('b12');
let button13= document.getElementById('b13');
let button14= document.getElementById('b14');
let button15= document.getElementById('b15');
let button16= document.getElementById('b16');
let button17= document.getElementById('b17');
let classA="buttontime class active";
let classI="buttontime class inactive";
var choice=1;
button1.onclick=function(){
    if(button1.className!=classA)
    {
        button1.className=classA;
        button2.className=classI;
        button3.className=classI;
        button4.className=classI;
        choice=1;
        drawChart();
    }
};
button2.onclick=function(){
    if(button2.className!=classA)
    {
        button1.className=classI;
        button2.className=classA;
        button3.className=classI;
        button4.className=classI;
        choice=2;
        drawChart();
    }
};
button3.onclick=function(){
    if(button3.className!=classA)
    {
        button1.className=classI;
        button2.className=classI;
        button3.className=classA;
        button4.className=classI;
        choice=3;
        drawChart();
    }
};
button4.onclick=function(){
    if(button4.className!=classA)
    {
        button1.className=classI;
        button2.className=classI;
        button3.className=classI;
        button4.className=classA;
        choice=4;
        drawChart();
    }
};
button11.onclick=function(){
    if(button11.className!=classA)
    {
        button11.className=classA;
        button12.className=classI;
        button13.className=classI;
        button14.className=classI;
        button15.className=classI;
        button16.className=classI;
        button17.className=classI;
        choice=4;
        drawChart();
    }
};
button12.onclick=function(){
    if(button12.className!=classA)
    {
        button11.className=classI;
        button12.className=classA;
        button13.className=classI;
        button14.className=classI;
        button15.className=classI;
        button16.className=classI;
        button17.className=classI;
        choice=5;
        drawChart();
    }
};
button13.onclick=function(){
    if(button13.className!=classA)
    {
        button11.className=classI;
        button12.className=classI;
        button13.className=classA;
        button14.className=classI;
        button15.className=classI;
        button16.className=classI;
        button17.className=classI;
        choice=4;
        drawChart();
    }
};
button14.onclick=function(){
    if(button14.className!=classA)
    {
        button11.className=classI;
        button12.className=classI;
        button13.className=classI;
        button14.className=classA;
        button15.className=classI;
        button16.className=classI;
        button17.className=classI;
        choice=4;
        drawChart();
    }
};
button15.onclick=function(){
    if(button15.className!=classA)
    {
        button11.className=classI;
        button12.className=classI;
        button13.className=classI;
        button14.className=classI;
        button15.className=classA;
        button16.className=classI;
        button17.className=classI;
        choice=4;
        drawChart();
    }
};
button16.onclick=function(){
    if(button16.className!=classA)
    {
        button11.className=classI;
        button12.className=classI;
        button13.className=classI;
        button14.className=classI;
        button15.className=classI;
        button16.className=classA;
        button17.className=classI;
        choice=4;
        drawChart();
    }
};
button17.onclick=function(){
    if(button17.className!=classA)
    {
        button11.className=classI;
        button12.className=classI;
        button13.className=classI;
        button14.className=classI;
        button15.className=classI;
        button16.className=classI;
        button17.className=classA;
        choice=4;
        drawChart();
    }
};

google.charts.load("current", {packages:["corechart"]});
let div_chart = document.getElementById('chart_div');
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
    var data1 = google.visualization.arrayToDataTable([
        ['Name','Number'],
        ['double parking', 44],
        ['park on handicap', 51],
        ['park on cycle', 67],
        ['park on sidewalk', 88], 
        ['forbidden park', 32], 
        ['unpaid park', 18]
      ]);
    var data2 = google.visualization.arrayToDataTable([
        ['Name','Number'],
        ['double parking', 39],
        ['park on handicap', 44],
        ['park on cycle', 60],
        ['park on sidewalk', 79], 
        ['forbidden park', 27], 
        ['unpaid park', 15]
      ]);
    var data3 = google.visualization.arrayToDataTable([
        ['Name','Number'],
        ['double parking', 21],
        ['park on handicap', 22],
        ['park on cycle', 13],
        ['park on sidewalk', 23], 
        ['forbidden park', 2], 
        ['unpaid park', 7]
      ]);
    var data4 = google.visualization.arrayToDataTable([
        ['Name','Number'],
        ['double parking', 5],
        ['park on handicap', 12],
        ['park on cycle', 20],
        ['park on sidewalk', 2], 
        ['forbidden park', 11], 
        ['unpaid park', 3]
      ]);

      var data5=google.visualization.arrayToDataTable([
        ['Year','Number'],
        ['2018', 54],
        ['2019', 123],
        ['2020', 256]
      ]);

      var options = {
        title: 'Number of violations',
        legend: { position: 'top', maxLines: 2 },
        visibleInLegend:true,
        interpolateNulls: false,
      };

switch (choice) {
    case 1:
        var chart = new google.visualization.ColumnChart(div_chart);
        chart.draw(data1, options);
        break;
    case 2:
        var chart = new google.visualization.ColumnChart(div_chart);
        chart.draw(data2, options);
        break;
    case 3:
        var chart = new google.visualization.ColumnChart(div_chart);
        chart.draw(data3, options);
        break;
    case 4:
        var chart = new google.visualization.ColumnChart(div_chart);
        chart.draw(data4, options);
        break;
    case 5:
        var chart = new google.visualization.ColumnChart(div_chart);
        chart.draw(data5, options);
        break;
    default:
          console.log("chart");
  }
}


