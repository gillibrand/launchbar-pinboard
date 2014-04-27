var path = require('path');

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
						dest: 'Pinboard Log In.lbaction/'
					},
					{
						expand: true,
						cwd: 'shared',
						src: 'Contents/Resources/**/*.png',
						dest: 'Pinboard Recent.lbaction/'
					},
					{
						expand: true,
						cwd: 'shared',
						src: 'Contents/Resources/**/*.png',
						dest: 'Pinboard Tags.lbaction/'
					},
					{
						expand: true,
						cwd: 'shared',
						src: 'Contents/Resources/**/*.png',
						dest: 'Pinboard Search.lbaction/'
					}
				]
			},

			installActions: {
				expand: true,
				src: ['Pinboard Recent.lbaction/**', 'Pinboard Log In.lbaction/**', 'Pinboard Tags.lbaction/**', 'Pinboard Search.lbaction/**'],
				dest: path.join(process.env.HOME, 'Library/Application Support/LaunchBar/Actions/')
			}
		},

		concat: {
			recent: {
				src: ['shared/Contents/Scripts/shared.js', 'Pinboard Recent.lbaction/Contents/Scripts/pinboard-recent.js'],
				dest: 'Pinboard Recent.lbaction/Contents/Scripts/shared+pinboard-recent.js'
			},
			tags: {
				src: ['shared/Contents/Scripts/shared.js', 'Pinboard Tags.lbaction/Contents/Scripts/pinboard-tags.js'],
				dest: 'Pinboard Tags.lbaction/Contents/Scripts/shared+pinboard-tags.js'
			},
			search: {
				src: ['shared/Contents/Scripts/shared.js', 'Pinboard Search.lbaction/Contents/Scripts/pinboard-search.js'],
				dest: 'Pinboard Search.lbaction/Contents/Scripts/shared+pinboard-search.js'
			}
		},

		watch: {
			install: {
				files: ['**/*.js', '!**/shared+*.js', 'shared/**/*.png', '*/*/Info.plist'],
				tasks: ['default', 'jshint']
			}
		},

		jshint: {
			options: {
				undef: true,
				node: true, 
				predef: ['getUrl', 'loadApiToken', 'LaunchBar', 'HTTP', 'Action', 'File', 'postsAsListResults'],
				laxbreak: true
			},
			scripts: ['Gruntfile.js', 'shared/**/*.js', '*.lbaction/**/*.js', '!**/shared+*.js']
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['jshint', 'copy:sharedResources', 'concat', 'copy:installActions']);

};
