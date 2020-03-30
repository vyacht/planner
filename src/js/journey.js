
//import app from "./app.js";
import Framework7 from 'framework7/framework7.esm.bundle.js';

var Journeys = {
    apiVersion: "v1",

    /*
    port: 9191,
    baseUrl: "http://localhost",
    instance: "default",
    */

    port: null,
    baseUrl: "http://vyacht-api-01.westeurope.cloudapp.azure.com",
    instance: "default",

    // assemble the URL
    getUrl: function() {
        var url = this.baseUrl;
        if(this.port && this.port > 0) {
            url += ":" + this.port;
        }
        return url + "/" + this.apiVersion + "/coverage/" + this.instance;
    },
    // assemble basic request data
    getData: function() {
        var d = {
            format: "json",
            callback: function () {
                return true;
            }
        };
        if(this.username && this.username != "") {
            d.key = this.username;
        }
        return d;
    },
    getParamByPlaceType: function(place) {
        console.log("getParamByPlaceType", place);
        if(place.type == "stop_area") {
            return place.place.id;
        } else if (place.type == "current_position" ) {
            //return place.place.coord.lon + ";" + place.place.coord.lat;
            return "17.634303;59.94171";
        } else if (place.type == "poi" ) {
            return place.place.coord.lon + ";" + place.place.coord.lat;
        } else if (place.type == "administrative_region" ) {
            return place.place.coord.lon + ";" + place.place.coord.lat;
        }
    
    },
    getJourneyBetweenStops: function (fromPlace, toPlace, dateTime, dateTimeMode, maxCount, cbSuccess, cbError) {

        var from = [59.941710, 17.604303];
        var to = [59.725600, 17.787895];

        var self = this;

        /* console.log("UPDATE JOURNEY", fromPlace, toPlace, 
            dateTime, dateTime.format("YYYYMMDDTHHmmss")); */

        if(!fromPlace || !toPlace || !dateTimeMode) return;

        var journeyUrl = this.getUrl() + "/journeys?" +
            "from=" + self.getParamByPlaceType(fromPlace) +
            "&to=" + self.getParamByPlaceType(toPlace);

        if(dateTime) {
            journeyUrl += "&datetime=" + dateTime.format("YYYYMMDDTHHmmss");
        }

        if(dateTimeMode == "departure_after") {
            journeyUrl += "&datetime_represents=departure";
        } else if(dateTimeMode == "arrival_before") {
            journeyUrl += "&datetime_represents=arrival";
        }

        if(maxCount) {
            journeyUrl += "&count=" + maxCount;
        }

        /* 
            datetime = date times as local times of the coverage via an ISO 8601 “YYYYMMDDThhmmss” string
            datetime_represents = departure, arrival
        */
        //console.log("UPDATE JOURNEY", journeyUrl);
        Framework7.request({
            url: journeyUrl,
            method: 'GET',
            crossDomain: true,
            data: this.getData(),
            error: function(xhr, status) {
                
                var msg;
                if(xhr.response) {
                    var res = JSON.parse(xhr.response);
                    console.log("error: " + status, res);

                    if(res.error.id == "date_out_of_bounds") {
                        msg = "The given date is out of bounds of the production dates of the region";
                    } else if(res.error.id == "no_origin") {
                        msg = "Starting point seems to be outside region. No resulting journeys found.";
                    } else if(res.error.id == "no_destination") {
                        msg = "Destination point seems to be outside region. No resulting journeys found.";
                    } else if(res.error.id == "no_origin_nor_destination") {
                        msg = "Neither starting nor destination point seems to be outside region. No resulting journeys found.";
                    } else if(res.error.id == "unknown_object") {
                        msg = "No resulting journeys found.";
                    }                    
                } else {
                    msg = "No resulting journeys found.";
                }
                
                if(cbError) {
                    cbError(status, msg);
                }
            },
            success: function (data) {

                var jss = [];
                var js = JSON.parse(data).journeys;

                console.log(js);

                for (var i = 0; i < js.length; i++) {

                    var j = js[i];

                    if (j.sections.length <= 0) {
                        return; // nothing to do
                    }

                    var j1 = {
                        journey_from_station: j.sections[0].from.name,
                        journey_to_station: j.sections[j.sections.length - 1].to.name,
                        duration: Math.round(j.durations.total / 60.0) + "min",
                        sections: []
                    };

                    for (var s = 0; s < j.sections.length; s++) {
                        var ss = j.sections[s];

                        // there are weird sections from station to itself (waiting time?)
                        if (ss.duration == 0) continue;
                        var at = moment(ss.arrival_date_time, "YYYYMMDDTHHmmss");
                        var dt = moment(ss.departure_date_time, "YYYYMMDDTHHmmss");

                        var label = '';
                        if ('display_informations' in ss) {
                            label = ss.display_informations.name;
                            if (!label) {
                                label = ss.display_informations.label;
                            }
                        }

                        var mode = ""; 
                        if (ss.type == "public_transport") {
                            mode = ss.display_informations.commercial_mode;
                        } else if (ss.type == "crow_fly") {
                            mode = ss.mode;
                        }

                        var sec = {
                            type: ss.type,
                            mode: mode,
                            duration: Math.round(ss.duration / 60),
                            name: label,
                            departureTime: dt.format("HH:mm"),
                            departurePlace: ss.type != "waiting" ? ss.from.name : "",
                            departurePosition: ss.type == "public_transport" ? 
                                ss.from.stop_point.coord : null,
                            arrivalTime: at.format("HH:mm"),
                            arrivalPlace: ss.type != "waiting" ? ss.to.name : "",
                            arrivalPosition: ss.type == "public_transport" ? 
                                ss.to.stop_point.coord : null,
                            inTime: at.fromNow(),
                            geojson: ss.geojson
                        }

                        //console.log(sec);

                        j1.sections.push(sec);
                    }

                    if (j1.sections.length > 0) {
                        //console.log(j1);
                        j1.departureTime = j1.sections[0].departureTime;
                        j1.inTime = j1.sections[0].inTime;
                        j1.arrivalTime = j1.sections[j1.sections.length - 1].arrivalTime;
                        jss.push(j1);
                    }
                }

                if (cbSuccess) cbSuccess(jss);
            }
        });
    },
    getPlaces: function (query, limit, callback) {
        var placesUrl = this.getUrl() + "/places";
        var d = this.getData();
        d.q = query;

        Framework7.request({
            url: placesUrl,
            method: 'GET',
            crossDomain: true,
            data: d,
            error: function(xhr, status) {
                console.log("error: " + status);
            },
            success: function (data) {
                var places = JSON.parse(data).places;
                callback(places);
            }
        });

    },
    getDeparturesFromStopArea: function (stopArea, callback) {
        var self = this;
        var app = self.$app;

        var departuresUrl = this.getUrl() + "/stop_areas/"
            + stopArea.id + "/departures";

        Framework7.request({
            url: departuresUrl,
            method: 'GET',
            crossDomain: true,
            data: this.getData(),
            error: function(xhr, status) {
                console.log("error: " + status);
            },
            success: function (data) {
                var deps = [];
                //console.log(data);
                var departures = JSON.parse(data).departures;
                departures.forEach(e => {

                    var dt = moment(e.stop_date_time.departure_date_time,
                        "YYYYMMDDThhmmss");

                    var label = e.route.line.name;
                    if (!label) {
                        label = e.route.line.code;
                    }

                    deps.push({
                        direction: e.display_informations.direction,
                        type: e.display_informations
                            .commercial_mode, // Bus, Train, ...
                        id: e.route.line.id,
                        label: label,
                        departureTime: dt,
                    });
                });

                callback(deps);
            }
        });

    },
    /* from stop schedule for stop area:
       iteratively 
       - extract all lines from departures 
       - extract the departures by line 

       (departures by time are extracted with different call 
        departures by getDepartures() - good or bad?)
    */
    getLines: function (stopArea, callback) {

        var llines = {};
        var departures = [];

        this._getLines(stopArea, llines, departures, 0, callback);
    },
    _getLines: function (stopArea, llines, departures, page, callback) {

        var self = this;

        var stopSchedulesUrl =
            this.getUrl() + "/stop_areas/" +
            stopArea.id + "/stop_schedules";

        var d = this.getData();

        if (page > 0) {
            d.start_page = page;
        } else {
            llines = {};
        }

        //console.log("loop lines page = %d %s", page, stopSchedulesUrl);

        /* get all stop schedules that contain all lines */

        Framework7.request({
            url: stopSchedulesUrl,
            method: 'GET',
            crossDomain: true,
            data: d,
            error: function(xhr, status) {
                console.log("error: " + status);
            },
            success: function (data) {

                /*
                    we do extraction on labels for lines in two steps:
                    - lines are listed multiple times
                    - use a dictionary to get distinct lines ids and 
                      their print label (code or name)
                    - then transfer distinct lines to a normal array of 
                      objects for display

                    (this is because T7 can't do dicts imho)
                */
                var result = JSON.parse(data);
                result.stop_schedules.forEach(e => {
                    var l = e.route.line;

                    if (e.additional_informations != "no_departure_this_day") {
                        var type = l.commercial_mode.name;
                        var label = l.name;
                        if (!label) {
                            label = l.code;
                        }
                        if (!(type in llines)) llines[type] = [];
                        if (!(l.id in llines[type])) {
                            llines[type][l.id] = label;
                        }

                        var dts = [];
                        e.date_times.forEach(st => {
                            var dt = moment(st.date_time, "YYYYMMDDThhmmss");
                            dts.push(dt);
                        });

                        departures.push({
                            direction: e.display_informations.direction,
                            type: type,
                            lineId: l.id,
                            label: label,
                            departureTimes: dts,
                        });
                    }
                });

                if (result.pagination.items_on_page == result.pagination.items_per_page) {

                    self._getLines(stopArea, llines, departures, page + 1, callback);

                } else {
                    /* iterative loop stop condition */

                    callback(stopArea, llines, departures);
                }
            }
        });
    },

};

export default Journeys;