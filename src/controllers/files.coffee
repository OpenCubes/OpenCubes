
util = require("util")
qfs = require("q-io/fs")
fs = require("fs")
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
  qfs.rename(file.path, newfile).then(() ->
    console.log "renamed"
    return app.api.mods.addFile(req.getUserId(), slug, uid, path, versionName)
  , handleErr).then((doc) ->
    console.log "added"
    res.send 200
  , handleErr).fail handleErr

  return

exports.doDelete = (req, res) ->

exports.download = (req, res) ->

  version = "#{req.params.mc}##{req.params.mod}"
  mod = undefined
  app.api.mods.lookup(req.getUserId(), req.params.id).then((doc) ->
    mod = doc
    return app.api.mods.getFiles(req.params.id, version)

  ).then((files) ->
    app.api.stats.hit mod._id, "download", new Date()

    # we create an uid for the file (temp) and then the output
    id = uuid.v4()

    output = fs.createWriteStream(__dirname.getParent() + "/temp/" + id)
    archive = archiver("zip")
    archive.on "error", (err) ->
      console.log err
      return

    # Set the file name for the client
    res.set "Content-Disposition": "attachment; filename=\"" + mod.name + " v" + version + ".zip\""

    # and pipe it
    archive.pipe res

    # let's add the files
    for file in files
      archive.append fs.createReadStream(__dirname.getParent() + "/uploads/" + file.uid),
        name: file.path

    # end the archive
    archive.finalize (err, bytes) ->
      errors.handleHttp err, req, res, "json" if err
      console.log bytes + " total bytes"


  ).fail (err) ->
    errors.handleHttp err, req, res

  return
exports.remove = (req, res) ->
