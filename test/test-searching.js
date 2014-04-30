var assert = require('assert');
var search = require('../Pinboard Search.lbaction/Contents/Scripts/search');

describe('search', function() {

	describe('searchPosts', function() {
		

		it('finds one match', function() {
			var all = [
				{
					id: 0,
					indexedText: search.indexText('Red Apple')
				},
				{
					id: 1,
					indexedText: search.indexText('Red Cherry')
				}
			];

			var matches = search.searchObjectsWithIndexedText(all, 'Apple');
			assert.equal(1, matches.length);
			assert.equal(0, matches[0].id);
		});
		

		it('finds no matches', function() {
			var all = [
				{
					id: 0,
					indexedText: search.indexText('Red Apple')
				},
				{
					id: 1,
					indexedText: search.indexText('Red Cherry')
				}
			];

			var matches = search.searchObjectsWithIndexedText(all, 'green');
			assert.equal(0, matches.length);
		});
		

		it('scores more hits in target', function() {
			var all = [
				{
					indexedText: search.indexText('Red Cherry'),
					id: 0
				},
				{
					indexedText: search.indexText('Red Cherry Red'),
					id: 1
				},
				{
					indexedText: search.indexText('Red Cherry'),
					id: 2
				}
			];

			var matches = search.searchObjectsWithIndexedText(all, 'red');
			assert.equal(3, matches.length);
			assert.equal(1, matches[0].id);
		});


		it('scores more search terms higher', function() {
			var all = [
				{
					indexedText: search.indexText('Red Cherry'),
					id: 0
				},
				{
					indexedText: search.indexText('Red Apple'),
					id: 1
				},
				{
					indexedText: search.indexText('Red Grapes'),
					id: 2
				}
			];

			var matches = search.searchObjectsWithIndexedText(all, 'red apple');
			assert.equal(3, matches.length);
			assert.equal(1, matches[0].id);
		});

		it('should prefer more search word matches', function() {
			var all = [
				{
					indexedText: search.indexText('book'),
					id: 0
				},
				{
					indexedText: search.indexText('book fruit'),
					id: 1
				},
				{
					indexedText: search.indexText('fruit book fruit'),
					id: 2
				},
				{
					indexedText: search.indexText('fruit'),
					id: 3
				}
			];

			var matches = search.searchObjectsWithIndexedText(all, 'fruit book');
			assert.equal(4, matches.length);
			assert.equal(2, matches[0].id);
		});

	});
});