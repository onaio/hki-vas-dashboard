var MYAPP = {};

var VAS_INDICATORS = {
    vas_6_11: 'VAS (6-11m)',
    vas_12_59: 'VAS (12-59m)',
    vas_6_59: 'VAS (6-59m)',
    vas_6_59_m: 'VAS (6-59m) Male',
    vas_6_59_f: 'VAS (6-59m) Female',
    admin_pecs_6_59: 'Administrative Catchment (6-59m)',
    admin_nat_6_59: 'Administrative 6-59m',
    pecs_admin_delta: 'PECs Administrative &Delta;',
    dw_1259: 'Deworming (12-59m)'
};

L.mapbox.accessToken = 'pk.eyJ1Ijoib25hIiwiYSI6IlVYbkdyclkifQ.0Bz-QOOXZZK01dq4MuMImQ';
// Create a map in the div #map

var setupOptions = {
    year: '2012',
    round: 2,
    code: 'vas_6_59',
    name: VAS_INDICATORS['vas_6_59']
};

var googlelayer;

var years = [2011, 2012, 2013];

var rounds = [1,2];

var indicators = {};

var geojson;

var markersList = []
var markerLayerGroup;



// control that shows state info on hover
var info = L.control();

var layer_in_focus

// Map legend
var legend = L.control({position: 'bottomright'});

var colorPalette = ['#8DD3C7', '#FB8072', '#FFFFB3', '#BEBADA', '#80B1D3', '#FDB462', '#B3DE69', '#FCCDE5', '#D9D9D9',
    '#BC80BD', '#CCEBC5', '#FFED6F'];

var circleStyle = {
    color: '#fff',
    border: 8,
    fillColor: '#ff3300',
    fillOpacity: 0.9,
    radius: 8,
    opacity: 0.5
};


var gen_key = function() {
    var k;
    k = MYAPP.indicator.year + '-' + MYAPP.indicator.round;
    return k;
};


// sat - ona.j2pxecdi
// orig ona.dli0be29

//ona.dli0be29

var map = new L.Map('map', {
    minZoom: 0,
    maxZoom: 18,
    zoomControl: false,
    layers: [
        L.tileLayer('https://{s}.tiles.mapbox.com/v3/ona.sl2l0udi/{z}/{x}/{y}.png', {
        maxZoom: 7,
        minZoom: 0,
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }),
        L.tileLayer('https://{s}.tiles.mapbox.com/v3/ona.bb70t3xr/{z}/{x}/{y}.png', {
        maxZoom: 12,
        minZoom: 8,
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
      })
    ]
})
.setView([3,12],4)





var loadMap = function(isCountryJson) {
    if (map.hasLayer(geojson)) {
        map.removeLayer(geojson);
    }
    if (map.hasLayer(markerLayerGroup)) {
        markersList = [];
        map.removeLayer(markerLayerGroup);
    }
    if(isCountryJson) {
        geojson = L.geoJson(MYAPP.country_datajson, {
            style: style,
            onEachFeature: onEachFeature
        });
    } else {
        geojson = L.geoJson(MYAPP.pecs_datajson, {
            style: style,
            onEachFeature: onEachFeature
        });
    }
    map.addLayer(geojson);

    markerLayerGroup = L.layerGroup(markersList);
    markerLayerGroup.addTo(map);
};

MYAPP.indicator = null;
MYAPP.country_datajson = null;
MYAPP.pecs_datajson = null;
MYAPP.countryjson = null;



function setReportParameters(year,round, category) {
    var category_button = $("#category-button")
    if (category === undefined || category === 'vita') {
        category_button.text("Vitamin A ")
    } else if (category === 'deworming') {
        category_button.text("Deworming ")
    }
    category_button.append("<span class='caret'></span>")

    MYAPP.indicator.year = year;
    MYAPP.indicator.round = round;
    MYAPP._category = category
    var options = MYAPP.indicator;
    options.year = year;
    loadJSONData();
};

function selectIndicator(selector, indicator) {
    if (indicator === undefined || indicator === null) {
        indicator = setupOptions.code;
    }
    MYAPP.indicator.code = indicator;
    MYAPP.indicator.name = VAS_INDICATORS[indicator];

    loadJSONData();
    $('#indicator-list').find('ul li.selected').removeClass('selected');
    $(selector).parent().addClass('selected');

    return MYAPP.indicator;
};

function loadJSONData(){
    if (MYAPP.indicator.code === 'admin_nat_6_59') {
        loadCountryJSON(MYAPP.indicator);
    } else {
        loadPECSJSON(MYAPP.indicator);
        if(layer_in_focus !== null || layer_in_focus === undefined) {
            var zoomLevel = map.getZoom();
            if(zoomLevel < 7) {
                clearPointLayers();
            } else {
                loadPointLayers();
            }
        }
    }
    buildLegend();
}

