#!/usr/bin/env node
var assert = require('assert');

var express = require('express');

var client = require('./lib/rest-sugar-client');


main();

function main() {
    var port = 3000;
    var apiPrefix = '/api';
    var app = express();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    app.get(apiPrefix, function(req, res) {
        res.json({
            libraries: {}
        });
    });

    app.get(apiPrefix + '/libraries', function(req, res) {
        assert.equal(req.method, 'GET');

        res.json([{
            name: 'demo library'
        }]);
    });

    app.post(apiPrefix + '/libraries', function(req, res) {
        res.json(req.body);
    });

    app.listen(3000, function(err) {
        if(err) return console.error(err);

        client.api('http://localhost:' + port + apiPrefix, function(err, api) {
            if(err) return console.error(err);

            api.libraries.get(function(err, d) {
                if(err) return console.error(err);
                var lib = {name: 'demo library'};

                api.libraries.create(lib, function(err, d) {
                    if(err) return console.error(err);

                    assert.equal(Object.keys(lib).length, Object.keys(d).length);
                    assert.equal(lib.name, d.name);

                    process.exit();
                });
            });
        });
    });
}
