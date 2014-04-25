# Pinboard for LaunchBar

A suite of custom actions for [LaunchBar 6 (beta)](http://blog.obdev.at/post/announcing-launchbar-6-beta/) that provide access to [Pinboard](https://pinboard.in/u:gillibrand) bookmarks. 

![Pinboard actions in LaunchBar](Pinboard-Actions.png)

# Installation

[Download the ZIP](https://github.com/gillibrand/launchbar-pinboard/archive/master.zip) and unzip. Each action is a `.lbaction` file that you can double-click to install. Only `Pinboard Log In.lbaction` is required.

# Actions

## Pinboard Log In

This action is *required* by all the other actions in order to access your Pinboard account. Prompts for and saves your Pinboard API token. 

Your API token (not password) is saved as plain-text in the Application Support directory for this action.

## Pinboard Recent

Lists your 25 most recent bookmarks. 

## Pinboard Tags

Lists your Pinboard tags sorted from most-used to least. Selecting a tag lists all the bookmarks for that tag.

# Building

If you want edit or customize these actions for yourself, be aware that `Grunt` is used to append a shared script to each of the individual actions scripts. See `shared.js` for more detail.

# Version History

#### 4/24/2014

- Initial release.