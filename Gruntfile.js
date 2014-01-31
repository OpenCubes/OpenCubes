module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['Gruntfile.js', 'server/**/*.js', 'test/**/*.js', '!server/less/**/*.js'],
            options: {
                // options here to override JSHint defaults
                jshintrc: '.jshintrc', // relative to Gruntfile
                asi: true,
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        jasmine: {
            pivotal: {
                src: 'tests/*'
            }
        },
        shell: { // Task
            jasmine: { // Target
                options: { // Options
                    stdout: true,
                    callback: function log(err, stdout, stderr, cb) {
                        cb();
                    }
                },
                command: 'jasmine-node tests'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
   // grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-shell');
    grunt.registerTask('test', ['jshint', 'shell']);

    grunt.registerTask('default', ['shell']);



};