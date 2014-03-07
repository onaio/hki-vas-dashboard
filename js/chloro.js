var MYAPP = {};

var setupOptions = {
    year: '2012',
    round: 2,
    code: 'pecs',
    name: 'PECs Coverage'
};

MYAPP.indicator = null;
MYAPP.datajson = null;
MYAPP.countryjson = null;

var years = [2011,2012,2013];
var rounds = [1,2];

var gen_key = function() {
    var k;
    k = MYAPP.indicator.year + '-' + MYAPP.indicator.round;
    return k;
};


function setYear(year,round) {
    MYAPP.indicator.year = year;
    MYAPP.indicator.round = round;
    var options = MYAPP.indicator;
    options.year = year;
    loadAfricaJSON(options);
};

var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/ona.hbgm1c4d/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
});

var map = L.map('map')
    .addLayer(mapboxTiles)
    .setView([0, 17], 4);


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
        : 'Hover over a country');
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
    //var key = MYAPP.indicator.year + '-' + MYAPP.indicator.round;
    var key = gen_key();
    var bcolor;
    if (feature.properties[key + 'level'] == 'national') {
        bcolor = '#fff';
    } else {
        bcolor = '#999';
    }

//    console.log(feature.properties[key + 'level']);

    if (feature.properties[key + '_' + MYAPP.indicator.code] > 0) {

    return {
        weight: 2,
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
            color: bcolor,
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

    if (MYAPP.countryjson === null) {
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
                            console.log(dataRegion);
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

loadPECSJSON();
//loadAfricaJSON();



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

buildPicker();

// Build Data Picker


