module.exports = function (grunt) {
    grunt.initConfig({
        env: {
            test_lockdown: {
                "NOCK_BACK_MODE": "lockdown"
            },
            test_record: {
                "NOCK_BACK_MODE": "record"
            },
            test_dryrun: {
                "NOCK_BACK_MODE": "dryrun"
            },
            test_wild: {
                "NOCK_BACK_MODE": "wild"
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            test: {
                options: {
                    reporter: "spec",
                    require: 'node.js/tests/tests-include.js',
                    quiet: false
                },
                // NOTICE: ignore test2.js test due it's
                src: ['node.js/tests/ssl_test.js']
            },
            unit: 'karma.conf.js'
        },
        nodeunit: {
            tests: ['node.js/tests/unit-test.js'],
            options: {}
        }
    });

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('test', ['test-lockdown']);
    grunt.registerTask('test-lockdown', ['env:test_lockdown', "mochaTest"]);
    grunt.registerTask('test-dryrun', ['env:test_dryrun', "mochaTest"]);
    grunt.registerTask('test-record', ['env:test_record', "mochaTest"]);
    grunt.registerTask('test-wild', ['env:test_wild', "mochaTest"]);
    // TODO: refactor unit testing
    // grunt.registerTask('test:unit', ['nodeunit']);
};