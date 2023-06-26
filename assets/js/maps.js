var map, watchId, userPin, directionsManager, routePath, destinationLoc, friendPin, EventPin, PlacePin;

function init() {
    map = new Microsoft.Maps.Map("#map", {
      center: new Microsoft.Maps.Location(-17.895413,30.991032),
      zoom: 19,
      supportedMapTypes: [
        Microsoft.Maps.MapTypeId.road,
        Microsoft.Maps.MapTypeId.aerial,
        Microsoft.Maps.MapTypeId.streetside,
        Microsoft.Maps.MapTypeId.grayscale,
        Microsoft.Maps.MapTypeId.canvasDark,
        Microsoft.Maps.MapTypeId.canvasLight,
        Microsoft.Maps.MapTypeId.birdseye, //Will display a button in the future.
    ],
      mapTypeId: Microsoft.Maps.MapTypeId.aerial
    });

    friendPin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(-17.895413,30.991032), {visible : false, icon: 'assets/img/user_location_48px.png',
    anchor: new Microsoft.Maps.Point(24, 24)});
    EventPin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(-17.895413,30.991032), {visible : false, icon: 'assets/img/point_of_interest_52px.png',
    anchor: new Microsoft.Maps.Point(26, 26)});
    PlacePin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(-17.895413,30.991032), {visible : false, icon: 'assets/img/marker_100px.png',
      anchor: new Microsoft.Maps.Point(50, 50)});
    map.entities.push(friendPin);
    map.entities.push(EventPin);
    map.entities.push(PlacePin);



  //Load the directions and spatial math modules.
  Microsoft.Maps.loadModule(["Microsoft.Maps.Directions"], function () {
    //Create an instance of the directions manager.
    directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);

    //Define direciton options that you want to use, that won't be reset the next time a route is calculated.
    //Calculate a date time that is 1 hour from now.
    var departureTime  = new Date();
    departureTime.setMinutes(departureTime.getHours() + 1);

    //Set the request options that avoid highways and uses kilometers.
    directionsManager.setRequestOptions({
      distanceUnit: Microsoft.Maps.Directions.DistanceUnit.km,
      routeAvoidance: [
        Microsoft.Maps.Directions.RouteAvoidance.avoidLimitedAccessHighway,
      ],
      routeMode: Microsoft.Maps.Directions.RouteMode.walking,
      time: departureTime,
      timeType: Microsoft.Maps.Directions.TimeTypes.departure
    });

    //Make the route line thick and green.
    directionsManager.setRenderOptions({
      drivingPolylineOptions: {
        strokeColor: "mediumaquamarine",
        strokeThickness: 6,
      },
    });

    Microsoft.Maps.Events.addHandler(
      directionsManager,
      "directionsUpdated",
      directionsUpdated
    );
  });
}

window.places = [
  {
    title: "Highfield 1 High",
    position: { lat: -17.895413, lng: 30.991032 },
    content: "Highfield 1 High is a secondary school located in Highfield, Harare. In the Harare Province, it has been rated the best school in terms of School tone, order and even the appearance. The school is a perfect school for your High School kid and covers leevs from Form 1 to Form 6. ",
    images: [],
  },
  {
    title: "Library",
    position: { lat: -17.895259, lng: 30.991279 },
    content: "The school library is located next to the School Hall. In this is the most silent place in the school. Think the whole school is quiet, oh you haven't been in the library yet! ",
    images: [],
  },
  {
    title: "Entrance",
    position: { lat: -17.895917, lng: 30.990978 },
    content: "Welcome to Highfield 1 High. This is the entrance and to get more detail. Talk to the guard at the gate or you can go to the reception, ",
    images: [],
  },
  {
    title: "School Hall",
    position: { lat: -17.895422, lng: 30.990941 },
    content: "This is where universal meetings are held. When there are no meetings being carried out, the hall acts as a study room. ",
    images: [],
  },
  {
    title: "Basketball Field",
    position: { lat: -17.895759, lng: 30.989121 },
    content: "",
    images: [],
  },
  {
    title: "Sports Field",
    position: { lat: -17.896279, lng: 30.989735 },
    content: "",
    images: [],
  },
  {
    title: "Lecture Theatre",
    position: { lat: -17.894862, lng: 30.990741 },
    content: "",
    images: [],
  },
  {
    title: "Staff",
    position: { lat: -17.895527, lng: 30.990581 },
    content: "",
    images: [],
  },
  {
    title: "Agriculture Field",
    position: { lat: -17.894722, lng: 30.989990 },
    content: "",
    images: [],
  },
  {
    title: "Soccer Field",
    position: { lat: -17.894584, lng: 30.991411 },
    content: "",
    images: [],
  },
  {
    title: "Toilets",
    position: { lat: -17.895009, lng: 30.990274 },
    content: "",
    images: [],
  },
  
];

