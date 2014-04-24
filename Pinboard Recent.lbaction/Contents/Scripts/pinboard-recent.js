function run() {
	if (!loadApiToken()) return;

	var data = getUrl('https://api.pinboard.in/v1/posts/recent');
	if (!data) return;

	return postsAsListResults(data.posts);
}