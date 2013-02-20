#!/usr/bin/env node
var program = require('commander');
var render = require('render');
var client = require('../../lib/rest-sugar-client');

var VERSION = '0.1.0';
var APIKEY = 'dummy'; // stash this into env or so
var URL = 'http://localhost:8000/api/v1';

console.log('cli demo - ' + VERSION + '\n');

program.
    version(VERSION).
    option('-r --resource <name>', 'Resource name').
    option('-o --operation <get|count|create|update|delete>', 'Operation to perform').
    option('-i --id <id>', 'Resource id').
    option('-q --query <key>=<value>&...', 'Query string').
    option('-s --schema', 'Show schema').
    parse(process.argv);

if(program.schema) {
    client.getMeta(URL + '?apikey=' + APIKEY, function(err, d) {
        if(err) console.log(err);
        else render.log.ctbn(d);
    });
}
else {
    var resource = program.resource;
    var op = program.operation;
    var query = client.QtoOb(program.query);
    query.id = program.id;

    client.api(URL + '?apikey=' + APIKEY, function(err, api) {
        if(err) return console.log(err);

        if(!resource) quit('Missing resource! Use one of ', Object.keys(api));

        var ar = api[resource];
        if(!op) quit('Missing operation! Use one of ', Object.keys(ar));

        if(!(resource in api))
            quit('Resource not in API! Should be one of these: ' + Object.keys(api));

        if(!(op in ar))
            quit('Operation not in API! Should be one of these: ' + Object.keys(ar));

        ar[op](query, function(err, d) {
            if(err) console.log(err);
            else render.log.ctbn(d);
        });
    });
}

function quit() {
    console.log.apply(this, arguments);
    process.exit();
}

