// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrZEkLglljvwXED1RNQlWF256SiQErVlE",
  authDomain: "campuscompass-52b4e.firebaseapp.com",
  projectId: "campuscompass-52b4e",
  storageBucket: "campuscompass-52b4e.appspot.com",
  messagingSenderId: "1065427206502",
  appId: "1:1065427206502:web:d3034333b69b5d114808a7",
  measurementId: "G-E7BG9XL8DV"
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

var user = {};
var user_share_url = '';
var friends = [];
var events = [];



function refreshUI() {
    try {
      document.querySelectorAll("datalist#Places > option[type='Friend']").forEach((v, k, p) => {
        v.remove();
      });
      document.querySelectorAll("datalist#Places > option[type='Event']").forEach((v, k, p) => {
        v.remove();
      });  
    } catch (error) {
      console.error(error);
    }
    
try {
    select('ul.list.friends').innerHTML = '';
    select("ul.list.events").innerHTML = '';
    select("ul.list.my-events").innerHTML = '';
  
  friends.forEach((v, k, p) => {
    let li = document.createElement('li');
    li.innerHTML = `<p>${v.data.username}</p> <span>${new Date(v.data.lastseen).toString()}</span>`;
    li.onclick = function (event) {
      window.location.href = `index.html#friend=${v.key}`;
    }
    document.querySelector('ul.list.friends').appendChild(li);

    try {
      let op = document.createElement('option');
      op.value = '@' + v.data.username;
      op.setAttribute('type', 'Friend');
      op.innerText = v.data.lastseen;
      select('datalist#Places').appendChild(op);
    } catch (error) {
      console.error(error);
    }
    
    
  });

  events.forEach((v, k, p) => {
    
    
    try {
        let startTime = new Date(v.data.startTime);
        let endTime = new Date(v.data.endTime);
        let now = new Date();
      
        if (endTime > now) {
          let li = document.createElement("li");
          li.innerHTML = `<p>${v.data.event_name}</p> <span>${new Date(
            v.data.startTime
          ).toLocaleTimeString()} - ${new Date(
            v.data.endTime
          ).toLocaleTimeString()}</span>`;
          select("ul.list.events").appendChild(li);
        }
    }catch (error) {
      notify(error + ' -- events loop', 'text-danger');
    }
    

    try {
        let op = document.createElement('option');
        op.value = '~' + v.data.event_name;
        op.setAttribute('type', 'Event');
        op.innerText = new Date(v.data.startTime).toLocaleTimeString() + " - " + new Date(v.data.endTime).toLocaleTimeString();
        select('datalist#Places').appendChild(op);
    } catch (error) {
      console.error(error);
    }
      

  });

  events.forEach((v, k, p) => {
      let startTime = new Date(v.data.startTime);
      let endTime = new Date(v.data.endTime);
    
      if (v.data.user_uid == user.uid) {
        let li = document.createElement("li");
        li.classList.add('edit');
        li.innerHTML = `<p><span>${v.data.event_name}</span><span>${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}</span></p>
        <p style="flex-direction: row;"><i class="bi bi-pencil-fill" onclick="openPrompt('${v.key}')"></i><i onclick="shareEvent('${v.key}')" class="bi bi-share"></i><i class="bi bi-trash" onclick="removeEvent('${v.key}')"></i></p>`;
        select("ul.list.my-events").appendChild(li);
      }
  });

  } catch (error) {
    console.log(error);
    //notify(error + '-- events & friends', 'text-danger');
  }


}

refreshUI();
var database = firebase.database();

var eventsListRef = database.ref("events");
var friendsListRef = database.ref("friends");

// friend => |user_uid|, lastseen, username, location{}
// event => |uid|, startTime, endTime, user_uid, location{}, event_name, description, images[];

firebase.auth().onAuthStateChanged((userr) => {
  if (userr) {
    user = userr;
    //var uid = userr.uid;
    // ...
  } else {
    if(!window.location.href.includes('signup') && !window.location.href.includes('login')){
      window.location.href = "about.html";
    }
  }

  try {
    document.querySelector('#heading_username').innerText = user.displayName;
  } catch (error) {
  }

});

