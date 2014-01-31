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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('test', ['jshint']);

    grunt.registerTask('default', ['jshint']);



};