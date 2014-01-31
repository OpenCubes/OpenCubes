exports.notfound = function(req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('utils/404.ect', {
            url: req.url,
            title: '404 Not found',
            reason: res.reason || 'Unknown'
        });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({
            error: 'Not found'
        });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
};
var URI = require('URIjs');
exports.ectHelpers = function(req, data) {
    data.urlHelper = function(key, value) {
        return (new URI(req.url)).setQuery(key, value);
    };
    data.isQueried = function(key, value) {
        return (new URI(req.url)).hasQuery(key, value);
    }
    return data;
}