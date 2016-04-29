init_lat = 41.883734
init_lng = -87.628858
var map = L.map('map').setView([init_lat, init_lng], 15);
var marker = L.marker([init_lat, init_lng]).addTo(map)
      .bindPopup('Chicago Loop')
      .openPopup();
var circle = L.circle([init_lat, init_lng], 1000).addTo(map);
var layer1 = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
})
  .setOpacity(0.9)
  .addTo(map);
var layer2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
})
  .setOpacity(0.6)
  .addTo(map);
var baseIcon = L.Icon.extend({
  options: {
    iconSize: [22, 27], // size of the icon
    //shadowSize: [51, 37], // size of the shadow
    iconAnchor: [16, 37], // point of the icon which will correspond to marker's location
    //shadowAnchor: [25, 37],  // the same for the shadow
    popupAnchor: [1, -37] // point from which the popup should open relative to the iconAnchor
  }
});

var schIcon = new baseIcon({ iconUrl: 'static/images/buildings.png' });
var libIcon = new baseIcon({ iconUrl: 'static/images/doe.png' });
var parksIcon = new baseIcon({ iconUrl: 'static/images/parks.png' });
var hosIcon = new baseIcon({ iconUrl: 'static/images/hpd.png' });
var crimeIcon = new baseIcon({ iconUrl: 'static/images/nypd.png' });
var get_values = function(lat, lng, radius){
  $.ajax({
    url: '/get_csv_values',
    data: JSON.stringify({'lat': lat, 'lng': lng, 'radius': radius}, null, '\t'),
    contentType: 'application/json;charset=UTF-8',
    type: 'POST',
    success: function(data) {
      var list = ""
      for (item in list){
    	  map.removeLayer(list[item])
    	}
    	list = JSON.parse(data)
      for (item in list){
    	  if(list[item]){
          path = list[item]['path']
          lat = list[item]['lat']
          lng = list[item]['lng']
          name = list[item]['name']
          if(lat!= null && lng != null){
            var icon = get_icon(path)
            L.marker([lat, lng],{icon: icon}).addTo(map)
              .bindPopup(name)
              .openPopup();
          }
        }
      };
    },
    error: function(error) {
      alert(error);
    }
  });
}
var get_icon = function(path){
  switch(path){
  	case 'crimefinal.csv':
  		return crimeIcon;
  	case 'hosfinal.csv':
  		return hosIcon;
  	case 'librariesfinal.csv':
  		return libIcon;
  	case 'schoolfinal.csv':
  		return schIcon;
  	case 'parksfinal.csv':
  		return parksIcon;
  	default:
  		return new L.Icon.Default();
	}
}
var markers = get_values(init_lat, init_lng, 15)
var get_qof = function(){
  var qof = 0
  $.ajax({
    url: '/ret_qof',
    data: JSON.stringify({'qof': qof}, null, '\t'),
    contentType: 'application/json;charset=UTF-8',
    type: 'POST',
    success: function(data) {
		  list = JSON.parse(data)
			console.log(list)
      console.log(qof)
		  document.getElementById("display").innerHTML = list['qof']
    },
    error: function(error) {
        alert(error);
    }
  });
}

$('#address').focusout(function(){
  var address=$('#address').val()
  console.log("Address: " + address)
  $.ajax({
    url: '/address',
    data: $('form').serialize(),
    type: 'POST',
    success: function(coordinates) {
      console.log("Coordinates: " + coordinates);
      var coordinates = JSON.parse(coordinates)
      lat = coordinates.lat
      lng = coordinates.lng
      console.log(lat)
      console.log(lng)
      c = new L.LatLng(lat, lng)
      map.panTo(c, 15);
      marker.setLatLng(c)
      circle.setLatLng(c)
      markers = get_values(lat, lng, 15)
    },
    error: function(error) {
        alert(error);
    }
  });
  get_qof()
});

$("#slider").on("slide", function( event, ui,qof ) {
  ui.value = qof
  //circle.setRadius(radius)
  //markers = get_values(lat, lng, radius)
});

// $(document).ready(function () {
//     var sevenDaysAgo;
//     //initialize the leaflet map, set options and view
//     var map = L.map('map', {
//         zoomControl: false,
//         scrollWheelZoom: false
//     })
//       .setView([40.705008, -73.995581], 15);

//     var markers = new L.FeatureGroup();

//     //add an OSM tileset as the base layer
//     L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
//         attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
//     }).addTo(map);

//     //call our getData() function.
//     getData();

//     //define a base icon
//     var baseIcon = L.Icon.extend({
//         options: {
//             shadowUrl: 'img/shadow.png',

//             iconSize: [32, 37], // size of the icon
//             shadowSize: [51, 37], // size of the shadow
//             iconAnchor: [16, 37], // point of the icon which will correspond to marker's location
//             shadowAnchor: [25, 37],  // the same for the shadow
//             popupAnchor: [1, -37] // point from which the popup should open relative to the iconAnchor
//         }
//     });

