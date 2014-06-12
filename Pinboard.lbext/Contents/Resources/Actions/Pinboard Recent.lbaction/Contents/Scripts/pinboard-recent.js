include('shared.js');

function run() {
	if (!loadApiToken()) return loginErrorAsListResults();

	var data = getUrl('https://api.pinboard.in/v1/posts/recent', {
		count: 25
	});
	if (!data) return;

	return postsAsListResults(data.posts);
}