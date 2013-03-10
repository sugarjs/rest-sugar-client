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
        ret[k].get = op('get', r, q);
        ret[k].count = op('get', r + '/count', q);
        ret[k].create = op('post', r, q);
        ret[k].update = op('put', r, q);
        ret[k]['delete'] = op('delete', r, q);
    }

    return ret;
}

function op(method, r, q) {
    return function(o, cb) {
        if(is.fn(o)) {
            request.get({url: r, qs: funkit.common.merge({method: method}, q)},
                handle(o));
        }
        else if(is.object(o) && !is.array(o) && o.length) {
            o.method = method;
            var id = o.id || o._id || '';
            delete o.id;

            request.get({url: r + '/' + id, qs: funkit.common.merge(o, q)},
                handle(cb));
        }
        else {
            o = o? o: '';
            o = o.length? o: '';
            request.get({url: r + o, qs: funkit.common.merge({method: method}, q)},
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

