/* global describe: false, it: false,, expect: false */
describe("ratings", function() {
  var models_path, api, api_path;
  var mongoose = require('mongoose');
  var mockgoose = require('mockgoose');
  var chance = require("chance")();
  var fs = require("fs");
  var Q = require("q");
  require("../lib/utils");
  mockgoose(mongoose);

  api = {};
  models_path = __dirname.getParent() + "/lib/models";
  fs.readdirSync(models_path).forEach(function(file) {
    if (~file.indexOf(".js")) {
      return require(models_path + "/" + file);
    }
  });
  api_path = __dirname.getParent() + "/lib/api";
  fs.readdirSync(api_path).forEach(function(file) {
    if (~file.indexOf(".js")) {
      api[file.slice(0, -3)] = require(api_path + "/" + file);
    }
  });
  var User = mongoose.model("User");
  var user = new User({
    username: "bar",
    email: "bar@bar.gmail.com",
    role: "user",
  });
  user.password = "bar";
  var userid;
  var modid;
  user.save(function(err, user) {
    if (err) {
      console.log(err);
      throw err;
    }
    userid = user._id;
    api.mods.add(userid, {
      name: "Rated",
      summary: chance.sentence({
        words: 7
      }),
      body: chance.sentence({
        words: 100
      }),
      author: userid
    }).then(function(status) {
      modid = status._id;
    }).fail(function(err) {
      console.log(err);
    });
  });
  sid = "";
/*  it("should be able to get notifications when new releases are available", function(done) {
    data = {}
    api.mods.addVersion("subject", "1.0.0#1.0.0").then(function(v) {
      expect(v.name).toBe("1.0.0#1.0.0");
      data.obj = v._id;
      data.author = v.author;
      console.log(v);
      return api.notifications.get(sid)
    }).then(function(r) {
      console.log(r, data);
      expect(r.notifications[0].subject).toBe(modid);
      expect(r.notifications[0].object).toBe(data.obj);
      expect(r.notifications[0].author).toBe(data.author);
      excect(r.unread).toBe(1);
      done();
    }).fail(function(err) {
      console.log(err)
      expect(err).toBe(undefined);
      done();
    });
  });*/
});
