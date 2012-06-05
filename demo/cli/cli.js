#!/usr/bin/env node
var program = require('commander');
var render = require('render');
var client = require('../../lib/rest-sugar-client');
var funkit = require('funkit');

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

if(program.schema) client.getMeta(URL + '?apikey=' + APIKEY, render.log.ctbn, log);
else {
    var resource = program.resource;
    var op = program.operation;
    var query = QtoOb(program.query);
    query.apikey = APIKEY;
    query.id = program.id || '';

    if(!resource) quit('Missing resource!');
    if(!op) quit('Missing operation!');

    client.api(URL + '?apikey=' + APIKEY, function(api) {
        if(!(resource in api))
            quit('Resource not in API! Should be one of these: ' + Object.keys(api));
        var ar = api[resource];

        if(!(op in ar))
            quit('Operation not in API! Should be one of these: ' + Object.keys(ar));

        ar[op](query, render.log.ctbn, log);
    }, log);
}

function QtoOb(q) {
    q = q? q.split('&'): [];
    return funkit.ziptoo(q.map(funkit.partial(funkit.split, '=')));
}

function showSchema() {
    console.log('should show schema now');
    // client.schema(URL + '?apikey=' + APIKEY, function...)
}

function log(d) {
    console.log(d);
}

function quit(msg) {
    console.log(msg);
    process.exit();
}

