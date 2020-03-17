var Ux = {
    getMaterialSectionIcon: function(type, mode) {
        if (type == 'public_transport') {
            if (mode == 'Train') {
                return "directions_train";
            } else if (mode == 'Bus') {
                return "directions_bus";
            }
        } else if (type == 'transfer') {
            return "directions_walk";
        } else if (type == 'waiting') {
            return "hourglass_empty";
        }
    }
};

export default Ux;