include('shared.js');
include('search.js');

var ALL_POSTS_FILE = Action.supportPath + '/all-posts.json';

function runWithString(query) {

	if (!query) {
		return [];
	}

	if (!loadApiToken()) {

		return loginErrorAsListResults();
	}

	var posts = getCachedAllPosts();

	if (!posts) {
		posts = cacheAllPosts();
	}

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

function clearCachedAllPosts() {
	Action.preferences.lastCacheTime = null;
	LaunchBar.displayNotification({
		subtitle: 'Pinboard for LaunchBar',
		string: 'Cleared cached Pinboard bookmarks.'
	});
}

function searchPosts(simplePosts, query) {
	query = query.toLowerCase().trim();
	if (query.length < 2) return [];

	return search.searchObjectsWithIndexedText(simplePosts, query);
}

function cacheAllPosts() {
	var allPosts = getUrl('https://api.pinboard.in/v1/posts/all');

	var simplePosts = allPosts.map(function(post) {
		var indexedText = search.indexText(post.description + ' ' + post.extended + ' ' + post.tags);
		post.indexedText = indexedText;
		return post;
	});
	
	File.writeJSON({
		simplePosts: simplePosts
	}, ALL_POSTS_FILE);

	Action.preferences.lastCacheTime = Date.now();

	return simplePosts;
}

function getCachedAllPosts() {
	var lastCacheTime = Action.preferences.lastCacheTime;

	if (!lastCacheTime) {
		LaunchBar.debugLog('List of all my posts was never cached.');
		return null;
	}

	var diffMillis = Date.now() - lastCacheTime;

	if (diffMillis >= 5 * 60 * 1000) {
		LaunchBar.debugLog('List of all my posts is older than 5 mins. Ignoring cached list.');
		return null;
	}

	try {
		var simplePosts = File.readJSON(ALL_POSTS_FILE).simplePosts;
		LaunchBar.debugLog('Using cached list of all my posts.');
		return simplePosts;
	}
	catch (e) {
		LaunchBar.debugLog('No cached all-posts files.');
		return null;
	}
}
