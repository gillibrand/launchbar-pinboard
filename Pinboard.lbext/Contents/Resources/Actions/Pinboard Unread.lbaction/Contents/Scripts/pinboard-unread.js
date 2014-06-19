include('shared.js');

function run() {
	if (!loadApiToken()) return loginErrorAsListResults();

	var posts = getAllPosts({
		toread: 'yes'
	});

	var unreadPosts = posts.filter(function(post) {
		return post.toread == 'yes';
	});

	return postsAsListResults(unreadPosts);
}