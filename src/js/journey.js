
//import app from "./app.js";
import Framework7 from 'framework7/framework7.esm.bundle.js';

var Journeys = {
    port: 5000,
    baseUrl: "http://localhost",
    instance: "default",
    apiVersion: "v1",

    getUrl() {
        return this.baseUrl + ":" + this.port + "/" + this.apiVersion + "/coverage/" + this.instance;
    },
    getJourneyBetweenStops: function (fromPlace, toPlace, maxCount, callback) {

        var from = [59.941710, 17.604303];
        var to = [59.725600, 17.787895];

        //console.log("UPDATE JOURNEY", self.toPlace);

        var journeyUrl = this.getUrl() + "/journeys?" +
            "from=" + fromPlace.place.id +
            "&to=" + toPlace.place.id +
            "&count=" + maxCount;

        Framework7.request({
            url: journeyUrl,
            method: 'GET',
            crossDomain: true,
            data: {
                format: "json",
                callback: function () {
                    return true;
                }
            },
            success: function (data) {

                var jss = [];
                var js = JSON.parse(data).journeys;

                //console.log(js);

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
                        var at = moment(ss.arrival_date_time, "YYYYMMDDThhmmss");
                        var dt = moment(ss.departure_date_time, "YYYYMMDDThhmmss");


                        var label = '';
                        if ('display_informations' in ss) {
                            //console.log("MISSING: ", ss);

                            label = ss.display_informations.name;
                            if (!label) {
                                label = ss.display_informations.label;
                            }
                        }

                        var sec = {
                            type: ss.type,
                            mode: ss.type == "public_transport" ?
                                ss.display_informations.commercial_mode : "",
                            duration: Math.round(ss.duration / 60),
                            name: label,
                            departureTime: dt.format("HH:mm"),
                            departurePlace: ss.type != "waiting" ? ss.from.name : "",
                            arrivalTime: at.format("HH:mm"),
                            arrivalPlace: ss.type != "waiting" ? ss.to.name : "",
                            inTime: at.fromNow()
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

                if (callback) callback(jss);
            }
        });
    },
    getPlaces: function (query, limit, callback) {
        var placesUrl = this.getUrl() + "/places";
        Framework7.request({
            url: placesUrl,
            method: 'GET',
            crossDomain: true,
            data: {
                format: "json",
                q: query,
                callback: function () {
                    return true;
                }
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
            data: {
                format: "json",
                callback: function () {
                    return true;
                }
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

        var getData = {
            format: "json",
            callback: function () {
                return true;
            }
        };

        if (page > 0) {
            getData.start_page = page;
        } else {
            llines = {};
        }

        //console.log("loop lines page = %d %s", page, stopSchedulesUrl);

        /* get all stop schedules that contain all lines */

        Framework7.request({
            url: stopSchedulesUrl,
            method: 'GET',
            crossDomain: true,
            data: getData,
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