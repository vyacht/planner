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
import Ux from './ux.js';

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

function getSectionLabel(section) {
    if (section.type == 'public_transport') {
        return section.name;
    } else if (section.type == 'transfer' || section.type == 'street_network') {
        return section.duration + "min";
    } else if ((section.type == 'crow_fly') && (section.mode == 'walking')) {
        return section.duration + "min";
    } else if (section.type == 'waiting') {
        return section.duration + "min";
    }
}

Template7.registerHelper('journeySectionChip', function (section) {

    var r = '<div class="chip">';
    r+= '<div class="chip-media bg-color-black">';
    r+= '   <i class="icon f7-icons if-not-md">plus_circle</i>';
    r+= '   <i class="icon material-icons md-only">' +
        Ux.getMaterialSectionIcon(section.type, section.mode) + '</i>';
    r+= '</div>';
    r+= '<div class="chip-label">' + getSectionLabel(section) + '</div>';
    r+= '</div>';

    return r;
});

Template7.registerHelper('formatCalendarDateTime', function (dateTime) {
    if(!dateTime) return '';
    return dateTime.calendar(null, {
        sameDay: '[Today] HH:mm',
        nextDay: '[Tomorrow] HH:mm',
        nextWeek: 'dddd, DD. HH:mm',
        lastDay: '[Yesterday] HH:mm',
        lastWeek: '[Last] dddd, DD. HH:mm',
        sameElse: 'D. MMM YYYY HH:mm'
    });
});

Template7.registerHelper('formatCalendarDate', function (dateTime) {
    if(!dateTime) return '';
    return dateTime.calendar(null, {
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd, DD. MMM',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd, DD. MMM',
        sameElse: 'D. MMM YYYY'
    });
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
            } else {
                // activate browser history
                f7.params.view.pushState = true;
            }
        },
    },
});

//export default app;
