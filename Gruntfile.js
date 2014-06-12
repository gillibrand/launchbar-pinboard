var path = require('path');

var ACTIONS_DIR = 'Pinboard.lbext/Contents/Resources/Actions/';


module.exports = function(grunt) {
	grunt.initConfig({

		clean: {
			build: '**/shared+*.js'
		},

		copy: {
			sharedResources: {
				files: [
					{
						expand: true,
						cwd: 'shared',
						src: ['Contents/Resources/**/*.png'],
						dest: ACTIONS_DIR + 'Pinboard Log In.lbaction/'
					},
					{
						expand: true,
						cwd: 'shared',
						src: ['Contents/Resources/**/*.png', 'Contents/Scripts/*.js'],
						dest: ACTIONS_DIR + 'Pinboard Recent.lbaction/'
					},
					{
						expand: true,
						cwd: 'shared',
						src: ['Contents/Resources/**/*.png', 'Contents/Scripts/*.js'],
						dest: ACTIONS_DIR + 'Pinboard Tags.lbaction/'
					},
					{
						expand: true,
						cwd: 'shared',
						src: ['Contents/Resources/**/*.png', 'Contents/Scripts/*.js'],
						dest: ACTIONS_DIR + 'Pinboard Search.lbaction/'
					}
				]
			},

			installActions: {
				cwd: 'Pinboard.lbext/Contents/Resources/Actions',
				expand: true,
				src: [
					'Pinboard Recent.lbaction/**',
					'Pinboard Log In.lbaction/**',
					'Pinboard Tags.lbaction/**',
					'Pinboard Search.lbaction/**'],
				dest: path.join(
					process.env.HOME || process.env.USERPROFILE,
					'Library/Application Support/LaunchBar/Actions/')
			}
		},

		watch: {
			install: {
				files: ['**/*.js', 'shared/**/*.png', '*/*/Info.plist', '!node_modules/**/*.js'],
				tasks: ['default']
			}
		},

		jshint: {
			options: {
				laxbreak: true
			},
			scripts: ['Gruntfile.js', 'shared/**/*.js', '*.lbaction/**/*.js']
		},

		mochaTest: {
			test: {
				src: 'test/*.js'
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['jshint', 'copy:sharedResources', 'copy:installActions']);

};
