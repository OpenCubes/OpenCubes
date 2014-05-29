
var Version = require("../lib/api/version")

describe("version comparator", function () {
  it("should be able to detemine most recent version", function (done) {
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
      expect(new Version(splitted[0]).isGreaterThan(splitted[1])).toBe(data[d]);
    }

    done();
  });
  it("should be able to detemine equal version", function (done) {
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
      expect(new Version(splitted[0]).isGreaterThan(splitted[1])).toBe(data[d]);
    }

    done();
  });
});
