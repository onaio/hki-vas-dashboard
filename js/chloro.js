var MYAPP = {};

var setupOptions = {
    year: '2012',
    round: 2,
    code: 'vas_6_59',
    name: 'VAS (6-59m)'
};

MYAPP.indicator = null;
MYAPP.datajson = null;
MYAPP.countryjson = null;

var years = [2011,2012,2013];
var rounds = [1,2];

var indicators = {};


var gen_key = function() {
    var k;
    k = MYAPP.indicator.year + '-' + MYAPP.indicator.round;
    return k;
};

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

function setYear(year,round) {
    MYAPP.indicator.year = year;
    MYAPP.indicator.round = round;
    var options = MYAPP.indicator;
    options.year = year;
    loadAfricaJSON(options);
};

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

var hkiTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/ona.swgn9udi/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
});

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

var map = new L.Map('map', {
minZoom: 0,
maxZoom: 18,
zoomControl: false,
layers: [
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/ona.vdv7k3xr/{z}/{x}/{y}.png', {
    maxZoom: 9,
    minZoom: 0,
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
}),
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/ona.hbgm1c4d/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 10,
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
})]
})
.setView([3,12],4);


new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    var level_note;
    var val;
    var key = gen_key();
    if (typeof props != "undefined") {
        if (typeof props[key + '_' +MYAPP.indicator.code] === 'undefined') {
            val = 'Not Available';
        } else {
            val = props[key + '_' +MYAPP.indicator.code] + "%";
        }
        if (props.level == 'catchment') {
            level_note = '(Catchment)';
        } else {
            level_note = '';
        }
    }
    this._div.innerHTML = '<h4>' + MYAPP.indicator.name + '</h4>'
        + '<h4>' + MYAPP.indicator.year + ' (Round ' + MYAPP.indicator.round + ')</h4>'
        + (props ?
        '<b>' + props.name + ' ' + level_note + '</b><br />' + val
        : 'Hover over an area');
};


// set country colors

function getColor(d) {
    return d > 90 ? '#2ECC40' :
        d > 80 ? '#FFDC00' :
            d > 0 ? '#FF4136' :
                '#ccc';
}

// style country

function style(feature) {
    var key = gen_key();
    var bcolor;
    if (feature.properties[key + 'level'] == 'national') {
        bcolor = '#fff';
    } else {
        bcolor = '#999';
    }

    if (feature.properties[key + '_' + MYAPP.indicator.code] > 0) {

    return {
        weight: 1,
        opacity: 1,
        color: '#fff',
        dashArray: '',
        fillOpacity: 0.5,
        fillColor: getColor(feature.properties[key + '_' +MYAPP.indicator.code])
    }

    } else {
        return {
            weight: 0,
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

    layer.setStyle({
        weight: 3,
        color: '#fff',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
};


var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
};

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
};

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
};

function loadAfricaJSON(options) {
    if (options === undefined || options === null) {
        options = setupOptions;
    }


    MYAPP.indicator = options;

    try {
        map.removeControl(info);
    } catch (e) {}
    info.addTo(map);

    var callback = function (first) {
        if (map.hasLayer(geojson)) {
            map.removeLayer(geojson);
        }
        geojson = L.geoJson(MYAPP.datajson, {
            style: style,
            onEachFeature: onEachFeature
        });
        map.addLayer(geojson);

    };



    if (MYAPP.datajson === null) {
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
                            json.features[j].properties[key + '_pecs'] = parseFloat(data[i].pecs);
                            json.features[j].properties[key + '_admin_coverage'] = parseFloat(data[i].admin_coverage);
                            json.features[j].properties[key + '_pecs_admin_delta'] = parseFloat(data[i].pecs_admin_delta);
                            json.features[j].properties[key + '_level'] = data[i].level;
                            //Stop looking through the JSON
                            break;
                        }
                    }
                }

                MYAPP.datajson = json;

                if (callback !== null) {
                    callback(true);
                }
            });
        });
    } else {
        if (callback !== null) {
            callback(false);
        }
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

    var callback = function (first) {
        if (map.hasLayer(geojson)) {
            map.removeLayer(geojson);
        }
        geojson = L.geoJson(MYAPP.datajson, {
            style: style,
            onEachFeature: onEachFeature
        });
        map.addLayer(geojson);

    };

    if (MYAPP.datajson === null) {

        d3.csv("data/hki-vas-data.csv", function (data) {
            var allyears;
            d3.json("data/hki-pecs.geojson", function (json) {
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
                            json.features[j].properties[key + '_admin_pecs_6_59'] = parseFloat(data[i].admin_pecs_6_59);
                            json.features[j].properties[key + '_pecs_admin_delta'] = parseFloat(data[i].pecs_admin_delta);
                            json.features[j].properties[key + '_admin_nat_6_59'] = parseFloat(data[i].admin_nat_6_59);
                            json.features[j].properties[key + '_level'] = data[i].level;
                            //Stop looking through the JSON
                            break;
                        }
                    }
                }
               
                MYAPP.datajson = json;
                
                // create JSON File
                //createJSONFile(MYAPP.datajson);

                if (callback !== null) {
                    callback(true);
                }
            });
        });
    } else {
        if (callback !== null) {
            callback(false);
        }
    }

};

loadPECSJSON();
//loadAfricaJSON();



//var pointLayer = omnivore.csv('data/pecs/2013-1-CM.LT.csv')
//.addTo(map);


//var heat = L.heatLayer(pointLayer, {radius: 25}).addTo(map);

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
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = [];

        labels.push('<i style="background:#2ECC40"></i> 90&ndash;100%');
        labels.push('<i style="background:#FFDC00"></i> 80&ndash;89%');
        labels.push('<i style="background:#FF4136"></i> < 80%');

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
                labels.push('<a href="#" onclick="setYear(' + years[y] + ',' + rounds[r] + ');return false;">' + years[y] + ' Round ' + rounds[r] + '</a>');
            }
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };

    picker.addTo(map);
};


buildLegend();
//buildPicker();



// Build Data Picker

