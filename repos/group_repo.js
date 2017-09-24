//libs
var group = require('../models/group.js');


// repo
function GroupRepo() { }
module.exports = GroupRepo;


// get a group by id
GroupRepo.getById = function(id, cb) {
    group.findById(id).exec((e, g) => cb(e, g));
}

// get a group by name
GroupRepo.getByName = function(name, cb) {
    if (!name) { cb(); return; }

    if (name.toLowerCase() == 'all') {
        name = '';
    }

    var grp = {
        name: name
    };

    group.findOneAndUpdate(
        { 'name': name },
        grp,
        { upsert: true, new: true },
        (e, v) => cb(e, v)
    );
}

// get all groups
GroupRepo.getAll = function(cb) {
    group.find({}, (e, g) => cb(e, (g || [])));
}