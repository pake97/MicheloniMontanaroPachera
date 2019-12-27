function login()
{
    email = document.getElementById('user').value;
    password = document.getElementById('password').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
 .catch(function(err) {
 });
    window.location = 'violation.html';
}

function logout()
{
    firebase.auth().signOut().then(function() {
        window.location = 'index.html';
      }).catch(function(error) {
        window.location = 'index.html';
      });
}



