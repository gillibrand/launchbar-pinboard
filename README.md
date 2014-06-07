# Pinboard for LaunchBar

A suite of custom actions for [LaunchBar 6 (beta)](http://blog.obdev.at/post/announcing-launchbar-6-beta/) that provide access to [Pinboard](https://pinboard.in) bookmarks. 

![Pinboard actions in LaunchBar](Pinboard-Actions.png)

# Installation

[Download the ZIP](https://github.com/gillibrand/launchbar-pinboard/archive/master.zip) and unzip. Double-click `Pinboard.lbext` to install all the actions.

# Actions

All actions require that you log in to Pinboard using your API token first. Actions will automatically prompt you for this if needed, but the prompting has broken several times through the LaunchBar betas, so you may want run `Pinboad: Log In` yourself. 

## Pinboard: Recent Bookmarks

Lists your 25 most recent bookmarks.

## Pinboard: Tags

Lists your Pinboard tags sorted from most-used to least. Selecting a tag lists all the bookmarks for that tag.

## Pinboard: Search

Searches the titles, descriptions, and tags of all your bookmarks.

Search results can be up to five minutes out-of-date. This is done to improve performance if you have a large number of bookmarks. If you notice your results are out-of-date, you can try searching for `refresh` with this action and choosing the `Refresh your out-of-date bookmarks` action.

## Pinboard: Log In

This action is used by all the other actions in order to access your Pinboard account. Prompts for and saves your Pinboard API token. Also provides a quick link to your API token if you are already logged in to the Pinboard web site.

Your API token (not password) is saved as plain-text in the Application Support directory for this action. You can delete it with the `Log Out` sub-action.

# Building

If you want edit or customize these actions for yourself, be aware that `Grunt` is used to append a shared script to each of the individual action scripts. See `shared.js` for more detail.

Newer betas LaunchBar provide a way to `include` JavaScript files at runtime. These actions may be updated later to do that instead.

# Version History

### 6/4/2014

- Auto-defers to Log In action if not logged in (updated for LaunchBar 6.0 beta 7). 

### 5/24/2014

- Added `Log Out` sub-action.

#### 5/2/2014

- Packaged all actions into a a single `.lbext` file for easy installation.

#### 4/26/2014

- Added `Pinboard Search` action.

#### 4/24/2014

- Initial release.