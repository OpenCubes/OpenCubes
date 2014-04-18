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

module.exports.upload = (req, res) ->
  form = new formidable.IncomingForm()
  form.uploadDir = __dirname.getParent() + "/temp/"
  form.parse req, (err, fields, files) ->
    uid = uuid.v4()
    newfile = __dirname.getParent() + "/uploads/" + uid
    console.log "field:", fields
    versionName = fields.version
    path = fields.path
    if not path or not versionName or path is "" or versionName is ""
      req.flash "error", "There is something missing..."
      return res.redirect(req.url)
    copyFile files.file.path, newfile, (err) ->
      if err
        console.log err
        req.flash "error", "Oops, something went wrong! (reason: copy)"
        return res.redirect(req.url)
      fs.unlink files.file.path, (err) ->
        if err
          req.flash "error", "Oops, something went wrong! (reason: deletion)"
          return res.redirect(req.url)
        slug = req.params.id
        Mod.load
          slug: slug
        , (err, mod) ->
          if err or not mod
            req.flash "error", "Oops, something went wrong! (reason: database)"
            return res.redirect(req.url)
          mod.addFile uid, path, versionName, (err, doc) ->
            if err or not mod
              req.flash "error", "Oops, something went wrong! (reason: saving)"
              return res.redirect(req.url)
            req.flash "success", "Done!"
            res.redirect req.url

          return

        return

      return

    return

  return

exports.doDelete = (req, res) ->

exports.download = (req, res) ->
  Mod.load
    slug: req.params.id
  , (err, mod) ->
    if err or not mod
      res.reason = "Mod not found"
      return res.send("Not found")
    version = req.query.v
    unless version
      mod.listVersion (data) ->
        res.render "mods/download.ect",
          versions: data

        return

    else
      mod.listVersion((data, d) ->
        version = version.replace("/", "#")
        files = data[version]
        id = uuid.v1()
        output = fs.createWriteStream(__dirname.getParent() + "/temp/" + id)
        archive = archiver("zip")
        archive.on "error", (err) ->
          console.log err
          return

        res.set "Content-Disposition": "attachment; filename=\"" + mod.name + " v" + version + ".zip\""
        archive.pipe res
        for file of files
          if files.hasOwnProperty(file)
            archive.append fs.createReadStream(__dirname.getParent() + "/uploads/" + files[file]),
              name: file

            console.log "Adding file " + files[file] + " to " + file
        archive.finalize (err, bytes) ->
          throw err  if err
          console.log bytes + " total bytes"

      , true)

  return

exports.remove = (req, res) ->

