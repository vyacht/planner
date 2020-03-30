var Utils = {
    geocodeReverse: function() {
        // https://nominatim.openstreetmap.org/reverse?lat=59.492934&lon=17.987616&format=json
    },
    geocoder: function() {
        // https://nominatim.openstreetmap.org/search?city=Sollentuna&country=Sweden&format=json
        // https://nominatim.org/release-docs/latest/
        /*
            q=<query>

            street=<housenumber> <streetname>
            city=<city>
            county=<county>
            state=<state>
            country=<country>
            postalcode=<postalcode>
        */
    },
    geolocationPermission: function() {
        if(navigator.permissions) {
            // Permission API is implemented
            navigator.permissions.query({
                    name: 'geolocation'
                }).then(permission =>
                    // is geolocation granted?
                    permission.state === "granted"
                    ? console.log("Permission on geolocation granted")
                    : console.warn("Permission on geolocation NOT granted")
            ); 
        } else {
            // Permission API was not implemented
            console.warn("Permission API is not supported");
        }
  
    },
    getPosition: function (cbSuccess, cbError) {

        this.geolocationPermission();

        // onSuccess Callback
        // This method accepts a Position object, which contains the
        // current GPS coordinates
        //
        var onSuccess = function (position) {
            cbSuccess({
                type: "current_position",
                place: {
                    coord: {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    }
                }
            });
        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            if(cbError) cbError(error);
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);

    },
    getBoundingBox: function (bounds, data) {

        var coordinates, latitude, longitude;

        // Loop through each "feature"
        for (var i = 0; i < data.coordinates.length; i++) {
            coordinates = data.coordinates;

            for (var j = 0; j < coordinates.length; j++) {
                longitude = coordinates[j][0];
                latitude = coordinates[j][1];

                // Update the bounds recursively by comparing the current xMin/xMax and yMin/yMax with the current coordinate
                bounds.lonMin = bounds.lonMin < longitude ? bounds.lonMin : longitude;
                bounds.lonMax = bounds.lonMax > longitude ? bounds.lonMax : longitude;
                bounds.latMin = bounds.latMin < latitude ? bounds.latMin : latitude;
                bounds.latMax = bounds.latMax > latitude ? bounds.latMax : latitude;
            }
        }

        // Returns an object that contains the bounds of this GeoJSON data.
        // The keys describe a box formed by the northwest (xMin, yMin) and southeast (xMax, yMax) coordinates.
        return bounds;
    },
    /**
        Returns the point that is a distance and heading away from
        the given origin point.

        @param {L.LatLng} latlng: origin point
        @param {float} heading: heading in degrees, clockwise from 0 degrees north.
        @param {float} distance: distance in meters
        @returns {L.latLng} the destination point.
        Many thanks to Chris Veness at http://www.movable-type.co.uk/scripts/latlong.html
        for a great reference and examples.
        Code here: http://makinacorpus.github.io/Leaflet.GeometryUtil/leaflet.geometryutil.js.html
    */
    destination: function (latlng, heading, distance) {
        heading = (heading + 360) % 360;
        var rad = Math.PI / 180,
            radInv = 180 / Math.PI,
            R = 6378137, // approximation of Earth's radius
            lon1 = latlng.lng * rad,
            lat1 = latlng.lat * rad,
            rheading = heading * rad,
            sinLat1 = Math.sin(lat1),
            cosLat1 = Math.cos(lat1),
            cosDistR = Math.cos(distance / R),
            sinDistR = Math.sin(distance / R),
            lat2 = Math.asin(sinLat1 * cosDistR + cosLat1 *
                sinDistR * Math.cos(rheading)),
            lon2 = lon1 + Math.atan2(Math.sin(rheading) * sinDistR *
                cosLat1, cosDistR - sinLat1 * Math.sin(lat2));
        lon2 = lon2 * radInv;
        lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
        return L.latLng([lat2 * radInv, lon2]);
    },
};

export default Utils;