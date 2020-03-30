var Ux = {
    getMaterialSectionIcon: function(type, mode) {
        if (type == 'public_transport') {
            if (mode == 'Train') {
                return "directions_train";
            } else if (mode == 'Bus') {
                return "directions_bus";
            } else if (mode == 'Ferry') {
                return "directions_boat";
            }
        } else if (type == 'transfer' || type == 'street_network') {
            return "directions_walk";
        } else if ((type == 'crow_fly') && (mode == 'walking')) {
            return "directions_walk";
        } else if (type == 'waiting') {
            return "hourglass_empty";
        }
    },
    getMaterialPlaceTypeIcon: function(type) {
        if (type == 'stop_area') {
            return "directions_train";
        } else if (type == 'administrative_region') {
            return "place";
        } else if (type == 'poi') {
            return "place";
        } else if (type == 'address') {
            return "business";
        } else if (type == 'current_position') {
            return "gps_fixed";
        } else 
            return 'help_outline';
    }
};

export default Ux;