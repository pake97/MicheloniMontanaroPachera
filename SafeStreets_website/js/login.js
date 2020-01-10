let loginButton = document.getElementById("login_button");

loginButton.onclick = function(){
  let email = document.getElementById('user').value;
  let password = document.getElementById('password').value;
  login(email,password);
}


function login(email,password){ 
    console.log(email);
    console.log(password);
    firebase.auth().signInWithEmailAndPassword(email, password).then(value =>{
      window.location="violation.html";
      return console.log("Success",value);
    }).catch(error => {
      if(error.code == "auth/wrong-password" || error.code == "auth/user-not-found")
        alert("Error! Wrong credentials.");
    });
}

function logout(){
    firebase.auth().signOut().then(function() {
        window.location = 'index.html';
      }).catch(error => { console.log("error:",error) });
}



