function run(apiToken) {
	var results = [];

	results.push({
		title: 'Enter your Pinboard API Token',
		subtitle: 'Enter you API token here to access your Pinboard account from LaunchBar',
		icon: 'PinboardTemplate.png',
		action: 'saveApiToken',
		actionArgument: apiToken,
	});

	results.push({
		title: 'Look up your API token',
		subtitle: 'View your API token on Pinboard',
		url: 'https://pinboard.in/settings/password'
	});

	return results;
}

function saveApiToken(apiToken) {
	// Test with a known Pinboard URL. Any non-error means it's good.
	var result = HTTP.getJSON('https://api.pinboard.in/v1/user/secret?format=json&auth_token=' + apiToken);

	if (result.response.status !== 200) {
		LaunchBar.alert(
			'Unable to log in to Pinboard.',
			'The API token you entered was not accepted. Try copying and pasting the API token from your Pinboard settings and try again. \n\nPinboard said: ' + result.response.status  + ' ' + result.response.localizedStatus);
		LaunchBar.performAction('Pinboard: Log In');
		return;
	}

	// Multiple actions want to access this, so save in a common location instead of the support path just for this action.
	File.writeText(apiToken, Action.supportPath + '/api-token.txt');

	LaunchBar.displayNotification({
		string: 'Successfully logged in to Pinboard'
	});
}
