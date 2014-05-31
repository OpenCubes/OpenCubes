var Version = require("../lib/api/version")

describe("version comparator", function() {
  it("should be able to detemine most recent version", function(done) {
    // First is ALWAYS more recent
    var data = {
      "1.7.3#1.0.0:1.7.3#1.0.0": false,
      "1.7.3#1.0.0:1.7.3#1.0.1": false,
      "1.7.3#1.0.1:1.7.3#1.0.0": true,
      "1.7.3#1.0.0:1.7.3#0.9.0": true,
      "1.7.3#1.0.0:1.7.3#1.0.0": false,
      "1.7.3#2.0.0:1.7.3#1.0.0": true,
      "1.7.4#1.0.0:1.7.3#1.0.0": true,
      "1.7.3#1.0.0:2.7.3#1.0.0": false,
      "1.2.3#4.5.6:7.8.9#10.11.12": false,
    }
    for (var d in data) {
      var splitted = d.split(":")
      expect(new Version(splitted[0]).isGreaterThan(splitted[1])).toBe(data[
        d]);
    }

    done();
  });
  it("should be able to detemine equal version", function(done) {
    // First is ALWAYS more recent
    var data = {
      "1.7.3#1.0.0:1.7.3#1.0.0": true,
      "1.7.3#1.0.0:1.7.3#1.0.1": false,
      "1.7.3#1.0.0:1.7.3#1.0.0": false,
      "1.7.3#1.0.0:2.7.3#1.0.0": false,
      "1.2.3#4.5.6:7.8.9#10.11.12": false,
    }
    for (var d in data) {
      var splitted = d.split(":")
      expect(new Version(splitted[0]).isGreaterThan(splitted[1])).toBe(data[
        d]);
    }

    done();
  });
  it("should be able to use matchers", function(done) {
    // First is ALWAYS more recent
    var data = {
      "1.7.3#1.0.x:1.7.3#1.0.0": true,
      "1.7.3#1.0.x:1.7.3#1.0.10": true,
      "1.7.3#1.0.1+:1.7.3#1.0.5": true,
      "1.7.3#1.x:1.7.3#1.5.0": true,
      "1.7.3#x:1.7.3#1.5.0": true,
      "1.7.x#1.x:1.7.5#1.5.0": true,
      "1.7.x#1.x:1.8.0#1.5.0": false,
    }
    for (var d in data) {
      var splitted = d.split(":");
      var matched;
      try {
        matched = new Version(splitted[0]).matches(splitted[1]);

      } catch (err) {
        console.log("Error with "+ splitted[0] + " and "+ splitted[1]);
        throw err;
      }
      expect(matched).toBe(data[d]);
    }

    done();
  });
});
