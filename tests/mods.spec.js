describe("mods", function () {
    var mongoose = require('mongoose');
    var mockgoose = require('Mockgoose');
    var fs = require("fs");
    require("../server/utils");
    mockgoose(mongoose);

    api = {};
    models_path = __dirname.getParent() + "/server/models";
    fs.readdirSync(models_path).forEach(function (file) {
        if (~file.indexOf(".js")) {
            return require(models_path + "/" + file);
        }
    });
    api_path = __dirname.getParent() + "/server/api";
    fs.readdirSync(api_path).forEach(function (file) {
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
    it("should be able to add a mod", function (done) {
        user.save(function (err, user) {
            if (err) throw err
            userid = user._id;
            api.mods.add(userid, {
                name: "Foo",
                summary: "Bar",
                body: "Hello, world",
                author: userid
            }).then(function (status) {
                expect(status).not.toBe(undefined);
                done();
            }).fail(function (err) {
                console.log(err);
                expect(err).toBe(undefined);
                done();
            });
        });
    });
    it("should be able to fetch the mod ", function (done) {
        api.mods.load(userid, "foo").then(function (mod) {
            expect(status).not.toBe(null);
            done();
        }).fail(function (err) {
            expect(err).toEqual(undefined);
        });
    });
    it("shouldn't be able to push a mod with no name", function (done) {
        api.mods.add(userid, {
            name: "",
            summary: "Bar",
            body: "Hello, world",
            author: userid
        }).then(function (mod) {
            expect(mod).toBe(undefined);
            done();
        }).fail(function (err) {
            expect(err).not.toBe(undefined);
            done();
        });
    });
    it("shouldn't be able to push a mod with no summary", function (done) {
        api.mods.add(userid, {
            name: "Bar",
            summary: "",
            body: "Hello, world",
            author: userid
        }).then(function (mod) {
            expect(mod).toBe(undefined);
            done();
        }).fail(function (err) {
            expect(err).not.toBe(undefined);
            done();
        });
    });
    it("shouldn't be able to push a mod with no body", function (done) {
        api.mods.add(userid, {
            name: "Bar",
            summary: "Foo",
            body: "",
            author: userid
        }).then(function (mod) {
            expect(mod).toBe(undefined);
            done();
        }).fail(function (err) {
            expect(err).not.toBe(undefined);
            done();
        });
    });
    it("shouldn't be able to push a mod with no author", function (done) {
        api.mods.add(userid, {
            name: "Bar",
            summary: "Hello",
            body: "Hello, world",
            author: ""
        }).then(function (mod) {
            expect(mod).toBe(undefined);
            done();
        }).fail(function (err) {
            expect(err).not.toBe(undefined);
            done();
        });
    });
});

/*

  describe("mods", function () {
    it("should be able
});
*/
