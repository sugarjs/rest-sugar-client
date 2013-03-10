var request = require('request');
var funkit = require('funkit');
var is = require('is-js');

function api(url, cb) {
    if(!is.fn(cb)) return console.error('Missing api callback!');

    getMeta(url, function(err, d) {
        if(err) cb(err);
        else cb(null, constructAPI(url, d));
    });
}
exports.api = api;

function getMeta(url, cb) {
    request.get(url, function(err, d) {
        if(err || d.statusCode != 200) cb(err || d.body);
        else cb(null, JSON.parse(d.body));
    });
}
exports.getMeta = getMeta;

function constructAPI(url, d) {
    var ret = {};
    var parts = url.split('?');
    url = funkit.string.rtrim('/', parts[0]) + '/';
    var q = QtoOb(parts[1]);

    for(var k in d) {
        var v = d[k];
        var r = url + k;

        // TODO: collection ops (ie. boards(id).columns.<op>)
        ret[k] = {};
        ret[k].get = op('GET', r, q);
        ret[k].count = op('GET', r + '/count', q);
        ret[k].create = op('POST', r, q);
        ret[k].update = op('PUT', r, q);
        ret[k]['delete'] = op('DELETE', r, q);
    }

    return ret;
}

function op(method, r, q) {
    return function(o, cb) {
        if(is.fn(o)) {
            if(method == 'PUT' || method == 'POST') {
                request({method: method, url: r, form: q}, handle(o));
            }
            else {
                request({method: method, url: r, qs: q}, handle(o));
            }
        }
        else if(is.object(o) && !is.array(o)) {
            var id = o.id || o._id || '';
            delete o.id;

            if(method == 'PUT' || method == 'POST') {
                request({method: method, url: r + '/' + id, form: funkit.common.merge(o, q)},
                    handle(cb));
            }
            else {
                request({method: method, url: r + '/' + id, qs: funkit.common.merge(o, q)},
                    handle(cb));
            }
        }
        else {
            o = o? o: '';
            o = o.length? o: '';

            if(method == 'PUT' || method == 'POST') {
                request({method: method, url: r + o, form: q}, handle(cb));
            }
            else {
                request({method: method, url: r + o, qs: q}, handle(cb));
            }
        }
    };
}

function handle(cb) {
    return function(err, d) {
        if(err || d.statusCode != 200) cb(err || d.body);
        else cb(null, JSON.parse(d.body));
    };
}

function QtoOb(q) {
    q = q? q.split('&'): [];
    return funkit.functional.ziptoo(q.map(funkit.partial(funkit.string.split, '=')));
}
exports.QtoOb = QtoOb;

function toQ(o) {
    var fields = o.fields? o.fields.join(','): '';
    delete o.fields;

    return fields + funkit.functional.otozip(o).map(function(v) {
        return v[0] + '=' + v[1].split(' ').join('+');
    }).join('&');
}

