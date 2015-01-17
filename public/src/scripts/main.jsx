/**
 * i88fm-playlist by Jackson Thuraisamy
 *
 * @jsx m
 */


var i88fm = i88fm || {};

/******************************************************************************
 * Router / Initialization
 *****************************************************************************/

// Instantiate IndexedDB interface.
i88fm.db = new i88fm.Tracks();

// Setup routes to start with the hash symbol.
m.route.mode = "hash";

// Define route and initialize the TrackList module.
m.route(document.getElementById('container'), '/', {
    '/':       i88fm.Index,
    '/recent': i88fm.RecentTracks,
    '/liked':  i88fm.LikedTracks,
    '/about':  i88fm.About
});

$(function() {
    $(document).foundation();

    //$('div.inner-wrap').slimScroll();
});