function createJSONFile(json) {
    var geojsonfile = JSON.stringify(json);

    var blob = new Blob([geojsonfile], {type: "application/json"});
    var url  = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.download    = "backup.json";
    a.href        = url;
    a.textContent = "Download backup.json";
    document.getElementById('content').appendChild(a);

};

/*
var map = L.map('map',
    {
        minZoom: '3',
        maxZoom: '17'
    }
    )
    .addLayer(hkiTiles)
    .setView([3, 12], 4);
*/


//ona.hg740ono


new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    var level_note,
        indicator_desc = [],
        key = gen_key();

    if (typeof props !== "undefined") {
        if (typeof props[key + '_' + MYAPP.indicator.code] === "undefined") {
            indicator_desc = 'Not Available';
        } else {
            $.each(VAS_INDICATORS, function(code, desc){

                if(MYAPP.indicator.code !== code) {

                    if(props[key + '_' +code] !== undefined) {
                        indicator_desc.push(desc + ': ' + props[key + '_' +code] + "%");
                    }
                } else {
                    indicator_desc.push('<strong>' + desc + ': ' + props[key + '_' + code] + "%</strong>");
                }
            });

            //indicator_desc = indicator_desc.slice(0, 5);
            indicator_desc = indicator_desc.join('<br/>');
        }
        if (props.level == 'catchment') {
            level_note = '(Catchment)';
        } else {
            level_note = '';
        }
    }
    this._div.innerHTML = '<h4>' + MYAPP.indicator.year
        + ' (Round ' + MYAPP.indicator.round + ')</h4>'
        + (props ?
        '<b>' + props.name + ' ' + level_note + '</b><br />' + indicator_desc
        : 'Hover over an area');
};


// set country colors

function getColor(d) {

    if (MYAPP.indicator.code != 'pecs_admin_delta') {
        return d > 90 ? '#2ECC40' :
               d > 80 ? '#FFDC00' :
               d > 0 ? '#FF4136' :
                '#ccc';
            }
    else {
        return d > 20 ? '#FF4136' :
               d > 10 ? '#FFDC00' :
               d > 0 ? '#2ECC40' :
               '#ccc';
    }
};



// style country

function style(feature) {
    //console.log(map.getZoom())
    var key = gen_key();
    var bcolor;
    var opacity;
    var color;
    var lineWeight;

    if (feature.properties[key + 'level'] == 'national') {
        bcolor = '#fff';
    } else {
        bcolor = '#999';
    }

    if (feature.properties[key + '_' + MYAPP.indicator.code] > 0) {
    var zoom = map.getZoom();
    if (zoom > 8) {
      opacity = 0.1;
      color: '#000';
      lineWeight = 3;

    } else {
      opacity = 0.5;
      color: '#fff';
      lineWeight = 0;
    }

    return {
        weight: lineWeight,
        opacity: 1,
        color: '#fff',
        dashArray: '',
        fillOpacity: opacity,
        fillColor: getColor(feature.properties[key + '_' +MYAPP.indicator.code])
    }

    } else {
        return {
            weight: lineWeight,
            opacity: 1,
            color: '#fff',
            dashArray: '',
            fillOpacity: 0.0,
            fillColor: getColor(feature.properties[key + '_' +MYAPP.indicator.code])
        }
    }
};

// style highlighted country

function highlightFeature(e) {
    var layer = e.target;

    var zoom = map.getZoom();
    if (zoom > 9) {
    opacity = 0.1;
  } else {
    opacity = 0.7;
  }

    layer.setStyle({
        weight: 3,
        color: '#fff',
        dashArray: '',
        fillOpacity: opacity
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
};

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
};

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
};

function onEachFeature(feature, layer) {
    var lat,
        lng,
        latlng,
        icon,
        marker;
    lat = feature.properties[gen_key() + '_pecs_lat']
    lng = feature.properties[gen_key() + '_pecs_long']
    if(!isNaN(lat) && !isNaN(lng)) {
        latlng = L.latLng(lat, lng);
        icon = L.MakiMarkers.icon({icon: "circle-stroked", color: "#1087bf", size: "m"});
        //icon = L.mapbox.marker.icon({'marker-color': '#f86767'});


        //icon = L.mapbox.marker.icon({'marker-color': '#f86767'});


        //marker = L.marker(latlng, {icon: icon});


      marker = L.marker(latlng, {
    icon: L.mapbox.marker.icon({
        'marker-size': 'small',
        'marker-color': '#fa0'
    })
})


        marker.layer = layer;
        marker.on('click', function(e){
            layer = e.target.layer;
            map.fitBounds(layer.getBounds());
            layer_in_focus = layer;
            loadPointLayers();
        });
        markersList.push(marker);
    }
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
};

