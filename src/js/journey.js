
//import app from "./app.js";
import Framework7 from 'framework7/framework7.esm.bundle.js';

var Journeys = {
    baseUrl: "http://localhost:9191/v1/coverage",
    baseInstance: "default",

    getJourneyBetweenStops: function (fromPlace, toPlace, maxCount = 3, callback) {

        var from = [59.941710, 17.604303];
        var to = [59.725600, 17.787895];

        //console.log("UPDATE JOURNEY", self.toPlace);

        var journeyUrl = this.baseUrl + "/" + this.baseInstance + "/journeys?" +
            "from=" + fromPlace.place.id +
            "&to=" + toPlace.place.id +
            "&count=" + maxCount;

        Framework7.request({
            url: journeyUrl,
            method: 'GET',
            crossDomain: true,
            data: {
                format: "json",
                callback: function(){
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

                        console.log(sec);

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

                if(callback) callback(jss);
            }
        });
    }
};

export default Journeys;