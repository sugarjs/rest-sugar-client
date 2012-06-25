var request = require('request');
var funkit = require('funkit');

function api(url, cb) {
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
    url = funkit.rtrim(parts[0], '/') + '/';
    var q = QtoOb(parts[1]);

    for(var k in d) {
        var v = d[k];
        var r = url + k;

        // TODO: collection ops (ie. boards(id).columns.<op>)
        ret[k] = {};
        ret[k].get = op('get', r, q);
        ret[k].count = op('get', r + '/count', q);
        ret[k].create = op('post', r, q);
        ret[k].update = op('put', r, q);
        ret[k]['delete'] = op('del', r, q);
    }

    return ret;
}

function op(method, r, q) {
    return function(o, cb) {
        if(funkit.isObject(o)) {
            o.method = method;
            var id = o.id || '';
            delete o.id;
            o = funkit.merge(o, q);

            request.get({url: r + '/' + id, qs: o},
                handle(cb));
        }
        else if(funkit.isFunction(o)) {
            request.get({url: r, qs: {method: method}},
                handle(o));
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

function QtoOb(q) {
    q = q? q.split('&'): [];
    return funkit.ziptoo(q.map(funkit.partial(funkit.split, '=')));
}
exports.QtoOb = QtoOb;

function toQ(o) {
    var fields = o.fields? o.fields.join(','): '';
    delete o.fields;

    return fields + funkit.otozip(o).map(function(v) {
        return v[0] + '=' + v[1].split(' ').join('+');
    }).join('&');
}