function loadCountryJSON(options) {
        if (options === undefined || options === null) {
        options = setupOptions;
    }

    MYAPP.indicator = options;

    try {
        map.removeControl(info);
    } catch (e) {}
    info.addTo(map);

    if (MYAPP.country_datajson === null) {
        d3.csv("data/hki-vas-data.csv", function (data) {
            var allyears;
            d3.json("data/africa.json", function (json) {
                var all_data = {};
                for (var i = 0; i < data.length; i++) {
                    var row = data[i];
                    var key = row.year + '-' + row.round;

                    var dataCountry = data[i].iso_a2;
                    var years = [2011,2012,2013,2014];
                    var rounds = [1,2];

                    for (var j = 0; j < json.features.length; j++) {
                        var jsonCountry = json.features[j].properties.iso_a2;
                        if (dataCountry == jsonCountry) {
                            //Copy the data value into the JSON
                            json.features[j].properties[key + '_admin_nat_6_59'] = parseFloat(data[i].admin_nat_6_59);
                            json.features[j].properties[key + '_level'] = data[i].level;
                            //Stop looking through the JSON
                            break;
                        }
                    }
                }

                MYAPP.country_datajson = json;

                loadMap(true);
            });
        });
    } else {
        loadMap(true);
    }

};


function loadPECSJSON(options) {
    if (options === undefined || options === null) {
        options = setupOptions;
    }

    MYAPP.indicator = options;

    try {
        map.removeControl(info);
    } catch (e) {}
    info.addTo(map);

    if (MYAPP.pecs_datajson === null) {

        d3.csv("data/hki-vas-data.csv", function (data) {
            var allyears;

            d3.json("data/hki-pecs-40.geojson", function (json) {
                var all_data = {};
                for (var i = 0; i < data.length; i++) {
                    var row = data[i];
                    var key = row.year + '-' + row.round;

                    var admin_field = data[i].admin_field;

                    var dataRegion = data[i].admin_code;
                    var years = [2011,2012,2013,2014];
                    var rounds = [1,2];

                    for (var j = 0; j < json.features.length; j++) {
                        var jsonRegion = json.features[j].properties[admin_field];

                        if (dataRegion == jsonRegion) {

                            //Copy the data value into the JSON
                            json.features[j].properties[key + '_pecs'] = parseFloat(data[i].pecs);
                            json.features[j].properties[key + '_vas_6_11'] = parseFloat(data[i].vas_6_11);
                            json.features[j].properties[key + '_vas_12_59'] = parseFloat(data[i].vas_12_59);
                            json.features[j].properties[key + '_vas_6_59'] = parseFloat(data[i].vas_6_59);
                            json.features[j].properties[key + '_vas_6_59_f'] = parseFloat(data[i].vas_6_59_f);
                            json.features[j].properties[key + '_vas_6_59_m'] = parseFloat(data[i].vas_6_59_m);
                            json.features[j].properties[key + '_dw_1259'] = parseFloat(data[i].dw_1259);
                            json.features[j].properties[key + '_admin_pecs_6_59'] = parseFloat(data[i].admin_pecs_6_59);
                            //json.features[j].properties[key + '_pecs_admin_delta'] = parseFloat(data[i].pecs_admin_delta);
                            json.features[j].properties[key + '_pecs_admin_delta'] = parseFloat(data[i].pecs_admin_delta_positive);
                            json.features[j].properties[key + '_admin_nat_6_59'] = parseFloat(data[i].admin_nat_6_59);
                            json.features[j].properties[key + '_pecs_lat'] = parseFloat(data[i].pecs_lat);
                            json.features[j].properties[key + '_pecs_long'] = parseFloat(data[i].pecs_long);
                            json.features[j].properties[key + '_level'] = data[i].level;
                            //Stop looking through the JSON
                            break;
                        }
                    }
                }

                MYAPP.pecs_datajson = json;

                // create JSON File
                //createJSONFile(MYAPP.datajson);
                loadMap(false);
            });
        });
    } else {
        loadMap(false);
    }

};

loadPECSJSON();
//loadAfricaJSON();



map.on('zoomend', function(event){


    var zoomLevel = event.target.getZoom();

    if(zoomLevel < 7) {
        clearPointLayers();
    }
    if(zoomLevel === 8) {

       if(typeof googlelayer === 'undefined') {
          var googlesat = new L.Google;
          var google = L.layerGroup([googlesat]).addTo(map);
          googlelayer = google;
       } else {
         googlelayer.addTo(map);
       }

    }


    if (zoomLevel === 7) {
      console.log(googlelayer);
    // need to figure out how to remove layer!!

      if (googlelayer) {
      //  console.log("z"+zoomLevel+"fire")
      map.removeLayer(googlelayer);

    }

  }
}
);

