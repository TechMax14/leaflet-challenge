// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Add a base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define a function to set the marker color based on depth
function getColor(depth) {
    if (depth <= -10) {
        return '#00ff00'; 
    } else if (depth <= 10) {
        return '#00ff00'; // Green
    } else if (depth < 30) {
        return '#ffff00'; // Yellow
    } else if (depth < 50) {
        return '#ff9900'; // Light Orange
    } else if (depth < 70) {
        return '#ff6600'; // Orange
    } else if (depth < 90) {
        return '#ff0000'; // Red
    } else {
        return '#990000'; // Dark Red
    }
}


// Use D3.js to fetch earthquake data from the API
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
    .then(function(data) {
        // Loop through the earthquake data and create markers
        L.geoJSON(data.features, {
            pointToLayer: function(feature, latlng) {
                var markerSize = feature.properties.mag * 5; // Adjust the size based on magnitude
                var markerColor = getColor(feature.geometry.coordinates[2]); // Get color based on depth
                return L.circleMarker(latlng, {
                    radius: markerSize,
                    fillColor: markerColor,
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup('Location: ' + feature.geometry.coordinates[1] + ', ' + feature.geometry.coordinates[0] + '<br>Magnitude: ' + feature.properties.mag + '<br>Depth: ' + feature.geometry.coordinates[2] + ' km');
            }
        }).addTo(map);
    });
    

// Create a legend
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    var depths = [-10, 10, 30, 50, 70, 90]; // Define depth ranges

    // Loop through depth ranges and create colored squares with labels
    for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
    }
    return div;
};

legend.addTo(map);

