// libs
var config = require('../config.js');

// repos
var ProjectRepo = require('../repos/project_repo.js');
var ComputerRepo = require('../repos/computer_repo.js');
var GroupRepo = require('../repos/group_repo.js');


function NavHelper() { }
module.exports = NavHelper;


// get the values for the sub-nav lists
NavHelper.getSubNavLists = function(cb) {
    // initial lists
    var computers = [ 'All' ];
    var groups = [ 'All' ];
    var projects = [ 'All' ];

    // get the projects
    ProjectRepo.getAll((e, p) => {
        if (e) { cb(e); return; }

        // get the computers
        ComputerRepo.getAll((e, c) => {
            if (e) { cb(e); return; }

            // get the groups
            GroupRepo.getAll((e, g) => {
                if (e) { cb(e); return; }

                // populate the lists
                p.forEach((v) => { projects[projects.length] = v.name; });
                c.forEach((v) => { computers[computers.length] = v.name; });
                g.forEach((v) => { groups[groups.length] = v.name; });

                // callback
                cb(null, projects, computers, groups);
            })
        });
    });
}

// get the mongo objects for the sub-nav list filters selected
NavHelper.getSubNavFilters = function(project, computer, group, cb) {
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