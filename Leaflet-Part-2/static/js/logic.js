// Initialize the map
var map = L.map('map').setView([0, 0], 2);

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

var baseMaps = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    'Topographic Map': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© <a href="https://www.arcgis.com/">Esri</a> contributors'
    })
};

// Create an overlay maps object with separate layers for earthquakes and tectonic plates
var overlayMaps = {
    'Earthquakes': L.layerGroup(),
    'Tectonic Plates': L.layerGroup()
};

// Add the base layers to the map
baseMaps['OpenStreetMap'].addTo(map);

// Fetch earthquake data and add it to the Earthquakes overlay
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
    .then(function(earthquakeData) {
        // Loop through the earthquake data and create markers
        L.geoJSON(earthquakeData.features, {
            pointToLayer: function(feature, latlng) {
                var markerSize = feature.properties.mag * 5;
                var markerColor = getColor(feature.geometry.coordinates[2]);
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
                layer.bindPopup('Location: ' + feature.geometry.coordinates[1] + ', ' + feature.geometry.coordinates[0] +
                    '<br>Magnitude: ' + feature.properties.mag + '<br>Depth: ' + feature.geometry.coordinates[2] + ' km');
            }
        }).addTo(overlayMaps['Earthquakes']);
    });

// Fetch tectonic plate data and add it to the Tectonic Plates overlay
d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
    .then(function(plateData) {
        // Create a layer for tectonic plates
        var tectonicPlates = L.geoJSON(plateData, {
            style: {
                color: 'red', // You can customize the line color and other properties here
                weight: 2
            }
        });

        tectonicPlates.addTo(overlayMaps['Tectonic Plates']);
    });

// Create layer controls to allow toggling between overlays
L.control.layers(baseMaps, overlayMaps).addTo(map);

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

