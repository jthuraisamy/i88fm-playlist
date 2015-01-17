# Indie88 Playlist

This app can help you make a personalized list of favourite tracks from Indie88 FM with their corresponding Grooveshark links. I made it primarily for the Grooveshark integration, but also as an excuse to learn a bunch of stuff:

* **Node.js** & **Express**
* **MongoDB** & **Mongoose**
* **Zurb Foundation**: knowing Bootstrap fairly well already, I wanted to try a different front-end framework
* **Mithril.js**: a simple but powerful client-side MVC framework
* **IndexedDB**: used to locally cache recent and liked tracks so that content loads faster on the browser without making redundant requests to the server
* **Bower**
* **Gulp**
* **Heroku**

## Preview ([Online Demo](http://i88.thuraisamy.me))

<p align="center">
  <a href="http://i88.thuraisamy.me"><img src="http://i.imgur.com/dzrl6TR.png" /></a>
</p>

## Installation

Several options can be set in `config.js` after cloning the repository. Make sure to replace `TINYSONG_KEY` [with your own](http://tinysong.com/api) to automate the retrieval of Grooveshark links for tracks.

### Default

```
$ git clone https://github.com/jthuraisamy/i88fm-playlist.git
$ cd i88fm-playlist/
$ npm install
$ bower install
$ gulp default
$ node app.js
```

### Heroku

```
$ git clone https://github.com/jthuraisamy/i88fm-playlist.git
$ cd i88fm-playlist/
$ heroku create
$ heroku addons:add mongolab
$ git push heroku master
```
