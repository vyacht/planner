var Utils = {
    getPosition: function (callback) {

        // onSuccess Callback
        // This method accepts a Position object, which contains the
        // current GPS coordinates
        //
        var onSuccess = function (position) {
            callback({
                type: "current_position",
                place: position.coords
            });
        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
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
    }
};

export default Utils;