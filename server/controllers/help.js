var fs = require('fs');
exports.getHelp = function(req, res) {
    console.log(req.params.section)
    var section = ['markdown']. in (req.params.section || 'welcome', 'welcome');
    var file = __dirname.getParent() + '/views/help/' + section + '.md';
    console.log(file)
    fs.readFile(file, function read(err, data) {
        if (err) {
            console.log(err);
        }
        var html = req.application.parser(data.toString());
        res.render('help/help.ect', {
            html: html
        })

    });

}
exports.raw = function(req, res) {
    console.log(req.params.section)
    var section = (req.params.section || 'welcome');
    var file = __dirname.getParent() + '/views/help/' + section + '.md';
    fs.readFile(file, function read(err, data) {
        if (err) {
            console.log(err);
        }
        var html = req.application.parser(data.toString());
        res.send(html);

    });

}