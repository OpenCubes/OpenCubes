module.exports = function (grunt) {

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
        }
    });
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-jasmine');


    grunt.registerTask('build', ['coffee', 'copy']);



};
