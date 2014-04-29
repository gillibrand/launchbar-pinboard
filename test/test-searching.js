var assert = require('assert');
var searching = require('../Pinboard Search.lbaction/Contents/Scripts/searching');

describe('searching', function() {

	describe('searchPosts', function() {
		

		it('finds one match', function() {
			var all = [
				{
					id: 0,
					indexedText: searching.indexText('Red Apple')
				},
				{
					id: 1,
					indexedText: searching.indexText('Red Cherry')
				}
			];

			var matches = searching.searchObjectsWithIndexedText(all, 'Apple');
			assert.equal(1, matches.length);
			assert.equal(0, matches[0].id);
		});
		

		it('finds no matches', function() {
			var all = [
				{
					id: 0,
					indexedText: searching.indexText('Red Apple')
				},
				{
					id: 1,
					indexedText: searching.indexText('Red Cherry')
				}
			];

			var matches = searching.searchObjectsWithIndexedText(all, 'green');
			assert.equal(0, matches.length);
		});
		

		it('scores more hits in target', function() {
			var all = [
				{
					indexedText: searching.indexText('Red Cherry'),
					id: 0
				},
				{
					indexedText: searching.indexText('Red Cherry Red'),
					id: 1
				},
				{
					indexedText: searching.indexText('Red Cherry'),
					id: 2
				}
			];

			var matches = searching.searchObjectsWithIndexedText(all, 'red');
			assert.equal(3, matches.length);
			assert.equal(1, matches[0].id);
		});


		it('scores more search terms higher', function() {
			var all = [
				{
					indexedText: searching.indexText('Red Cherry'),
					id: 0
				},
				{
					indexedText: searching.indexText('Red Apple'),
					id: 1
				},
				{
					indexedText: searching.indexText('Red Grapes'),
					id: 2
				}
			];

			var matches = searching.searchObjectsWithIndexedText(all, 'red apple');
			assert.equal(3, matches.length);
			assert.equal(1, matches[0].id);
		});

	});
});