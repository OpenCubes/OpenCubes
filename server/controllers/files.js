(function() {
  var Mod, archiver, copyFile, formidable, fs, util, uuid;

  copyFile = function(source, target, cb) {
    var cbCalled, done, rd, wr;
    done = function(err) {
      var cbCalled;
      if (!cbCalled) {
        cb(err);
        cbCalled = true;
      }
    };
    cbCalled = false;
    rd = fs.createReadStream(source);
    rd.on("error", function(err) {
      done(err);
    });
    wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
      done(err);
    });
    wr.on("close", function(ex) {
      done();
    });
    rd.pipe(wr);
  };

  formidable = require("formidable");

  util = require("util");

  fs = require("fs");

  archiver = require("archiver");

  uuid = require("node-uuid");

  Mod = require("mongoose").model("Mod");

  module.exports.upload = function(req, res) {
    var form;
    form = new formidable.IncomingForm();
    form.uploadDir = __dirname.getParent() + "/temp/";
    form.parse(req, function(err, fields, files) {
      var newfile, path, uid, versionName;
      uid = uuid.v4();
      newfile = __dirname.getParent() + "/uploads/" + uid;
      console.log("field:", fields);
      versionName = fields.version;
      path = fields.path;
      if (!path || !versionName || path === "" || versionName === "") {
        req.flash("error", "There is something missing...");
        return res.redirect(req.url);
      }
      copyFile(files.file.path, newfile, function(err) {
        if (err) {
          console.log(err);
          req.flash("error", "Oops, something went wrong! (reason: copy)");
          return res.redirect(req.url);
        }
        fs.unlink(files.file.path, function(err) {
          var slug;
          if (err) {
            req.flash("error", "Oops, something went wrong! (reason: deletion)");
            return res.redirect(req.url);
          }
          slug = req.params.id;
          Mod.load({
            slug: slug
          }, function(err, mod) {
            if (err || !mod) {
              req.flash("error", "Oops, something went wrong! (reason: database)");
              return res.redirect(req.url);
            }
            mod.addFile(uid, path, versionName, function(err, doc) {
              if (err || !mod) {
                req.flash("error", "Oops, something went wrong! (reason: saving)");
                return res.redirect(req.url);
              }
              req.flash("success", "Done!");
              return res.redirect(req.url);
            });
          });
        });
      });
    });
  };

  exports.doDelete = function(req, res) {};

  exports.download = function(req, res) {
    Mod.load({
      slug: req.params.id
    }, function(err, mod) {
      var version;
      if (err || !mod) {
        res.reason = "Mod not found";
        return res.send("Not found");
      }
      version = req.query.v;
      if (!version) {
        return mod.listVersion(function(data) {
          res.render("mods/download.ect", {
            versions: data
          });
        });
      } else {
        return mod.listVersion(function(data, d) {
          var archive, file, files, id, output;
          version = version.replace("/", "#");
          files = data[version];
          id = uuid.v1();
          output = fs.createWriteStream(__dirname.getParent() + "/temp/" + id);
          archive = archiver("zip");
          archive.on("error", function(err) {
            console.log(err);
          });
          res.set({
            "Content-Disposition": "attachment; filename=\"" + mod.name + " v" + version + ".zip\""
          });
          archive.pipe(res);
          for (file in files) {
            if (files.hasOwnProperty(file)) {
              archive.append(fs.createReadStream(__dirname.getParent() + "/uploads/" + files[file]), {
                name: file
              });
              console.log("Adding file " + files[file] + " to " + file);
            }
          }
          return archive.finalize(function(err, bytes) {
            if (err) {
              throw err;
            }
            return console.log(bytes + " total bytes");
          });
        }, true);
      }
    });
  };

  exports.remove = function(req, res) {};

}).call(this);
