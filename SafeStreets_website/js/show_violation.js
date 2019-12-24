var buttonsee= document.getElementById('see');
var divbu= document.getElementById('bubusettete');
var divrow1= document.getElementById('row1');
var buttonhide=document.getElementById('hide');
//let buttonsee1= document.getElementById('see1');
//let divbu1= document.getElementById('bubusettete1');
//let buttonsee2= document.getElementById('see2');
//let divbu2= document.getElementById('bubusettete2');
//let divrow2= document.getElementById('row2');
//let divrow3= document.getElementById('row3');
//let buttonhide1=document.getElementById('hide1');
//let buttonhide2=document.getElementById('hide2');

buttonsee.onclick=function(){
        divbu.className='show_vi';
        divrow1.className='violationRowAfter';
}

buttonsee1.onclick=function(){
        divbu1.className='show_vi';
        buttonsee1.className='buttonsee class active';
        divrow2.className='violationRowAfter';
}

buttonsee2.onclick=function(){
    if(divbu2.className=='hidden_vi'){
        divbu2.className='show_vi';
        buttonsee2.className='buttonsee class active';
        divrow3.className='violationRowAfter';
    }
    else{
        divbu2.className='hidden_vi';
        buttonsee2.className='buttonsee class inactive'; 
        divrow3.className='violationRow';
    }
}

buttonhide.onclick=function(){
        divbu.className='hidden_vi';
        divrow1.className='violationRow';
}