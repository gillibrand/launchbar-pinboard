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