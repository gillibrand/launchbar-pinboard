var assert = require('assert');
var searching = require('../Pinboard Search.lbaction/Contents/Scripts/searching');

describe('pinboard-search', function() {
	describe('searchPosts', function() {
		
		it('should find one match', function() {
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

			var matches = searching.searchObjectsWithIndexedText('apple', all);
			assert.equal(1, matches.length);
			assert.equal(0, matches[0].id);
		});
		
		it('should find no matches', function() {
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

			var matches = searching.searchObjectsWithIndexedText('green', all);
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

			var matches = searching.searchObjectsWithIndexedText('red', all);
			assert.equal(3, matches.length);
			assert.equal(1, matches[0].id);
		});

		it('should score more search terms hits higher', function() {
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

			var matches = searching.searchObjectsWithIndexedText('red apple', all);
			assert.equal(3, matches.length);
			assert.equal(1, matches[0].id);
		});

	});
});