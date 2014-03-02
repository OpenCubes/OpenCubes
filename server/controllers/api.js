var formidable = require('formidable');

exports.ajaxLogin = function(req, res) {
    res.render('forms/login.ect');
}
exports.glyphicons = function(req, res) {
    var data = require('../../public/api/glyphicons.json');
    console.log(data);
    res.render('utils/glyphicons.ect', {
        list: data
    });
}
exports.parseMd = function(req, res) {
    return res.send(req.application.parser(req.body.markdown || ''));

}