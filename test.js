var format = {
  foo: "string",
  bar: "string"
};
var data = {
  foo: "bar",
  bar: []
}
var validate = function (data, format) {
  for(var d in data) {
    if(typeof data[d] !== format[d]) 
      return false;
  }
  return true;
}
console.log(validate(data, format));