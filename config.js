module.exports = {
    port: 8082,

    locale: 'en-GB',

    host_url: (process.env.HOST_URL || 'http://localhost:8082'),

    mongo: {
        connection: 'mongodb://mongo:27017/edison'
    },

    validation: {
        hashes: {
            max: 50
        },
        comment: {
            max: 500
        },
        stacktrace: {
            max: 3000
        },
        errormessage: {
            max: 1000
        },
        names: {
            max: 50
        },
        testname: {
            max: 700
        },
        namespace: {
            max: 250
        },
        assembly: {
            max: 50
        }
    }
}