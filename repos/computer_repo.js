//libs
var computer = require('../models/computer.js');


// repo
function ComputerRepo() { }
module.exports = ComputerRepo;


// get a computer by id
ComputerRepo.getById = function(id, cb) {
    computer.findById(id).exec((e, c) => cb(e, c));
}

// get a computer by name
ComputerRepo.getByName = function(name, cb) {
    if (!name) { cb(); return; }

    if (name.toLowerCase() == 'all') {
        name = '';
    }
    
    var cmp = {
        name: name
    };

    computer.findOneAndUpdate(
        { 'name': name },
        cmp,
        { upsert: true, new: true },
        (e, v) => cb(e, v)
    );
}

// get all computers
ComputerRepo.getAll = function(cb) {
    computer.find({}, (e, c) => cb(e, (c || [])));
}