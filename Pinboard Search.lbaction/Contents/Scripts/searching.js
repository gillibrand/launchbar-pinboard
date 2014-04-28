var searching = (function() {
	var WHITESPACE = /\s+/;

	function scoreIndexedText(searchWords, indexedText) {
		var score = 0;

		for (var i = 0; i < searchWords.length; i++) {
			var searchWord = searchWords[i];

			var atIndex = 0;
			while (true) {
				atIndex = indexedText.indexOf(searchWord, atIndex);
				if (atIndex === -1) break;

				score += 1;
				atIndex += 1;
			}

			if (indexedText.indexOf(searchWord) !== -1) score += 1;
		}

		return score;
	}

	function searchObjectsWithIndexedText(objects, searchString) {
		var searchWords = searchString.toLowerCase().split(WHITESPACE);
		var matchingObjects = [];

		for (var i = 0; i < objects.length; i++) {
			var object = objects[i];
			var score = scoreIndexedText(searchWords, object.indexedText);
			if (score > 0) {
				object.__score__ = score;
				matchingObjects.push(object);
			}
		}

		matchingObjects.sort(function(left, right) {
			return right.__score__ - left.__score__;
		});

		for (i = 0; i < matchingObjects.length; i++) {
			delete matchingObjects[i].__score__;
		}

		return matchingObjects;
	}

	function indexText(text) {
		return text.toLowerCase();
	}

	return {
		indexText: indexText,
		searchObjectsWithIndexedText: searchObjectsWithIndexedText
	};
})();


if (module) {
	// Pretend this is an AMD module to use Mocha tests
	module.exports = searching;
}
