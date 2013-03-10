#!/usr/bin/env node
var express = require('express');

var client = require('./lib/rest-sugar-client');


main();

function main() {
    var port = 3000;
    var apiPrefix = '/api';
    var app = express();

    app.get(apiPrefix, function(req, res) {
        res.json({
            libraries: {}
        });
    });

    app.listen(3000, function(err) {
        if(err) return console.error(err);

        client.api('http://localhost:' + port + apiPrefix, function(err, api) {
            if(err) return console.error(err);

            console.log(api);

            process.exit();
        });
    });
}
