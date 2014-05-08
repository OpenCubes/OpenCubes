var validator = require("../lib/api/validator");

describe("validator", function () {
  it("should be able to check the length", function (done) {
    var data = {
      "": false,
      "f": false,
      "fo": false,
      "foo": true,
      "fooo": true,
      "foooo": true,
      "fooooo": false,
    }
    var rules = {
      foo: {
        name: "",
        rules: [validator.rules.size(3, 5)]
      }
    }
    for (var d in data) {
      var v = validator.validate({
        foo: d
      }, rules).valid;
      expect(v).toBe(data[d]);
    }

    done();
  });
  it("should be able to check an email", function (done) {
    var data = {
      "foo@bar.com": true,
      "foo@bar.foobar": true,
      "foo@bar": false,
      "foo@": false,
      "@bar": false,
      "@bar.com": false,
      "a@b.c": false,
    }
    var rules = {
      foo: {
        name: "",
        rules: [validator.rules.email()]
      }
    }
    for (var d in data) {
      var v = validator.validate({
        foo: d
      }, rules).valid;
      expect(v).toBe(data[d]);
    }

    done();
  });
  it("should be able to check required fields or not", function (done) {
    expect(validator.validate({}, {
      foo: {
        name: "Foo",
        rules: []
      },
    }).valid).toBe(true);
    expect(validator.validate({}, {
      foo: {
        required: true,
        name: "Foo",
        rules: []
      }
    }).valid).toBe(false);

    done();
  });
  it("should be able to escape fields or not", function (done) {
    var fields = validator.validate({
      foo: "<b>Foo</b>",
      bar: "<b>Bar</b>"
    }, {
      foo: {
        rules: []
      },
      bar: {
        rules: [],
        escape: false
      }
    }).fields;
    expect(fields).toEqual({
      foo: "&lt;b&gt;Foo&lt;/b&gt;",
      bar: "<b>Bar</b>"
    });

    done();
  });
  it("should be able to trim fields or not", function (done) {
    var fields = validator.validate({
      foo: "Foo ",
      bar: "Bar "
    }, {
      foo: {
        rules: []
      },
      bar: {
        rules: [],
        trim: false
      }
    }).fields;
    expect(fields).toEqual({
      foo: "Foo",
      bar: "Bar "
    });

    done();
  });
});
