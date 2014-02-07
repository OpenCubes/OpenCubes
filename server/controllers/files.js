var upload = require('express-upload');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var uuid = require('node-uuid');
var Mod = require('mongoose').model('Mod');
module.exports.upload = function(req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname.getParent() + '/temp/';
    form.parse(req, function(err, fields, files) {
        var uid = uuid.v4();
        var newfile = __dirname.getParent()+ '/uploads/' + uid;
        console.log('field:',fields);
        var versionName = fields.version;
        var path = fields.path;
        if (!path || !versionName || path === '' || versionName === '') {
            req.flash('error', 'There is something missing...');
            return res.redirect(req.url);
        }
        copyFile(files.file.path, newfile, function(err) {
            if (err) {
                console.log(err);
                req.flash('error', 'Oops, something went wrong! (reason: copy)');
                return res.redirect(req.url);
            }
            fs.unlink(files.file.path, function(err) {
                if (err) {
                    req.flash('error', 'Oops, something went wrong! (reason: deletion)');
                    return res.redirect(req.url);
                }
                var slug = req.params.id;
                Mod.load({
                    slug: slug
                }, function(err, mod) {
                    if (err || !mod) {
                        req.flash('error', 'Oops, something went wrong! (reason: database)');
                        return res.redirect(req.url);
                    }
                    mod.addFile(uid, path, versionName, function(err, doc) {
                        if (err || !mod) {
                            req.flash('error', 'Oops, something went wrong! (reason: saving)');
                            return res.redirect(req.url);
                        }
                        req.flash('success', 'Done!');
                        return res.redirect(req.url);
                    })

                })

            });

        });
    });
    /*   console.log(req.files);
    upload()//.accept('image/jpeg')
    // .gm(function(gm) {
    //    return gm.resize(false, 100);
    //   })
    .to('temp').exec(req.files['file-raw'], function(err, file) {
        if (err) req.flash('error', 'Oops! Something went wrong...');
        else req.flash('success', 'Successfully uploaded!');
        res.redirect('/');
    });*/
};

function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        done(err);
    });
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}