//     //define agency icons based on the base icon

//     var dsnyIcon = new baseIcon({ iconUrl: 'static/images/dsny.png' });
//     var fdnyIcon = new baseIcon({ iconUrl: 'static/images/fdny.png' });
//     var doeIcon = new baseIcon({ iconUrl: 'static/images/doe.png' });
//     var depIcon = new baseIcon({ iconUrl: 'static/images/dep.png' });
//     var dofIcon = new baseIcon({ iconUrl: 'static/images/dof.png' });
//     var dcaIcon = new baseIcon({ iconUrl: 'static/images/dca.png' });
//     var dohmhIcon = new baseIcon({ iconUrl: 'static/images/dohmh.png' });
//     var hpdIcon = new baseIcon({ iconUrl: 'static/images/hpd.png' });


//     function getData() {
//         //get map bounds from Leaflet
//         var bbox = map.getBounds();
//         //map.removeLayer(markers);
//         markers.clearLayers();
//         //create a SODA-ready bounding box that looks like: topLeftLat,topLeftLon,bottomRightLat,bottomRightLon
//         var sodaQueryBox = [bbox._northEast.lat, bbox._southWest.lng, bbox._southWest.lat, bbox._northEast.lng];

//         //figure out what the date was 7 days ago
//         var sevenDaysAgo = new Date();
//         sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//         $('#startDate').html(sevenDaysAgo.toDateString());

//         function cleanDate(input) {
//             return (input < 10) ? '0' + input : input;
//         }

//         //create a SODA-ready date string that looks like: 2014-11-01
//         sevenDaysAgo = sevenDaysAgo.getFullYear()
//                   + '-'
//                   + cleanDate((sevenDaysAgo.getMonth() + 1))
//                   + '-'
//                   + cleanDate((sevenDaysAgo.getDate() + 1));

//         //use jQuery's getJSON() to call the SODA API for NYC 311
//         //concatenate sodaQueryBox and sevenDaysAgo to add a $where clause to the SODA endpoint
//         $.getJSON(constructQuery(sevenDaysAgo, sodaQueryBox), function (data) {

//                 console.log(data)
//                       //iterate over each 311 complaint, add a marker to the map
//                       for (var i = 0; i < data.length; i++) {

//                           var marker = data[i];
//                           var icon = getIcon(marker);

//                           var markerItem = L.marker([marker.location.latitude, marker.location.longitude], { icon: icon });
//                           markerItem.bindPopup(
//                                           '<h4>' + marker.complaint_type + '</h4>'
//                                           + (new Date(marker.created_date)).toDateString()
//                                           + ((marker.incident_address != null) ? '<br/>' + marker.incident_address : '')
//                                     );
//                           markers.addLayer(markerItem);
//                       }
//             //.addTo(map);
//                       map.addLayer(markers);

//                   })
//     }

//     function constructQuery(sevenDaysAgo, sodaQueryBox) {
//         var originalstr = "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$select=location,closed_date,complaint_type,street_name,created_date,status,unique_key,agency_name,due_date,descriptor,location_type,agency,incident_address&$where=created_date>'"
//                   + sevenDaysAgo
//                   + "' AND within_box(location,"
//                   + sodaQueryBox
//                   + ")&$order=created_date desc"

//         var agency = $( "#nycAgency" ).val();
//         var conditiion = $("#conditions_list").val();
//         if (agency.length != 0 && agency != "All") {
//             originalstr = originalstr + "&agency=" + agency;
//         }
//         if (conditiion.length != 0 && conditiion != "All") {
//             originalstr = originalstr + "&complaint_type=" + conditiion;
//         }

//         console.log(originalstr);

//         return originalstr;
//     }


// //     function getIcon(thisMarker) {

// //         switch (thisMarker.agency) {
// //             case 'TLC':
// //                 return tlcIcon;
// //             case 'DOT':
// //                 return dotIcon;
// //             case 'DPR':
// //                 return parksIcon;
// //             case 'DOB':
// //                 return buildingsIcon;
// //             case 'NYPD':
// //                 return nypdIcon;
// //             case 'DSNY':
// //                 return dsnyIcon;
// //             case 'FDNY':
// //                 return fdnyIcon;
// //             case 'DOE':
// //                 return doeIcon;
// //             case 'DEP':
// //                 return depIcon;
// //             case 'DOF':
// //                 return dofIcon;
// //             case 'DCA':
// //                 return dcaIcon;
// //             case 'DOHMH':
// //                 return dohmhIcon;
// //             case 'HPD':
// //                 return hpdIcon;
// //             default:
// //                 return new L.Icon.Default();
// //         }
// //     }

// //     map.on('dragend', function (e) {
// //         getData();
// //     });

// //     $('#nycAgency').on("change", function () {
// //         getData();
// //     });

// //     $("#conditions_list").on('change keyup paste', function () {
// //         getData();
// //     });
// // });