window.init = init;


function startTracking() {
  //Add a pushpin to show the user's location.
  userPin = new Microsoft.Maps.Pushpin(map.getCenter(), { visible: false });
  map.entities.push(userPin);

  //Watch the users location.
  watchId = navigator.geolocation.watchPosition(usersLocationUpdated);
}

function locateFriend(param) {
  stopTracking();
  let loc = new Microsoft.Maps.Location(
    param.location.latitude,
    param.location.longitude
  );
  friendPin.setLocation(loc);
  //Create custom Pushpin
  friendPin.setOptions({
      title: param.username,
      subTitle: new Date(param.lastseen).toString(),
      text: 'f',
      visible : true
  });

  //Center the map on the user's location.
  map.setView({ center: loc });
  showinFooter('@'+param.username,'<b>Lastseen : </b> ' + new Date(param.lastseen).toString(), [], param.location);

}

function locateEvent(param) {
  stopTracking();
  let loc = new Microsoft.Maps.Location(
    param.location.latitude,
    param.location.longitude
  );
  EventPin.setLocation(loc);
  //Create custom Pushpin
  EventPin.setOptions({
      title: param.event_name,
      subTitle: 'event',
      text: 'e',
      visible : true
  });



  //Center the map on the user's location.
  map.setView({ center: loc });
  showinFooter('~'+param.event_name, param.description, param.images, param.location);

}

function locatePlace(param) {
  stopTracking();
  let loc = new Microsoft.Maps.Location(
    param.position.lat,
    param.position.lng
  );
  PlacePin.setLocation(loc);
  //Create custom Pushpin
  PlacePin.setOptions({
      title: param.title,
      subTitle: 'place',
      visible : true
  }); //Center the map on the user's location.
  map.setView({ center: loc });
  showinFooter(param.title, param.content, param.images, {latitude : param.position.lat, longitude : param.position.lng});
}

function usersLocationUpdated(position) {
  var loc = new Microsoft.Maps.Location(
    position.coords.latitude,
    position.coords.longitude
  );

  //Update the user pushpin.
  userPin.setLocation(loc);
  userPin.setOptions({ visible: true });

  //Center the map on the user's location.
  map.setView({ center: loc });

  //Calculate a new route if one hasn't been calculated or if the users current location is further than 50 meters from the current route.
  if (!routePath || Microsoft.Maps.SpatialMath.distance(loc, routePath) > 50) {
    calculateRoute(loc, destinationLoc);
  }
}

function stopTracking() {
  // Cancel the geolocation updates.
  navigator.geolocation.clearWatch(watchId);

  //Remove the user pushpin.
  map.entities.clear();
  map.entities.push(friendPin);
  map.entities.push(EventPin);
  map.entities.push(PlacePin);
  clearDirections();
}

function calculateRoute(userLocation, destination) {
  clearDirections();

  //Create waypoints to route between.
  directionsManager.addWaypoint(
    new Microsoft.Maps.Directions.Waypoint({ location: userLocation })
  );
  directionsManager.addWaypoint(
    new Microsoft.Maps.Directions.Waypoint({ location: destination })
  );

  //Calculate directions.
  directionsManager.calculateDirections();
}

function directionsUpdated(e) {
  //When the directions are updated, get a polyline for the route path to perform calculations against in the future.
  var route = directionsManager.getCurrentRoute();

  if (route && route.routePath && route.routePath.length > 0) {
    routePath = new Microsoft.Maps.Polyline(route.routePath);
  }
}

function clearDirections() {
  //Clear directions waypoints and display without clearing it's options.
  directionsManager.clearDisplay();

  var wp = directionsManager.getAllWaypoints();
  if (wp && wp.length > 0) {
    for (var i = wp.length - 1; i >= 0; i--) {
      this.directionsManager.removeWaypoint(wp[i]);
    }
  }

  routePath = null;
}

function goNow(event) {
    destinationLoc = new Microsoft.Maps.Location(
        Number(document.querySelector('#LocPin').getAttribute('lat')),
        Number(document.querySelector('#LocPin').getAttribute('lng'))
      );
      startTracking();
}
function shareNow(event) {
  input = document.getElementById('textarea_copy');
  let websi = window.location.href;
  websi = websi.replace('attractions.html', '');
  websi = websi.replace(window.location.hash, '');
  input.value = `${websi}#lat=${Number(document.querySelector('#LocPin').getAttribute('lat'))}&lng=${Number(document.querySelector('#LocPin').getAttribute('lng'))}`;
  input.classList.toggle('d-none');
  input.select();
  document.execCommand("copy");
  input.classList.toggle('d-none');
  notify('Link has been copied. </br> Now you can share with your friends :)');
}
