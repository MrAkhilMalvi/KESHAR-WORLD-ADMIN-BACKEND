const config = require('config');
const pg = require('pg')
const dbError = require('./dbError');

const pool = new pg.Pool({
    host: config.get('App.db.host'),
    user: config.get('App.db.user'),
    password: config.get('App.db.password'),
    database: config.get('App.db.name'),
    max: 100,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 1000 * 120,
});

pg.types.setTypeParser(20, function (value) {
    return parseInt(value);
});


module.exports = {
    query: function (text, values) {
        var client;

        return pool.connect()
            .then(dbClient => {
                client = dbClient;
                return client.query(text, values);
            })
            .catch((e) => {
                return Promise.reject(dbError.errorHandler(e.code, e.message, e.constraint));
            })
            .finally(function () {
                if (client) {
                    client.release();
                }
            });
    },
    getRowsQuery: function (text, values, key) {
        return this.query(text, values)
            .then(result => {
                if (key) {
                    return Promise.resolve(result.rows[0][key]);
                }
                return Promise.resolve(result.rows);
            })
            .catch(err => Promise.reject(err));
    }
}