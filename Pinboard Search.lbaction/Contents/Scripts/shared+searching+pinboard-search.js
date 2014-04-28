/*
 * This script is concatenated (grunt) to the head of every other script so they
 * can share common log in and HTTP request behaviour.
 * This is needed since there is no JavaScript API to load other files
 * and there can only be a single entry point (.run) for each action in
 * LaunchBar. Each concated script is named like `shared+<the script>.js`.
 */

/**
 * Just globally store the API token after reading from the file.
 */
var apiToken_;

/**
 * Reads the saved API token from a support file.
 * If the file cannot be read, prompts the user for
 * the API token to save.
 * 
 * @return {boolean} true if the token was loaded (user is logged in).
 */
function loadApiToken() {
	var file = Action.supportPath;
	var lastSlash = file.lastIndexOf('/');
	// The file is save in the support folder for the Pinboard Log In action.
	// Different actions can't share a support folder, so just hard-code where it is.
	file = file.slice(0, lastSlash) + '/gillibrand.jay.pinboard.login/api-token.txt';

	try {
		apiToken_ = File.readText(file);
		return true;
	}
	catch (e) {
		LaunchBar.performAction('Pinboard: Log In');
		return false;
	}
}

/**
 * HTTP GET a give Pinboard. Automatically requests JSON format
 * and include the API token (which must be loaded with loadApiToken first).
 *
 * Will automatically prompt for a new API token if hits a 401.
 * 	
 * @param  {string} url    URL to load.
 * @param  {object} params optional hash of parameter names to values.
 * @return {object}        the JSON result. null if not loaded.
 */
function getUrl(url, params) {
	 url = url + '?format=json&auth_token=' + apiToken_;

	 if (params) {
	 	for (var name in params) {
	 		url += '&' + name + '=' + params[name];
	 	}
	 }

	 var result = HTTP.getJSON(url);

	 if (result.data) return result.data;

	 if (result.response.status === 401) {
	 	LaunchBar.alert(
	 		'You are no longer logged in to Pinboard through LaunchBar.',
	 		'Your API token is wrong or has expired. You must enter it again.');
	 	LaunchBar.performAction('Pinboard: Log In');
	 	return null;
	 }
	 else {
		 LaunchBar.alert(
		 	'Could not contact Pinboard.',
		 	'This may be a temporary error. Try again later.\n\nPinboard said: ' + result.response.status + ' ' + result.response.localizedStatus);
		 return null;
	 }
}

/**
 * Converts Piboard post (bookmark) JSON objects to list results
 * to present in LaunchBar.
 * @param  {array} posts the Pinboard post objects as returned from HTTP JSON requests.
 * @return {array}       LaunchBar results.
 */
function postsAsListResults(posts) {
	return posts.map(function(post) {
		var result = {
			title: post.description,
			url: post.href,
			icon: 'BookmarkTemplate.png'
		};

		result.subtitle = post.extended
			? post.extended
			: post.href;

		if (post.tags) {
			result.title = result.title + ' (' + post.tags + ')';
		}

		return result;
	});
}
var WHITESPACE = /\s+/;

function scoreIndexedText(q, indexedText) {
	var searchWords = q.toLowerCase().split(WHITESPACE);

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

function searchObjectsWithIndexedText(q, objects) {
	var matchingObjects = [];

	for (var i = 0; i < objects.length; i++) {
		var object = objects[i];
		var score = scoreIndexedText(q, object.indexedText);
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

if (exports) {
	// Pretend this is an AMD module to use Mocha tests
	exports.searchObjectsWithIndexedText = searchObjectsWithIndexedText;
	exports.indexText = indexText;
}

var ALL_POSTS_FILE = Action.supportPath + '/all-posts.json';

function run(query) {
	if (!query) {
		return [];
	}

	if (!loadApiToken()) return;

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

	return simplePosts.filter(function(simplePost) {
		return simplePost.indexedText.indexOf(query) !== -1;
	});
}

function cacheAllPosts() {
	var allPosts = getUrl('https://api.pinboard.in/v1/posts/all');

	var simplePosts = allPosts.map(function(post) {
		var indexedText = (post.description + ' ' + post.extended + ' ' + post.tags + ' ' + post.href).toLowerCase();
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
