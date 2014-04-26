(function() {
  var Mod, archiver, copyFile, errors, formidable, fs, util, uuid;

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

  errors = require("../error");

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
          return app.api.mods.addFile(req.getUserId(), slug, uid, path, versionName).then(function(doc) {
            req.flash("success", "Yes! File uploaded!");
            return res.redirect(req.url);
          }).fail(function(err) {
            req.flash("error", "Oops, something went wrong. Please retry.");
            return res.redirect(req.url);
          });
        });
      });
    });
  };

  exports.doDelete = function(req, res) {};

  exports.download = function(req, res) {
    app.api.mods.load(req.getUserId(), req.params.id).fail(function(err) {
      res.reason = "Mod not found";
      return res.send("Not found");
    }).then(function(mod) {
      var archive, dep, file, files, id, output, version;
      version = req.query.v;
      if (!version) {
        return res.render("mods/download.ect", {
          versions: mod.versions
        });
      } else {
        console.log("MOD:", mod);
        version = version.replace("/", "#");
        files = mod.versions[version];
        id = uuid.v1();
        output = fs.createWriteStream(__dirname.getParent() + "/temp/" + id);
        archive = archiver("zip");
        archive.on("error", function(err) {
          console.log(err);
        });
        res.set({
          "Content-Disposition": "attachment; filename=\"" + mod.mod.name + " v" + version + ".zip\""
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
        for (dep in mod.deps) {
          files = mod.deps[dep].files.toObject();
          for (file in files) {
            if (files.hasOwnProperty(file) && file) {
              archive.append(fs.createReadStream(__dirname.getParent() + "/uploads/" + files[file].uid), {
                name: files[file].path
              });
              console.log("Adding file " + files[file].uid + " to " + files[file].path);
            }
          }
        }
        return archive.finalize(function(err, bytes) {
          if (err) {
            errors.handleHttp(err, req, res, "json");
          }
          return console.log(bytes + " total bytes");
        });
      }
    });
  };

  exports.remove = function(req, res) {};

}).call(this);
