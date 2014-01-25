module.exports = function(app) {
    console.log(('  Debug - Loading routes...').cyan);
    app.server.get('/', app.controllers.mods.index);
    app.server.get('/mod/:id', app.controllers.mods.view);
    app.server.get('/upload', app.controllers.mods.upload);
    app.server.post('/upload', app.controllers.mods.doUpload);
};