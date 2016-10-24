'use strict';

$('.button-collapse').sideNav({
    closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
  }
);

// Declare variables and create empyt arrays
var coffeeShopId = [];
var coffeeShopContent = [];
var allLatLng = [];
var allMarkers = [];
var map;
let infowindow;
var userCords;
var pos;
var styles = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#0066ff"},{"saturation":74},{"lightness":100}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"},{"weight":0.6},{"saturation":-85},{"lightness":61}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#5f94ff"},{"lightness":26},{"gamma":5.86}]}];

function initMap() {
    var mapOptions = {
    zoom: 7,
    center: new google.maps.LatLng(47.608013, -122.335167),
    styles: styles,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE,
      position: google.maps.ControlPosition.RIGHT_CENTER
    }
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  google.maps.event.addDomListener(window, "resize", function() {
   var center = map.getCenter();
   google.maps.event.trigger(map, "resize");
   map.setCenter(center);
  });

  // create infowindow to display venue content
  infowindow = new google.maps.InfoWindow();
}


function userInput(event) {
  event.preventDefault();

  coffeeShopId = [];
  coffeeShopContent = [];
  allLatLng = [];
  allMarkers = [];

  var $city1 = $('#city1').val();
  console.log('city 1', $city1);

  var $city2 = $('#city2').val();
  console.log('city 2', $city2);

  if ($city1.length === 0 && $city2.length === 0) {
    Materialize.toast('Please fill in search', 4000);
    return;
  }

  if ($city1.length > 0 && $city2.length === 0) {
    getCoffeeId($city1);
  }

  if ($city1.length === 0 && $city2.length > 0) {
    getCoffeeId($city2);
  }
}

$('.formSideNav').submit(userInput);
$('.formDesktopNav').submit(userInput);



// Response to get all venues near a city with a coffee shop Id
var getCoffeeId = function(city) {
  var $xhr = $.getJSON(`https://api.foursquare.com/v2/venues/search?client_id=UKXBEBLHQL3OZCTIRTNXWLGZZH3UBCV1PRHMYMJ2UOOUWVS5&client_secret=XRAB0PTCW1RDQMAU5W1S3YMSXTZUFUUV01CYHTWQHR2T0LCM&v=20130815&near=${city}&categoryId= 4bf58dd8d48988d1e0931735&limit=50&radius=3200`);

  $xhr.done(function(categoryId) {
    if ($xhr.status !== 200) {
      Materialize.toast('Search error, please try again', 4000);
      return;
    }
    var venueIds = categoryId.response.venues;

    for (var venueId of venueIds) {
      var venue = {
        id: venueId.id
      };
      coffeeShopId.push(venue);
      getCoffeeContent(venue);
    }
  });

  $xhr.fail(function() {
    Materialize.toast('Search error, please try again', 4000);
  });
};

// RESPONSE CHECKING FOR COFFEE SHOP WIFI ACCESS - yes or no
var getCoffeeContent = function(venue) {
  var $xhr2 = $.getJSON(`https://api.foursquare.com/v2/venues/${venue.id}?client_id=UKXBEBLHQL3OZCTIRTNXWLGZZH3UBCV1PRHMYMJ2UOOUWVS5&client_secret=XRAB0PTCW1RDQMAU5W1S3YMSXTZUFUUV01CYHTWQHR2T0LCM&v=20130815`);

  $xhr2.done(function(contents) {
    if ($xhr2.status !== 200) {
      return;
    }
    //grabs all data of each venue
    var biz = contents.response.venue;

    if (hasWifi(biz)) {
      var latitude = biz.location.lat;
      var longitude = biz.location.lng;
      var venueName = biz.name;
      var address1 = biz.location.formattedAddress[0];
      var address2 = biz.location.formattedAddress[1];
      var address3 = biz.location.formattedAddress[2];
      var hours = biz.hours.status;
      var fourSquareVenueUrl = biz.canonicalUrl;

      var contentString = `<div class="infowindow row">
        <div class="col s12">
          <h4 class="center-align">${venueName}</h4>
          <p>${address1}</p>
          <p>${address2}</p>
          <p>${address3}</p>
          <h6>${hours}</h6>
          <a href="${fourSquareVenueUrl}">Directions & Info</a>
        </div>
      </div>`;

      var myLatLng = new google.maps.LatLng(latitude, longitude);

      // image for custom google map marker - blue coffee cup
      var image = {
        url: 'marker.png',
        size: new google.maps.Size(80, 80)
      };

      var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: image
      });

      marker.addListener('click', function() {
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
      });

      allMarkers.push(marker);


      //store all lat long in array
			allLatLng.push(myLatLng);

      //  Make an array of the LatLng's of the markers you want to show
      //  Create a new viewpoint bound
      var bounds = new google.maps.LatLngBounds();

      //  Go through each...
      for (var i = 0, LtLgLen = allLatLng.length; i < LtLgLen; i++) {
        //  And increase the bounds to take this point
        bounds.extend(allLatLng[i]);
      }
      //  Fit these bounds to the map
      map.fitBounds(bounds);
    }
  });
};



// filter venues on whether or not they have wifi with a boolean of true/false
var hasWifi = function(biz) {
  var properties = biz.attributes.groups;
  return properties.filter(function(prop) {
    return prop.name === 'Wi-Fi' && prop.items[0].displayValue === 'Yes';
  }).length > 0;
};


// GEOLOCATION from user
function geolocation(event) {
  coffeeShopId = [];
  coffeeShopContent = [];
  allLatLng = [];
  allMarkers = [];

  Materialize.toast('Locate coffee shops with wifi?  Yes please!', 4000);

  if (navigator.geolocation) {

  	function error(err) {
  		console.warn('ERROR(' + err.code + '): ' + err.message);
  	}

  	function success(pos){
  		userCords = pos.coords;
      var userLat = userCords.latitude;
      var userLng = userCords.longitude;
      getCoffeeIdByUserLatLng(userLat, userLng);
  		//return userCords;
  	}

	// Get the user's current position
	navigator.geolocation.getCurrentPosition(success, error);
	//console.log(pos.latitude + " " + pos.longitude);
	} else {
    Materialize.toast('Geolocation is not supported in your browser', 4000);
	}
}

$('#myLocSideNav').on('click', geolocation);
$('#myLocNav').on('click', geolocation);


// response to foursquare venues with wifi by user lat and lng
var getCoffeeIdByUserLatLng = function(userLat, userLng) {

  var $xhr = $.getJSON(`https://api.foursquare.com/v2/venues/search?client_id=UKXBEBLHQL3OZCTIRTNXWLGZZH3UBCV1PRHMYMJ2UOOUWVS5&client_secret=XRAB0PTCW1RDQMAU5W1S3YMSXTZUFUUV01CYHTWQHR2T0LCM&v=20130815&ll=${userLat},${userLng}&categoryId= 4bf58dd8d48988d1e0931735&radius=3200`);

  $xhr.done(function(categoryId) {
    if ($xhr.status !== 200) {
        return;
    }
    var venueIds = categoryId.response.venues;

    for (var venueId of venueIds) {
      var venue = {
        id: venueId.id
      };
      coffeeShopId.push(venue);
      getCoffeeContent(venue);
    }
  });
  $xhr.fail(function() {
    Materialize.toast('Search error, please try again', 4000);
  });
};
