var ECT = require('ect');
var fs = require('fs');
var utils = require('../server/controllers/utils');
String.prototype.getParent = function() {
    return this.toString().substring(0, this.toString().lastIndexOf('/'));
};
jasmine.getEnv().addReporter(new jasmine.ConsoleReporter(console.log));
describe("template", function() {
    it("should render all succesfully", function(done) {
        var root = __dirname.getParent() + '/server/views';
        var renderer = ECT({
            root: root,
            ext: '.ect'
        });
        var walk = function(dir, done) {
            var results = [];

            fs.readdir(dir, function(err, list) {
                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, results);
                list.forEach(function(file) {
                    file = dir + '/' + file;
                    fs.stat(file, function(err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function(err, res) {
                                results = results.concat(res);
                                if (!--pending) done(null, results);
                            });
                        }
                        else {
                            results.push(file);
                            if (!--pending) done(null, results);
                        }
                    });
                });
            });
        };
        var errors = [];
        walk(root, function(err, res) {

            for (var i = 0; i < res.length; i++) {
                var file = res[i];
                if (~file.indexOf('.ect')) {
                    try {
                        var timer = new Date().getTime();
                        var path = file;
                        process.stdout.write(path);
                        var req = {
                            url: '/foo'
                        };
                        var data = utils.ectHelpers(req, {
                            title: 'Hello, World!',
                            mod: {
                                name: 'foo'
                            },
                        })
                        renderer.render(path, data);
                        var elapsed = (new Date().getTime()) - timer;
                        console.log('\x1B[32m Done in ' + elapsed + ' ms \x1B[39m')
                    }
                    catch (e) {
                        if (e) {
                            console.log('\x1B[31m There was an error \x1B[39m');
                             expect(e).toBe(null);
                        }
                    }
                }
              //  expect(errors.length).toBe(0);
                done();
            }
        });
    });
});