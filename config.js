module.exports = {
    port: (process.env.EDISON_PORT || process.env.PORT || 8082),

    locale: (process.env.EDISON_LOCALE || process.env.LOCALE || 'en-GB'),

    host_url: (process.env.EDISON_HOST_URL || process.env.HOST_URL || 'http://localhost:8082'),

    mongo: {
        connection: (process.env.EDISON_MONGO_CONN || process.env.MONGO_CONN || 'mongodb://mongo:27017/edison')
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