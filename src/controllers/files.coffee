copyFile = (source, target, cb) ->
  done = (err) ->
    unless cbCalled
      cb err
      cbCalled = true
    return
  cbCalled = false
  rd = fs.createReadStream(source)
  rd.on "error", (err) ->
    done err
    return

  wr = fs.createWriteStream(target)
  wr.on "error", (err) ->
    done err
    return

  wr.on "close", (ex) ->
    done()
    return

  rd.pipe wr
  return

formidable = require("formidable")
util = require("util")
fs = require("fs")
archiver = require("archiver")
uuid = require("node-uuid")
Mod = require("mongoose").model("Mod")
errors = require "../error"

module.exports.upload = (req, res) ->
  form = new formidable.IncomingForm()
  form.uploadDir = __dirname.getParent() + "/temp/"
  form.parse req, (err, fields, files) ->
    console.log(err) if err
    uid = uuid.v4()
    newfile = __dirname.getParent() + "/uploads/" + uid
    console.log "field:", fields
    versionName = fields.version
    path = fields.path
    if not path or not versionName or path is "" or versionName is ""
      console.log "missing"
      req.flash "error", "There is something missing..."
      return res.redirect(req.url)
    copyFile files.file.path, newfile, (err) ->
      if err
       console.log(err)
       return res.send 500, {error: "error"}
      fs.unlink files.file.path, (err) ->
        if err
          console.log(err)
          return res.send 500, {error: "error"}
        slug = req.params.id
        console.log req.params
        app.api.mods.addFile(req.getUserId(), slug, uid, path, versionName).then((doc) ->
          return res.redirect(req.url)
        ).fail (err) ->
          console.log(err)
          return res.send 500, {error: "error"}

      return

    return

  return

exports.doDelete = (req, res) ->

exports.download = (req, res) ->
  app.api.mods.load(req.getUserId(), req.params.id).fail((err) ->
    res.reason = "Mod not found"
    return res.send("Not found")
  ).then (mod) ->
    version = req.query.v
    unless version
      res.render "mods/download.ect",
        versions: mod.versions
    else
      console.log "MOD:", mod
      version = version.replace("/", "#")
      files = mod.versions[version]
      id = uuid.v1()
      output = fs.createWriteStream(__dirname.getParent() + "/temp/" + id)
      archive = archiver("zip")
      archive.on "error", (err) ->
        console.log err
        return

      res.set "Content-Disposition": "attachment; filename=\"" + mod.mod.name + " v" + version + ".zip\""
      archive.pipe res
      for file of files
        if files.hasOwnProperty(file)
          archive.append fs.createReadStream(__dirname.getParent() + "/uploads/" + files[file]),
            name: file

          console.log "Adding file " + files[file] + " to " + file
      for dep of mod.deps
        files = mod.deps[dep].files.toObject()
        for file of files
          if files.hasOwnProperty(file) and file
            archive.append fs.createReadStream(__dirname.getParent() + "/uploads/" + files[file].uid),
              name: files[file].path
            console.log "Adding file " + files[file].uid + " to " +  files[file].path
      archive.finalize (err, bytes) ->
        errors.handleHttp err, req, res, "json" if err
        console.log bytes + " total bytes"

  return
exports.remove = (req, res) ->
