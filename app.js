'use strict';


// Declare variables and create empyt arrays
var coffeeShopId = [];
var coffeeShopContent = [];
var allLatLng = []; //returned from the API
var allMarkers = [];
var map;
var infowindow;

function initMap() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 8,
    center: new google.maps.LatLng(47.6062, -122.3321),
    panControl: false,
    panControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_LEFT
    },
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE,
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: false
  });
}

//grab form data from desktop nav bar
$('.formDesktopNav').submit(function(event) {

  coffeeShopContent = [];
  var $city = $('#chooseCity2').val();
  event.preventDefault();

  if ($city.length === 0) {
    Materialize.toast('Please fill in search', 4000);
    return;
  }

  var getCoffeeId = function(city) {

    var $xhr = $.getJSON(`https://api.foursquare.com/v2/venues/search?client_id=UKXBEBLHQL3OZCTIRTNXWLGZZH3UBCV1PRHMYMJ2UOOUWVS5&client_secret=XRAB0PTCW1RDQMAU5W1S3YMSXTZUFUUV01CYHTWQHR2T0LCM&v=20130815&near=${city}&categoryId=4bf58dd8d48988d1e0931735&radius=3200`);

    $xhr.done(function(categoryId) {
      if ($xhr.status !== 200) {
          return;
      }
      var venueIds = categoryId.response.venues;
      // console.log(contents.response.venues);

      for (var venueId of venueIds) {
        var venue = {
          id: venueId.id
        };
        coffeeShopId.push(venue);
        getCoffeeContent(venue);
      }
    });
  };
  getCoffeeId($city);


  // RESPONSE CHECKING FOR COFFEE SHOP WIFI ACCESS - yes or no
  var getCoffeeContent = function(venue) {

    var $xhr2 = $.getJSON(`https://api.foursquare.com/v2/venues/${venue.id}?client_id=UKXBEBLHQL3OZCTIRTNXWLGZZH3UBCV1PRHMYMJ2UOOUWVS5&client_secret=XRAB0PTCW1RDQMAU5W1S3YMSXTZUFUUV01CYHTWQHR2T0LCM&v=20130815`);

    $xhr2.done(function(contents) {
      if ($xhr2.status !== 200) {
        return;
      }
      //grabs all data of each venue
      var biz = contents.response.venue;
      hasWifi(biz);

      if (hasWifi(biz) === true) {
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
          content: contentString
        });
        var marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
        });
        marker.addListener('click', function() {
          console.log('clicked');
          infowindow.setContent(contentString);
          infowindow.open(map, marker);
        });

        //put all lat long in array
				allLatLng.push(myLatLng);
      }
    });
  };

	//  Make an array of the LatLng's of the markers you want to show
	//  Create a new viewpoint bound
	var bounds = new google.maps.LatLngBounds ();
	//  Go through each...
	for (var i = 0, LtLgLen = allLatLng.length; i < LtLgLen; i++) {
	  //  And increase the bounds to take this point
	  bounds.extend (allLatLng[i]);
	}
	//  Fit these bounds to the map
	map.fitBounds (bounds);
});


//grab form data from side nav bar
// $('.formSideNav').submit(function(event) {
//
//   coffeeShopContent = [];
//   var $city = $('#chooseCity').val();
//   event.preventDefault();
// console.log($city);
//
//   if ($city.length === 0) {
//     Materialize.toast('Please fill in search', 4000);
//     return;
//   }
//
//   var getCoffeeId = function(city) {
//
//     var $xhr = $.getJSON(`https://api.foursquare.com/v2/venues/search?client_id=UKXBEBLHQL3OZCTIRTNXWLGZZH3UBCV1PRHMYMJ2UOOUWVS5&client_secret=XRAB0PTCW1RDQMAU5W1S3YMSXTZUFUUV01CYHTWQHR2T0LCM&v=20130815&near=${city}&categoryId=4bf58dd8d48988d1e0931735`);
//
//     $xhr.done(function(categoryId) {
//       if ($xhr.status !== 200) {
//           return;
//       }
//       var venueIds = categoryId.response.venues;
//       // console.log(contents.response.venues);
//
//       for (var venueId of venueIds) {
//         var venue = {
//           id: venueId.id
//         };
//         coffeeShopId.push(venue);
//         getCoffeeContent(venue);
//       }
//     });
//   };
//   getCoffeeId($city);
//
//
//   // RESPONSE CHECKING FOR COFFEE SHOP WIFI ACCESS - yes or no
//   var getCoffeeContent = function(venue) {
//
//     var $xhr2 = $.getJSON(`https://api.foursquare.com/v2/venues/${venue.id}?client_id=UKXBEBLHQL3OZCTIRTNXWLGZZH3UBCV1PRHMYMJ2UOOUWVS5&client_secret=XRAB0PTCW1RDQMAU5W1S3YMSXTZUFUUV01CYHTWQHR2T0LCM&v=20130815&near=seattle`);
//
//     $xhr2.done(function(contents) {
//       if ($xhr2.status !== 200) {
//         return;
//       }
//       //grabs all data of each venue
//       var biz = contents.response.venue;
//       hasWifi(biz);
//
//       if (hasWifi(biz) === true) {
//         coffeeShopContent.push(biz.name);
//         var latitude = biz.location.lat;
//         var longitude = biz.location.lng;
//         myLatLng = new google.maps.LatLng(latitude, longitude);
//         allMarkers = new google.maps.Marker({
//           position: myLatLng,
//           map: map,
//           html:
// 						'<div>' +
// 						'<h1>' + biz.name + '</h1>' +
// 						'<h3>' + biz.location.formattedAddress[0] + '</h3>' +
// 						'<p>' + biz.location.formattedAddress[1] + '</p>' +
// 						'<p>' + biz.location.formattedAddress[2] + '</p>' +
// 						'</div>'
//         });
//         //put all lat long in array
// 				allLatLng.push(myLatLng);
//       }
//     });
//   };
//
//   google.maps.event.addListener(allMarkers, 'click', function () {
//     console.log(this);
// 		infowindow.setContent(this.html);
// 		infowindow.open(map, this);
// 	});
//
//   //console.log(allLatlng);
// 	//  Make an array of the LatLng's of the markers you want to show
// 	//  Create a new viewpoint bound
// 	var bounds = new google.maps.LatLngBounds ();
// 	//  Go through each...
// 	for (var i = 0, LtLgLen = allLatLng.length; i < LtLgLen; i++) {
// 	  //  And increase the bounds to take this point
// 	  bounds.extend (allLatLng[i]);
// 	}
// 	//  Fit these bounds to the map
// 	map.fitBounds (bounds);
//
//
//
//
//   // filter venues on whether or not they have wifi with a boolean of true/false
//   var hasWifi = function(biz) {
//     var properties = biz.attributes.groups;
//     return properties.filter(function(prop) {
//       return prop.name === 'Wi-Fi' && prop.items[0].displayValue === 'Yes';
//     }).length > 0;
//   };
// });

// filter venues on whether or not they have wifi with a boolean of true/false
var hasWifi = function(biz) {
  var properties = biz.attributes.groups;
  return properties.filter(function(prop) {
    return prop.name === 'Wi-Fi' && prop.items[0].displayValue === 'Yes';
  }).length > 0;
};






















//