eventsListRef.on('value', (snapshot) => {
  
  if (snapshot.exists()) {
    events = [];
    snapshot.forEach((childSnapshot) => {
      events.push({
        key : childSnapshot.key,
        data : childSnapshot.val()
      });
    });
    refreshUI();
  }
  
});

friendsListRef.on('value', (snapshot) => {
  friends = [];
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      friends.push({
        key : childSnapshot.key,
        data : childSnapshot.val()
      });
    });
    refreshUI();
  }
});


function SignUp(email, password, username) {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      user = firebase.auth().currentUser;
      addFriend({
        user_id: user.uid,
        lastseen: new Date().toString(),
        location: { lat: -17.78521, lng: 31.05311 },
        username: username,
      });
      user
        .updateProfile({
          displayName: username,
        })
        .then(() => {
          // Update successful
          window.location.href = "index.html";

          // ...
        })
        .catch((error) => {
          // An error occurred
          window.setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
          return "Error in editing username";
          // ...
        });
    })
    .catch((error) => {
      notify(error.message, ["text-danger"]);
      // ..
    });
}
function Login(email, password) {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      user = userCredential.user;
      window.location.href = "index.html";
      // ...
    })
    .catch((error) => {
      return error.message;
    });
}
function addEvent(param) {
  try {
  let newEvent = eventsListRef.push();
  newEvent.set(param);
  return newEvent.key;
  } catch (error) {
    notify(error)
  }
}
function addFriend(param) {
  try {
  let newFriend = friendsListRef.push();
  newFriend.set(param);
  return newFriend.key;
  } catch (error) {
    notify(error)
  }
}
function removeEvent(uid) {
  try {
    database.ref("events/" + uid).remove();
  } catch (error) {
    notify(error, 'text-danger');
  }
  
}
function getFriend(key, myfunc = (()=> {})) {
  friendsListRef.child(key).get().then((snapshot) => {
    if (snapshot.exists()) {
      myfunc(snapshot.val())
      return snapshot.val();
    } else {
      notify("No data available.", 'text-warning');
      return null;
    }
  }).catch((error) => {
    notify(error, 'text-warning');
  });
}
function getEvent(key, myfunc = (() => {})) {
  eventsListRef.child(key).get().then((snapshot) => {
    if (snapshot.exists()) {
      myfunc(snapshot.val())
      return snapshot.val();
    } else {
      notify("No data available.", 'text-warning');
      return null;
    }
  }).catch((error) => {
    notify(error, 'text-warning');
  });
}
function updateEvent(uid, param) {
  try {
  let evRef = database.ref("events/" + uid);
  evRef.update(param);
  } catch (error) {
    notify(error)
  }
}
function updateFriendLocation(position) {
  try {
  let userRef = database.ref("friends/" + friends.filter(val => val.data.user_id == user.uid)[0]);
  userRef.update({
    lastseen: new Date().toString(),
    location: {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    },
  });

  user_share_url = window.location.origin + `\index.html#lat=${position.coords.latitude}&lng=${position.coords.longitude}`;
  
  } catch (error) {
    notify(error + " -- GeoLocation Error");
  }
}

function shareMine(event) {
  input = document.getElementById('textarea_copy');
  input.value = user_share_url;
  input.classList.toggle('d-none');
  input.select();
  document.execCommand("copy");
  input.classList.toggle('d-none');
  notify('Link has been copied. </br> Now you can share with your friends :)');
}


if (navigator.geolocation) {
  //after the user indicates that they want to turn on continuous location-tracking
  var watchId = navigator.geolocation.watchPosition(
    updateFriendLocation,
    geolocationFailure
  );
} else {
  notify("Geolocation is not supported by this browser.", ["text-warning"]);
}


function geolocationFailure() {
  return 0;
  //notify('Please turn on your location for location tracking.', ['text-danger']);
}
