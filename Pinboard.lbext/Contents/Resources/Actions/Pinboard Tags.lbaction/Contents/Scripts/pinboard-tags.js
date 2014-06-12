include('shared.js');

/**
 * Lists all tags, sorted by count.
 */
function run() {
	if (!loadApiToken()) return loginErrorAsListResults();

	var tags = getUrl('https://api.pinboard.in/v1/tags/get');
	if (!tags) return;

	var results = [];

	for (var tag in tags) {
		var count = tags[tag];

		var result = {
			title: tag,
			subtitle: count,
			action: 'listTag',
			actionArgument: tag,
			actionReturnsItems: true,
			count: count,
			icon: 'TagTemplate.png'
		};

		results.push(result);
	}

	results.sort(function(left, right) {
		return right.count - left.count;
	});

	return results;
}

/**
 * List the bookmarks for a given tag.
 * @param  {string} tag name of the tag.
 */
function listTag(tag) {
	if (!loadApiToken()) return;

	var posts = getUrl('https://api.pinboard.in/v1/posts/all', {
		tag: tag
	});

	if (!posts) return;

	return postsAsListResults(posts);
}