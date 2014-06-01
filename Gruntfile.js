module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        expand: true,
        bare: true,
        cwd: 'src/',
        src: ['**/*.coffee'],
        dest: 'lib/',
        ext: '.js'
      }
    },
    copy: {
      main: {
        expand: true,
        cwd: 'src/views/',
        src: ['**'],
        dest: 'lib/views/'
      }
    },
    less: {
      development: {
        files: {
          "public/css/main.css": "src/less/main.less"
        }
      }
    }
  });
  grunt.registerTask('configure', 'Configure the app', function() {

    var cb = this.async();
    if(grunt.option('mode') === "copy")
      return copyFile('config.json.default', 'config.json', cb);


    if(grunt.option('mode') === "interactive") {

    }
    else {
      console.log("Usage:  grunt configure --mode={mode}\n")
      console.log("        - mode: ")
      console.log("           - copy:        copy config.json.defaut into config.json ")
      console.log("           - interactive: interactive confuration\n\n")
      grunt.fail.warn("Missing mode.")
    }
  });
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  // grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('build', ['coffee', 'copy', 'less']);
  grunt.registerTask('templates', ['copy']);



};
var fs = require("fs");
function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}
