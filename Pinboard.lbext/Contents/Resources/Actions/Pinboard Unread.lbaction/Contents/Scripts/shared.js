/*
 * This script is copied (grunt) to each action directory so they can share
 * common log in and HTTP request behaviour. It is included in each action with
 * the LaunchBar specific `include` function, but this seems to require the
 * shared script to be in the same directory as the calling script.
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
		LaunchBar.log('Failed to read log in token.');
		return false;
	}
}

/**
 * Return a single action result to defers to the login in action.
 * Used from other actions that can't get the API token (not logged in yet).
 * 
 * @return {array} single action to log in.
 */
function loginErrorAsListResults() {
	return [{
		title: 'Log In to Pinboard',
		subtitle: 'Continue to log in with LaunchBar.',
		actionBundleIdentifier: 'gillibrand.jay.pinboard.login'
	}];
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

	 LaunchBar.debugLog('GET ' + url);

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
			icon: 'BookmarkTemplate.icns'
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

function clearCachedAllPosts() {
	Action.preferences.lastCacheTime = null;
	LaunchBar.displayNotification({
		subtitle: 'Pinboard for LaunchBar',
		string: 'Cleared cached Pinboard bookmarks.'
	});
}

/**
 * Gets potentially all posts. Reads them from the cache file if available and
 * it's less than 5 minutes old (as recommended by Pinboard.in for be-nice rate
 * limiting).
 *
 * Unfortunately the cache is per-action since this shared script is actually
 * copied to each action, and there is no trivial way to share preferences and
 * support directories between actions.
 * 
 * @param  {object} params extra params to append to the "all" request.
 * If the results are already cached, this is ignored (ugh).
 * @return {array}        all posts, possibly from the cache. May be filtered
 * if params were passed.
 */
function getAllPosts(params) {
	var posts = getCachedAllPosts();

	if (!posts) {
		posts = cacheAllPosts(params);
	}

	return posts;
}


// duplicated from search.js since that's not "shared" will all actions.
// TODO: clean up. Probably put all search.js into shared for simplicity.
function indexText(text) {
	return text.toLowerCase();
}

var ALL_POSTS_FILE = Action.supportPath + '/all-posts.json';

/**
 * Gets all posts and caches in the files system. Updates
 * a "last cache" time in the preferences of the current action.
 * @param  {object} params extra params to pass to the "all" request.
 * @return {array}        all posts.
 */
function cacheAllPosts(params) {
	LaunchBar.log('Caching all bookmarks for local searching.');
	var allPosts = getUrl('https://api.pinboard.in/v1/posts/all', params);

	var simplePosts = allPosts.map(function(post) {
		var indexedText = indexText(post.description + ' ' + post.extended + ' ' + post.tags);
		post.indexedText = indexedText;
		return post;
	});
	
	File.writeJSON({
		simplePosts: simplePosts
	}, ALL_POSTS_FILE);

	Action.preferences.lastCacheTime = Date.now();

	return simplePosts;
}

/**
 * Gets all the cached posts or null if there are none
 * or the cache time expired.
 * @return {array} null or array of cached posts.
 */
function getCachedAllPosts() {
	var lastCacheTime = Action.preferences.lastCacheTime;

	if (!lastCacheTime) {
		LaunchBar.log('List of all my posts was never cached.');
		return null;
	}

	var diffMillis = Date.now() - lastCacheTime;

	if (diffMillis >= 5 * 1000) {
		LaunchBar.log('List of all my posts is older than 5 mins. May re-cache all posts...');
		
		var lastUpdateIso = Action.preferences.lastUpdateIso;

		var updateIso = getUrl('https://api.pinboard.in/v1/posts/update').update_time;
		LaunchBar.debugLog('Last update time: ' + updateIso);
		Action.preferences.lastUpdateIso = updateIso;

		if (!lastUpdateIso) {
			LaunchBar.log('No last update time was found. Will re-cache.');
			return null;
		}

		if (updateIso !== lastUpdateIso) {
			LaunchBar.log('Bookmarks were updated. Will re-cache.');
			return null;
		}
	}

	try {
		var simplePosts = File.readJSON(ALL_POSTS_FILE).simplePosts;
		LaunchBar.log('Using cached list of all my posts.');
		return simplePosts;
	}
	catch (e) {
		LaunchBar.log('No cached all-posts files.');
		return null;
	}
}