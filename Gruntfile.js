module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      serve: {
        files: ['server.js', 'src/**/*.coffee'],
        tasks: ['coffee', 'develop'],
        options: {
          nospawn: true
        }
      },
      css: {
        files: ['lib/less/main.less'],
        tasks: ['less'],
        options: {
          nospawn: true
        }
      },
      test: {
        files: ['tests/*.spec.js', 'src/**/*.coffee'],
        tasks: ['coffee', 'jasmine_node'],
        options: {
          nospawn: true
        }
      }
    },

    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: 'spec',
        jUnit: {
          useDotNotation: true,
          consolidate: true
        }
      },
      all: ['tests/']
    },
    develop: {
      server: {
        file: 'server.js'
      }
    },
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

    jasmine: {
      pivotal: {
        src: 'src/**/*.js',
        options: {
          specs: 'tests/*.spec.js'
        }
      }
    },
    less: {
      development: {
        files: {
          "public/css/main.css": "lib/less/main.less"
        }
      }
    },
    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      serve: {
        tasks: ["watch:css", "watch:serve"]
      },
    }
  });
  grunt.registerTask('usetheforce_on', 'force the force option on if needed',

  function() {
    if (!grunt.option('force')) {
      grunt.config.set('usetheforce_set', true);
      grunt.option('force', true);
    }
  });
  grunt.registerTask('usetheforce_restore', 'turn force option off if we have previously set it',

  function() {
    if (grunt.config.get('usetheforce_set')) {
      grunt.option('force', false);
    }
  });
  grunt.registerTask('configure', 'Configure the app', function() {

    var cb = this.async();
    if (grunt.option('mode') === "copy") return copyFile('config.json.default', 'config.json', cb);


    if (grunt.option('mode') === "interactive") {

    }
    else {
      console.log("Usage:  grunt configure --mode={mode}\n")
      console.log("        - mode: ")
      console.log("           - copy:        copy config.json.defaut into config.json ")
      console.log("           - interactive: interactive confuration\n\n")
      grunt.fail.warn("Missing mode.")
    }
  });
  grunt.registerTask('start', 'My start task description', function() {
    grunt.util.spawn({
      cmd: 'node',
      args: ['serve.js']
    });
    grunt.task.run('watch');
  });
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-develop');
  // grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.registerTask('serve', ['coffee', 'develop', 'concurrent:serve']);
  grunt.registerTask('test', ['coffee', 'jasmine_node'/*, 'watch:test'*/]);
  grunt.registerTask('build', ['coffee', 'less']);
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
