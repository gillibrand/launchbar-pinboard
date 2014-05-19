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

function loginActionSupportPath() {
	var path = Action.supportPath;
	var lastSlash = path.lastIndexOf('/');
	return path.slice(0, lastSlash) + '/gillibrand.jay.pinboard.login';
}

function loginCachePath() {
	var path = Action.cachePath;
	var lastSlash = path.lastIndexOf('/');
	return path.slice(0, lastSlash) + '/gillibrand.jay.pinboard.login';
}

function loginBundleResources() {
	var path = Action.path;
	var lastSlash = path.lastIndexOf('/');
	return path.slice(0, lastSlash) + '/Pinboard Log In.lbaction/Contents/Resources';
}

/**
 * Reads the saved API token from a support file.
 * If the file cannot be read, prompts the user for
 * the API token to save.
 * 
 * @return {boolean} true if the token was loaded (user is logged in).
 */
function loadApiToken() {
	// The file is save in the support folder for the Pinboard Log In action.
	// Different actions can't share a support folder, so just hard-code where it is.
	file = loginActionSupportPath() + '/api-token.txt';

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

function siteForUrl(url) {
	var start = url.indexOf('://');
	var end = url.indexOf('/', start + 3);
	var site = end === -1 ? url : url.slice(0, end);
	return site + '/';
}

/**
 * Converts Piboard post (bookmark) JSON objects to list results
 * to present in LaunchBar.
 * @param  {array} posts the Pinboard post objects as returned from HTTP JSON requests.
 * @return {array}       LaunchBar results.
 */
function postsAsListResults(posts) {

	var faviconCacheDir = loginCachePath();

	var cmd = [loginBundleResources() + '/favicons', '-fork', '-dir', faviconCacheDir];

	posts.forEach(function(post) {
		var site = siteForUrl(post.href);
		post.site = site;
		post.icon = site + '.png';
		cmd.push(site);
	});

	try {
		LaunchBar.execute.apply(LaunchBar, cmd);
	}
	catch (e) {
		LaunchBar.log('Failed to execute process to download favicons. The error was: ' + e);
	}

	return posts.map(function(post) {
		var iconFileName = post.site.replace(/^https?:\/\//, '').replace(/\/$/, '.png');
		var iconPath = faviconCacheDir + '/' + iconFileName;

		if (!File.exists(iconPath)) iconPath = undefined; 
		// Was using a custom bookmark icon (BookmarkTemplate.png), but
		//decided switched to LaunchBar default when there is no custom
		//favicon to avoid confusion.

		var result = {
			title: post.description,
			url: post.href,
			icon: iconPath
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