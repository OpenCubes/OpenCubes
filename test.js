var validator = require("./server/api/validator");
console.log(validator.validate({
  foo: "<b>Foo</b>"
}, {
  foo: {
    name: "<b>Foo</b>",
    rules: []
  },
  mail: {
    name: "Email",
    required: false,
    rules: [validator.rules.regex("[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\\.[a-zA-Z]{2,4}")]
  }
}));
