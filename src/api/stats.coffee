perms = require "./permissions"
validator = require "validator"
canThis = perms.canThis
mongoose = require "mongoose"
errors = error = require "../error"
_  = require("lodash")
Q = require "q"
async = require "async"
Mod = mongoose.model "Mod"
Stat = mongoose.model "Stat"

exports.hit = (id, type, date) ->
  Stat.hit(type, id, date)
