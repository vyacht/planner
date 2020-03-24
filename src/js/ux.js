var Ux = {
    getMaterialSectionIcon: function(type, mode) {
        if (type == 'public_transport') {
            if (mode == 'Train') {
                return "directions_train";
            } else if (mode == 'Bus') {
                return "directions_bus";
            }
        } else if (type == 'transfer' || type == 'street_network') {
            return "directions_walk";
        } else if ((type == 'crow_fly') && (mode == 'walking')) {
            return "directions_walk";
        } else if (type == 'waiting') {
            return "hourglass_empty";
        }
    }
};

export default Ux;