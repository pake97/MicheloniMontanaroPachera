let button21= document.getElementById('a1');
let button22= document.getElementById('a2');
let div= document.getElementById('modifable');
let vis="appear";
let invis="disappear";

button21.onclick=function(){
    if(button21.className!=classA)
    {
        button21.className=classA;
        button22.className=classI;
        div.className=invis;
    }
};
button22.onclick=function(){
    if(button22.className!=classA)
    {
        button22.className=classA;
        button21.className=classI;
        div.className=vis;
    }
};