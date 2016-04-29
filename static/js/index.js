var map = L.map('map').setView([41.883734, -87.628858], 13);
L.marker([41.883734, -87.628858]).addTo(map)
      .bindPopup('Chicago Loop')
      .openPopup();
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


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
                  var lat = coordinates.lat
                  var lng = coordinates.lng
                  console.log(lat)
                  console.log(lng)
                  map.panTo(new L.LatLng(lat, lng));
                  L.marker([lat, lng]).addTo(map)
            },
            error: function(error) {
                // alert(error);
            }
      });
});