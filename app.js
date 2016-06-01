'use strict';


// Declare variables and create empyt arrays
var coffeeShopId = [];
var coffeeShopContent = [];
var allLatLng = [];
var allMarkers = [];
var map;
var userCords;
var pos;

function initMap() {
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(37.09024, -95.712891),
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE,
      position: google.maps.ControlPosition.RIGHT_CENTER
    }
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}



//grab form input from desktop nav bar
$('.formDesktopNav').submit(function(event) {
  event.preventDefault();

  coffeeShopContent = [];
  var $cityNav = $('#chooseCity2').val();

  if ($cityNav.length === 0) {
    Materialize.toast('Please fill in search', 4000);
    return;
  }
  getCoffeeId($cityNav);
});



//grab form input from side nav bar
$('.formSideNav').submit(function(event) {
  event.preventDefault();

  coffeeShopContent = [];
  var $citySideNav = $('#chooseCity').val();

  if ($citySideNav.length === 0) {
    Materialize.toast('Please fill in search', 4000);
    return;
  }
  getCoffeeId($citySideNav);
});



// Response to get all venues near a city with a coffee shop Id
var getCoffeeId = function(city) {

  var $xhr = $.getJSON(`https://api.foursquare.com/v2/venues/search?client_id=UKXBEBLHQL3OZCTIRTNXWLGZZH3UBCV1PRHMYMJ2UOOUWVS5&client_secret=XRAB0PTCW1RDQMAU5W1S3YMSXTZUFUUV01CYHTWQHR2T0LCM&v=20130815&near=${city}&categoryId=4bf58dd8d48988d1e0931735&radius=3200`);

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
      var venueName = biz.name
      var address1 = biz.location.formattedAddress[0];
      var address2 = biz.location.formattedAddress[1];
      var address3 = biz.location.formattedAddress[2];
      var hours = biz.hours.status;
      var fourSquareVenueUrl = biz.shortUrl;

      var contentString = '<div class="infowindow"><h5>' + venueName + '</h5><p>' + address1 + '</p><p>' + address2 + '</p><p>' + address3 + '</p><p>' + hours + '</p><a href="fourSquareVenueUrl">' + venueName + '</a></div>';

      var myLatLng = new google.maps.LatLng(latitude, longitude);

      var infowindow = new google.maps.InfoWindow({
        content: contentString,
      });

      var marker = new google.maps.Marker({
        position: myLatLng,
        map: map
      });

      marker.addListener('click', function() {
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
      });

      // marker.addListener('mouseover', function() {
      //   infowindow.open(map, marker);
      // });
      //
      // marker.addListener('mouseout', function() {
      //   infowindow.close(map, marker);
      // });

      //put all lat long in array
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







//Start geolocation for desktop nav bar
$('#myLocNav').on('click', function(event) {

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
		alert('Geolocation is not supported in your browser');
	}
});
//End Geo location

//Start geolocation for desktop nav bar
$('#myLocSideNav').on('click', function(event) {

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
		alert('Geolocation is not supported in your browser');
	}
});
//End Geo location

// Get venues with wifi by user lat and lng
var getCoffeeIdByUserLatLng = function(userLat, userLng) {
  var $xhr = $.getJSON(`https://api.foursquare.com/v2/venues/search?client_id=UKXBEBLHQL3OZCTIRTNXWLGZZH3UBCV1PRHMYMJ2UOOUWVS5&client_secret=XRAB0PTCW1RDQMAU5W1S3YMSXTZUFUUV01CYHTWQHR2T0LCM&v=20130815&ll=${userLat},${userLng}&categoryId=4bf58dd8d48988d1e0931735&radius=3200`);

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
};







//
