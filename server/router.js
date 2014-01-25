module.exports = function(app) {
    console.log(('  Debug - Loading routes...').cyan);
    app.server.get('/', app.controllers.index.index);
    app.server.get('/upload', app.controllers.mods.upload);
    app.server.post('/upload', app.controllers.mods.doUpload);
};