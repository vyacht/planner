import $$ from 'dom7';
import Framework7 from 'framework7/framework7.esm.bundle.js';

import Template7 from 'template7';

// Import F7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.css';
// Import Cordova APIs
import cordovaApp from './cordova-app.js';
// Import Routes
import routes from './routes.js';

// Import main app component
import App from '../app.f7.html';

// restart webpack when registering new or change helper name!!!!
Template7.registerHelper('transportChipClick', function (id, label, filter, options) {
    var c = 'class="' + options.hash.class;
    if(filter && (filter == id)) 
        c += ' tcc-highlight';
    c += '"';

    var r = '<span ' + c +  ' ' +
        '@click=toggleLineFilter("' + id + '")>';
    r += label;
    r += '</span>';
    // console.log(id, filter, r);
    return r;
});

function makeMainDeparturesListItem(departure) {

    var icon = "";
    if(departure.type == "Bus") {
        icon = "directions_bus";
    } else {
        icon = "directions_train";
    }
    
    return '<li class="item-content">' + 
        '  <div class="item-inner">' +
        '    <div>' + 
        '      <i class="icon material-icons" style="background: white; color: #4285F4;">' + icon + '</i>' + 
        '      <span class="transport-chip">' + departure.label + '</span>' + 
        '      <div class="item-header"><span>' + departure.direction + '</span></div>' + 
        '      <div class="item-footer">' + departure.departureTime.format("HH:mm") + '</div>' + 
        '    </div>' +
        '  </div>' +
        '  <div class="item-after">' + departure.departureTime.fromNow() + '</div>' + 
        '</li>';
}

Template7.registerHelper('mainDepartureList', function (departures, filteredDepartures, filter) {

    var r = "";

    if(!filter) {
        for(var i= 0; (i < departures.length) && (i < 3); i++) {
            r+= makeMainDeparturesListItem(departures[i]); 
        };
        return r;
    }

    for(var i= 0; (i < filteredDepartures.length) && (i < 3); i++) {
        r+= makeMainDeparturesListItem(filteredDepartures[i]); 
    };
    return r;
});

var app = new Framework7({

    root: '#app', // App root element
    component: App, // App main component
    id: 'io.framework7.myapp', // App bundle ID
    name: 'gotland', // App name
    theme: 'auto', // Automatic theme detection

    // App routes
    routes: routes,

    // create a Store object for exchange of data between pages
    Store : {
        journey: {},
        journeyTo : {},
        journeyFrom : {},
    },

    // Input settings
    input: {
        scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
        scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
    },
    // Cordova Statusbar settings
    statusbar: {
        iosOverlaysWebView: true,
        androidOverlaysWebView: false,
    },
    on: {
        init: function () {
            var f7 = this;
            if (f7.device.cordova) {
                // Init cordova APIs (see cordova-app.js)
                cordovaApp.init(f7);
            }
        },
    },
});


    // onSuccess Callback
    // This method accepts a Position object, which contains the
    // current GPS coordinates
    //
    var onSuccess = function(position) {
        alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

//export default app;
