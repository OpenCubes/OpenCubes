describe("mods", function() {
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
    username: "foo",
    email: "foo@bar.gmail.com",
    role: "user",
  })
  user.password = "bar"
  var userid;
  var modid;

  it("should be able to add multiple mods", function(done) {
    user.save(function(err, user) {
      if (err) {
        console.log(err)
        throw err
      }
      userid = user._id;
      api.mods.add(userid, {
        name: "Foo Bar",
        summary: chance.sentence({
          words: 7
        }),
        body: chance.sentence({
          words: 100
        }),
        author: userid
      }).then(function(status) {
        expect(status).not.toBe(undefined);

        return api.mods.add(userid, {
          name: "Abcdef",
          summary: chance.sentence({
            words: 7
          }),
          body: chance.sentence({
            words: 100
          }),
          author: userid
        });
      }).then(function(status) {
        expect(status).not.toBe(undefined);

        return api.mods.add(userid, {
          name: "Bcdefg",
          summary: chance.sentence({
            words: 7
          }),
          body: chance.sentence({
            words: 100
          }),
          author: userid
        });
      }).then(function(status) {
        expect(status).not.toBe(undefined);

        return api.mods.add(userid, {
          name: "Cdefgh",
          summary: chance.sentence({
            words: 7
          }),
          body: chance.sentence({
            words: 100
          }),
          author: userid
        });
      }).then(function(status) {
        expect(status).not.toBe(undefined);
        done();
      }).fail(function(err) {
        console.log(err);
        expect(err).toBe(undefined);
        done();
      });
    });
  });
  it("should be able to add multiple mapped mods", function(done) {
    var entries = ['Mod A', 'Mod B', 'Mod C', 'Mod D', 'Mod E', 'Mod F', 'Mod J',
      'Mod H', 'Mod I', 'Mod J'
    ]
    var promises = entries.map(function(name) {
      return api.mods.add(userid, {
        name: name,
        summary: chance.sentence({
          words: 7
        }),
        body: chance.sentence({
          words: 100
        }),
        author: userid
      });
    }); // the anonymous wrapper might be omitted
    Q.all(promises).then(function(status) {
      expect(status).not.toBe(undefined);
      done();
    }).fail(function(err) {
      console.log(err);
      expect(err).toBe(undefined);
      done();
    });
  });

  it("should be able to fetch the mod ", function(done) {
    api.mods.load(userid, "foo-bar").then(function(mod) {
      modid = mod.mod._id
      expect(mod).not.toBe(null);
      done();

    }).fail(function(err) {
      expect(err).toEqual(undefined);
      done();
    });
  });

  it("should be able to star the mod", function(done) {
    api.mods.star(userid, "foo-bar").then(function(mod) {
      expect(mod.vote_count).toBe(1);
      done();
    }).fail(function(err) {
      expect(err).toEqual(undefined);
      done();
    });
  });

  it("should able to cart the mod", function(done) {
    api.carts.create().then(function(cart) {
      api.carts.addTo(cart._id, modid).then(function() {
        api.carts.view(cart._id).then(function(cart) {
          expect(cart.mods[0]._id).toBe(modid);
          done();
        }).fail(function(err) {
          expect(err).toEqual(undefined);
          done();
        });
      }).fail(function(err) {
        expect(err).toEqual(undefined);
        done();
      });
    }).fail(function(err) {
      expect(err).toEqual(undefined);
      done();
    });
  });
  /**
    Doesn't work since mockgoose doesn't support nested refs update
    it("should be able to unstar the mod", function (done) {
        console.log("unstarring...")
        api.mods.star(userid, "foo").then(function (mod) {
            expect(mod.vote_count).toBe(0);
            done();
        }).fail(function (err) {
            expect(err).toEqual(undefined);
            done();
        });
    });
    */
  it("shouldn't be able to push a mod with no name", function(done) {
    api.mods.add(userid, {
      name: "",
      summary: "Bar",
      body: "Hello, world",
      author: userid
    }).then(function(mod) {
      expect(mod).toBe(undefined);
      done();
    }).fail(function(err) {
      expect(err).not.toBe(undefined);
      done();
    });
  });
  it("shouldn't be able to push a mod with no summary", function(done) {
    api.mods.add(userid, {
      name: "Bar",
      summary: "",
      body: "Hello, world",
      author: userid
    }).then(function(mod) {
      expect(mod).toBe(undefined);
      done();
    }).fail(function(err) {
      expect(err).not.toBe(undefined);
      done();
    });
  });
  it("shouldn't be able to push a mod with no body", function(done) {
    api.mods.add(userid, {
      name: "Bar",
      summary: "Foo",
      body: "",
      author: userid
    }).then(function(mod) {
      expect(mod).toBe(undefined);
      done();
    }).fail(function(err) {
      expect(err).not.toBe(undefined);
      done();
    });
  });
  it("shouldn't be able to push a mod with no author", function(done) {
    api.mods.add(userid, {
      name: "Bar",
      summary: "Hello",
      body: "Hello, world",
      author: ""
    }).then(function(mod) {
      expect(mod).toBe(undefined);
      done();
    }).fail(function(err) {
      expect(err).not.toBe(undefined);
      done();
    });
  });
  it("should be able to itemize a mod with options and criterias", function(done) {
    api.mods.itemize({}, {}).then(function(results) {
      expect(results.totalCount).toBe(14);
      expect(results.mods.length).toBe(14);
      return api.mods.itemize({name: "*mod"}, {sort: "-name"})
    }).then(function(results) {
      expect(results.totalCount).toBe(10);
      expect(results.mods.length).toBe(10);
      expect(results.mods[0].name).toBe("Mod J");
      return api.mods.itemize({name: "*mod"}, {limit: 5})
    }).then(function(results) {
      expect(results.totalCount).toBe(10);
      expect(results.mods.length).toBe(5);
      return done();
    }).fail(function(err) {
      console.log(err);
      expect(err).toBe(undefined);
      done();
    });
  });

});
