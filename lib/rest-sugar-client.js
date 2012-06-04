var request = require('request');
var funkit = require('funkit');

function constructAPI(url, d) {
    url = funkit.rtrim(url, '/') + '/';
    var ret = {};

    for(var k in d) {
        var v = d[k];
        var name = k.slice(0, -1);
        var r = url + k;

        // TODO: collection ops (ie. boards(id).columns.<op>)
        ret[name] = op('get', r);
        ret[name].count = op('get', r + 'count');
        ret[name].create = op('post', r);
        ret[name].update = op('put', r);
        ret[name]['delete'] = op('del', r);
    }

    return ret;
}
exports.constructAPI = constructAPI;

function op(method, r) {
    return function(o, okCb, errCb) {
        if(funkit.isString(o)) {
            request.get({url: r + o, qs: {method: method}},
                handle(okCb, errCb));
        }
        else {
            o.method = method;
            request.get(r + '?' + toQ(o),
                handle(okCb, errCb));
        }
    };
}

function handle(okCb, errCb) {
    return function(err, d) {
        if(err || d.statusCode != 200) errCb(err || d.body);
        else okCb(JSON.parse(d.body));
    };
}

function toQ(o) {
    var fields = o.fields? o.fields.join(','): '';
    delete o.fields;

    return fields + funkit.otozip(o).map(function(v) {
        return v[0] + '=' + v[1].split(' ').join('+');
    }).join('&');
}

