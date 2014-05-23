
util = require("util")
fs = require("q-io/fs")
archiver = require("archiver")
uuid = require("node-uuid")
Mod = require("mongoose").model("Mod")
errors = require "../error"

module.exports.upload = (req, res) ->
  # We compute a new uuid for the file
  uid = uuid.v4()
  # Get the params
  newfile = __dirname.getParent() + "/uploads/" + uid
  versionName = req.body.version
  path = req.body.path
  file = req.files.file
  slug = req.params.id
  # Test them
  vRegex = /^(\d\.){2}\d#(\d\.){2}\d(-|\.|_)?(stable|alpha|beta|)$/
  # from https://stackoverflow.com/questions/11382919/relative-path-regular-expression
  # pRegex =  new RegExp("^[a-z0-9]([a-z0-9\\-]{0,}[a-z0-9]){0,1}(/[a-z0-9]([a-z0-9\\-]{0,}[a-z0-9]){0,1}){0,}(/[a-z0-9]([a-z0-9\\-\\.]{0,}[a-z0-9]){0,1}){0,1}$", "g");

  if vRegex.test(versionName) isnt true
    return callback errors.throwError("Version or path is invalid", "INVALID_DATA")

  handleErr = (err) ->
    console.log(err)
    return res.send 500, {error: "error"}


  # Do the job
  console.log "renaming"
  fs.rename(file.path, newfile).then(() ->
    console.log "renamed"
    return app.api.mods.addFile(req.getUserId(), slug, uid, path, versionName)
  , handleErr).then((doc) ->
    console.log "added"
    res.send 200
  , handleErr).fail handleErr

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
      version = version.replace("/", "#")
      app.api.push.stats.mod.download req.getIp(), mod.mod._id, version
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
