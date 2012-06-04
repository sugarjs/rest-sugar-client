#!/usr/bin/env node
var client = require('../lib/rest-sugar-client');
var url = 'http://localhost:8000/api/v1';
var APIKEY = 'dummy'; // stash this into env or so

client.api(url + '?apikey=' + APIKEY, log, log);

function log(d) {console.log(d);}