var pointLayers = [];

function clearPointLayers() {
    if(pointLayers.length > 0) {
        for(i=0; i<pointLayers.length; i++) {
            if (map.hasLayer(pointLayers[i])) {
                map.removeLayer(pointLayers[i]);
            }
        }
        pointLayers = [];
    }
}

function loadPointLayers() {
    var period = gen_key(),
        icon,
        circlemarker,
        icon_type,
        code_hasc,
        csv_file,
        layer,
        category;
    clearPointLayers();
    if(layer_in_focus === null || layer_in_focus === undefined) {
        return;
    }
    code_hasc = layer_in_focus.feature.properties['code_hasc'];
    csv_file = 'data/pecs/' + code_hasc + '-' + period + '.csv';
    layer = omnivore.csv(csv_file).on('error', function() {
        console.log(">>>>>>>>>>>> FILE NOT FOUND")
    });

    $.each([ 'vita', 'deworming' ], function( index, value ) {
        $('#' + value).attr('onclick', "setReportParameters(" + MYAPP.indicator.year + "," + MYAPP.indicator.round + ", \'" + value + "\');return false;") 
    });

    if(layer) {
        layer.options.pointToLayer = function(feature, latlng) {
            category = feature.properties['vita']
            if (MYAPP._category !== undefined) {
                category = feature.properties[MYAPP._category]
            }
            var color = "green";
            if(category === "0") {
                color = "red"
            } else if (category === "88") {
                // color cadetblue indicates area not covered
                color = "cadetblue";
            } 
            icon = (feature.properties['gender'] == '1') ? 'male' : 'female'
            var pointIcon = L.AwesomeMarkers.icon({
                prefix: 'fa',
                icon: icon,
                markerColor: color,
                iconColor: 'black'
              });
            return L.marker(latlng, {icon: pointIcon}).addTo(map);
        };
        layer.addTo(map)
        pointLayers.push(layer);
    } else {
        return;
    }
}

function heatMap() {
    var latlngs = [];
    layer = omnivore.csv('data/pecs/CM.LT-2013-1.csv');


    //var latlngs = layer.getLatLngs();
    //console.log(latlngs);


    //var heat = L.heatLayer(latlngs, {radius: 25}).addTo(map);

}

// heatMap();

// var heat = L.heatLayer(pointLayer, {radius: 25}).addTo(map);

//pointLayer.addTo(map);

//pointToLayer: function(feature, latlng) {
//            var marker = L.circleMarker(latlng, circleStyle);
//            latLngArray.push(latlng);




/*
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJson(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, circleStyle);
    }
}).addTo(map);
*/

// Build Legend

function buildLegend () {
    if(legend.getContainer() !== undefined) {
        legend.removeFrom(map);
    }

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            labels = [];
        if (MYAPP.indicator.code != 'pecs_admin_delta') {
            labels.push('<i style="background:#2ECC40"></i> 90&ndash;100%');
            labels.push('<i style="background:#FFDC00"></i> 80&ndash;89%');
            labels.push('<i style="background:#FF4136"></i> < 80%');
        } else {
            labels.push('<i style="background:#FF4136"></i> 20&ndash;100%');
            labels.push('<i style="background:#FFDC00"></i> 10&ndash;20%');
            labels.push('<i style="background:#2ECC40"></i> 0&ndash;10%');
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);
};

function buildPicker() {

    var picker = L.control({position: 'topleft'});

    picker.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            labels = [];
        for (y = 0; y < years.length; y++) {
            for (r = 0; r < rounds.length; r++) {
                labels.push('<a href="#" onclick="setReportParameters(' + years[y] + ',' + rounds[r] + ');return false;">' + years[y] + ' Round ' + rounds[r] + '</a>');
            }
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };

    picker.addTo(map);
};

function buildSelector() {

    var selector = L.control({position: 'topleft'});

    selector.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            dropdown = "<div class='btn-group'>"+
              "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' aria-expanded='false' id='category-button'>" +
                "Vitamin A <span class='caret'></span>" +
              "</button>" +
              "<ul class='dropdown-menu' role='menu'>" +
                "<li><a id='vita'>Vitamin A</a></li>" +
                "<li class='divider'></li>" +
                "<li><a id='deworming'>Deworming</a></li>" +
              "</ul>" +
            "</div>";

        div.innerHTML = dropdown;
        return div;
    };

    selector.addTo(map);
};

//map.on("zoomend", function (e) { console.log("ZOOMEND", map.getZoom()); });

buildLegend();
buildSelector();
//buildPicker();
