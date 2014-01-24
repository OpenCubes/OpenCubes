module.exports = function(app) {
    console.log(('  Debug - Loading routes...').cyan);
    app.server.get('/',app.controllers.index.index);
};