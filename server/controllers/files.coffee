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
File = require("mongoose").model("File")

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
  File.findOne
    uid: req.params.uid
  , (err, doc) ->
    if err or not doc
      console.log err  if err
      req.flash "error", "There was an error while deleting file. Please retry."
      return res.redirect("/")
    console.log req.user
    Mod.findOne
      "versions._id": doc.version
      author: req.user._id
    , (err, mod) ->
      if err or not mod
        console.log err  if err
        req.flash "error", "There was an error while deleting file. Perhaps you do not own this mod. Please retry."
        return res.redirect("/")
      doc.remove()
      file = __dirname.getParent() + "/uploads/" + doc.uid
      fs.unlink file, (err) ->
        if err
          req.flash "error", "Oops, something went wrong! (reason: deletion)"
          return res.redirect("/")
        req.flash "success", "Successfully deleted file #" + doc.uid + " " + doc.path
        res.redirect "/"

      return

    return

  return

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
      mod.listVersion((data) ->
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
  uid = req.params.uid
  unless uid
    return res.send
      status: "error"
      code: 400
      id: "missing_param"
      message: "Please enter a file uid"
  else
    File.remove({uid: uid}, (err) ->
      if err
        return res.send
          status: "error"
          code: 500
          id: "database_error"
          message: "An error occured. Please try again"
      file = __dirname.getParent() + "/uploads/" + uid
      fs.unlink file, (err) ->
        if err
          return res.send
            status: "error"
            code: 500
            id: "fs_error"
            message: "An error occured. Please try again"
        
        res.send
          status: "success"
          code: 200
          message: "Done!"
    )

  return
