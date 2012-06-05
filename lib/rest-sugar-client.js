var request = require('request');
var funkit = require('funkit');

function api(url, cb) {
    getMeta(url, function(err, d) {
        if(err) cb(err);
        else cb(null, constructAPI(url.split('?')[0], d));
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
    url = funkit.rtrim(url, '/') + '/';
    var ret = {};

    for(var k in d) {
        var v = d[k];
        var r = url + k;

        // TODO: collection ops (ie. boards(id).columns.<op>)
        ret[k] = {};
        ret[k].get = op('get', r);
        ret[k].count = op('get', r + '/count');
        ret[k].create = op('post', r);
        ret[k].update = op('put', r);
        ret[k]['delete'] = op('del', r);
    }

    return ret;
}

function op(method, r) {
    return function(o, cb) {
        if(funkit.isObject(o)) {
            o.method = method;
            var id = o.id;
            delete o.id;

            request.get({url: r + '/' + id, qs: o},
                handle(cb));
        }
        else {
            o = o? o: '';
            request.get({url: r + o, qs: {method: method}},
                handle(cb));
        }
    };
}

function handle(cb) {
    return function(err, d) {
        if(err || d.statusCode != 200) cb(err || d.body);
        else cb(null, JSON.parse(d.body));
    };
}

function toQ(o) {
    var fields = o.fields? o.fields.join(','): '';
    delete o.fields;

    return fields + funkit.otozip(o).map(function(v) {
        return v[0] + '=' + v[1].split(' ').join('+');
    }).join('&');
}

