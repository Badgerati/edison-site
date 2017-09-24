//libs
var project = require('../models/project.js');


// repo
function ProjectRepo() { }
module.exports = ProjectRepo;


// get a project by id
ProjectRepo.getById = function(id, cb) {
    project.findById(id).exec((e, p) => cb(e, p));
}

// get a project by name
ProjectRepo.getByName = function(name, cb) {
    if (!name) { cb(); return; }

    if (name.toLowerCase() == 'all') {
        name = '';
    }

    var proj = {
        name: name
    };

    project.findOneAndUpdate(
        { 'name': name },
        proj,
        { upsert: true, new: true },
        (e, v) => cb(e, v)
    );
}

// get all projects
ProjectRepo.getAll = function(cb) {
    project.find({}, (e, p) => cb(e, (p || [])));
}