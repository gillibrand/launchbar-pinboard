var apiToken_;

function loadApiToken() {
	var file = Action.supportPath;
	var lastSlash = file.lastIndexOf('/');
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
	 		'You are not longer logged in to Pinboard through LaunchBar.',
	 		'You API token is wrong or has expired. You must enter it again.');
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
function run() {
	if (!loadApiToken()) return;

	var data = getUrl('https://api.pinboard.in/v1/posts/recent', {
		count: 25
	});
	if (!data) return;

	return postsAsListResults(data.posts);
}