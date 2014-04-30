var search = (function() {
	var WHITESPACE = /\s+/;

	/**
	 * Assignes a score (higher is better) to an indexed text
	 * string based on how well it matches the search words.
	 * @param  {array} searchWords words to search for--the text the user
	 *     searches for.
	 * @param  {string} indexedText
	 * @return {number}             score for how well the indexed text
	 *     matches the search words.
	 */
	function scoreIndexedText(searchWords, indexedText) {
		var score = 0;

		for (var i = 0; i < searchWords.length; i++) {
			var searchWord = searchWords[i];

			// The first time a word is found, increase the score a lot.
			// Repeats of the same word score much lower. This ranks multiple
			// word matches very high, but gives some weight to repeated words
			// too.
			var scoreWeight = 10;

			var atIndex = 0;
			while (true) {
				atIndex = indexedText.indexOf(searchWord, atIndex);
				if (atIndex === -1) break;

				score += scoreWeight;
				scoreWeight = 1;
				atIndex += 1;
			}
		}

		return score;
	}

	/**
	 * Given objects with a .indexedText property, filters out any that don't
	 * match the search string and sorts the results with closest matching
	 * first.
	 * @param  {array} objects      objects with a .indexedText property.
	 * @param  {string} searchString space separated string of words to search
	 *     for.
	 * @return {array}              sorted, matching objects.
	 */
	function searchObjectsWithIndexedText(objects, searchString) {
		var searchWords = searchString.toLowerCase().split(WHITESPACE);
		var matchingObjects = [];

		objects.forEach(function(object) {
			var score = scoreIndexedText(searchWords, object.indexedText);
			if (score > 0) {
				object.__score__ = score;
				matchingObjects.push(object);
			}
		});

		matchingObjects.sort(function(left, right) {
			return right.__score__ - left.__score__;
		});

		matchingObjects.forEach(function(m) {
			delete m.__score__;
		});
	
		return matchingObjects;
	}

	/**
	 * Given a text string, creates a indexed version of that text that can be
	 * used for a full text search later. Currenlty this just lowercases the
	 * text, but could strip stop-words or repeates in the future.
	 * @param  {string} text text to index.
	 * @return {string}      indexed text to use with other functions in this
	 *     module.
	 */
	function indexText(text) {
		return text.toLowerCase();
	}

	return {
		indexText: indexText,
		searchObjectsWithIndexedText: searchObjectsWithIndexedText
	};
})();

try {
	module.exports = search;
}
catch (e) {
	// not in a node.js
}
