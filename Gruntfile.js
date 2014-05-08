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
						src: 'Contents/Resources/**/*.png',
						dest: ACTIONS_DIR + 'Pinboard Log In.lbaction/'
					},
					{
						expand: true,
						cwd: 'shared',
						src: 'Contents/Resources/**/*.png',
						dest: ACTIONS_DIR + 'Pinboard Recent.lbaction/'
					},
					{
						expand: true,
						cwd: 'shared',
						src: 'Contents/Resources/**/*.png',
						dest: ACTIONS_DIR + 'Pinboard Tags.lbaction/'
					},
					{
						expand: true,
						cwd: 'shared',
						src: 'Contents/Resources/**/*.png',
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

		concat: {
			recent: {
				src: ['shared/Contents/Scripts/shared.js', ACTIONS_DIR + 'Pinboard Recent.lbaction/Contents/Scripts/pinboard-recent.js'],
				dest: ACTIONS_DIR + 'Pinboard Recent.lbaction/Contents/Scripts/shared+pinboard-recent.js'
			},
			tags: {
				src: ['shared/Contents/Scripts/shared.js', ACTIONS_DIR + 'Pinboard Tags.lbaction/Contents/Scripts/pinboard-tags.js'],
				dest: ACTIONS_DIR + 'Pinboard Tags.lbaction/Contents/Scripts/shared+pinboard-tags.js'
			},
			search: {
				src: [
					'shared/Contents/Scripts/shared.js',
					ACTIONS_DIR + 'Pinboard Search.lbaction/Contents/Scripts/search.js',
					ACTIONS_DIR + 'Pinboard Search.lbaction/Contents/Scripts/pinboard-search.js'],
				dest: ACTIONS_DIR + 'Pinboard Search.lbaction/Contents/Scripts/shared+search+pinboard-search.js'
			}
		},

		watch: {
			install: {
				files: ['**/*.js', 'shared/**/*.png', '*/*/Info.plist', '!**/shared+*.js', '!node_modules/**/*.js'],
				tasks: ['default']
			}
		},

		jshint: {
			options: {
				laxbreak: true
			},
			scripts: ['Gruntfile.js', 'shared/**/*.js', '*.lbaction/**/*.js', '!**/shared+*.js']
		},

		mochaTest: {
			test: {
				src: 'test/*.js'
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['jshint', 'copy:sharedResources', 'concat', 'copy:installActions']);

};
