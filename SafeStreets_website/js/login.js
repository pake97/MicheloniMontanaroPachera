/** 
 *login.js
 *This module manages the login into the website
 *It contains only logic elements
 *LOGIC:
 *a function to catch the click performed on the login button.
 *a function to send a request to the server with the credentials to login. 
 *a function to logout
*/

let loginButton = document.getElementById("login_button");

/**
 * loginbutton.onclick: it catches the click performed on the login button and calls the login(email,password) function
 * @param email: variable holding email string
 * @param password: variable holding password string
 */
loginButton.onclick = function(){
  let email = document.getElementById('user').value;
  let password = document.getElementById('password').value;
  login(email,password);
}

/**
 * login(email,password): this function sends a request to the server containing email and password,
 * it also manages the operations to perform when a response from the server is returned.
 */
function login(email,password){ 
    firebase.auth().signInWithEmailAndPassword(email, password).then(value =>{
      window.location="violation.html";
      return console.log("Success",value);
    }).catch(error => {
      if(error.code == "auth/wrong-password" || error.code == "auth/user-not-found")
        alert("Error! Wrong credentials.");
    });
}

/**
 * logout(): this function manages the logout operation
 */
function logout(){
    firebase.auth().signOut().then(function() {
        window.location = 'index.html';
      }).catch(error => { console.log("error:",error) });
}



