// libs
var config = require('../config.js');
var hash = require('object-hash');
var _ = require('lodash');

// repos
var ProjectRepo = require('../repos/project_repo.js');
var ComputerRepo = require('../repos/computer_repo.js');
var GroupRepo = require('../repos/group_repo.js');


function GeneralHelper() { }
module.exports = GeneralHelper;


// get the mongo objects for a project/computer/group and returns them
GeneralHelper.getPCGByNameOrCreate = function(project, computer, group, cb) {
    // get the projectId
    ProjectRepo.getByName(project, (e, p) => {
        if (e) { cb(e); return; }

        // get the computerId
        ComputerRepo.getByName(computer, (e, c) => {
            if (e) { cb(e); return; }

            // get the groups
            GroupRepo.getByName(group, (e, g) => {
                if (e) { cb(e); return; }
                cb(null, p, c, g);
            })
        });
    });
}

// returns the index of an element in an array (case-insensitive)
GeneralHelper.getArrayIndex = function(array, item) {
    if (!array) {
        return false;
    }

    return _.findIndex(array, (r) => {
        if (!r && !item) {
            return true;
        }

        if (!r || !item) {
            return false;
        }

        return r.toLowerCase() == item.toLowerCase()
    });
}

// returns the item from an array (case-insensitive)
GeneralHelper.getArrayItem = function(array, item) {
    if (!array) {
        return null;
    }

    return _.find(array, (r) => {
        if (!r && !item) {
            return true;
        }

        if (!r || !item) {
            return false;
        }

        return r.toLowerCase() == item.toLowerCase()
    });
}


// returns a hashed value from an array of item
GeneralHelper.getHash = function(items) {
    var value = '';

    if (!(items instanceof Array)) {
        items = [ items ];
    }

    items.forEach((v) => {
        if (v) {
            value += ((v.hash ? v.hash : v).toString());
        }

        value += '|'
    });

    value = value.substring(0, value.length - 1);
    return hash.sha1(value);
}


// restricts a value between two other values
GeneralHelper.restrict = function(value, min, max) {
    if (max < min) {
        max = min;
    }

    if (value < min) {
        return min;
    }

    if (value > max) {
        return max;
    }

    return value;
}