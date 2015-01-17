# Indie88 Playlist

This app can help you make a personalized list of favourite tracks from Indie88 FM with their corresponding Grooveshark links. I made it primarily for the Grooveshark integration, but also as an excuse to learn a bunch of stuff:

* Node.js/Express
* MongoDB
* Mithril.js
* IndexedDB
* Heroku

## Preview ([Online Demo](http://i88.thuraisamy.me))

<p align="center">
  <a href="http://i88.thuraisamy.me"><img src="http://i.imgur.com/dzrl6TR.png" /></a>
</p>

## Installation

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
$ git push heroku master
```
