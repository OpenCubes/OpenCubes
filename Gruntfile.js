module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        coffee: {

            compile: {
                options: {
                    bare: true
                },
                files: {
                    'lib/**': 'src/**.coffee', // 1:1 compile
                }
            },

        }
    });
    grunt.loadNpmTasks('grunt-contrib-coffee');
    // grunt.loadNpmTasks('grunt-contrib-jasmine');


    grunt.registerTask('build', ['coffee']);



};
