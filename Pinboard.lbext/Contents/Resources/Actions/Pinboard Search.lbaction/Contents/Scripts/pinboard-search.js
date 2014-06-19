include('shared.js');
include('search.js');

function runWithString(query) {

	if (!query) {
		return [];
	}

	if (!loadApiToken()) {

		return loginErrorAsListResults();
	}

	var posts = getAllPosts();

	var matchingPosts = searchPosts(posts, query);
	var results = postsAsListResults(matchingPosts);

	if (query.toLowerCase() === 'refresh') {
		results.unshift({
			title: 'Refresh your out-of-date bookmarks',
			subtitle: 'Try this if your most recent bookmarks are missing from search results',
			action: 'clearCachedAllPosts'
		});
	}

	return results;
}	

function searchPosts(simplePosts, query) {
	query = query.toLowerCase().trim();
	if (query.length < 2) return [];

	return search.searchObjectsWithIndexedText(simplePosts, query);
}

