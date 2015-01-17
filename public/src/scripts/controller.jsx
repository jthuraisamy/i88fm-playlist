/**
 * i88fm-playlist by Jackson Thuraisamy
 *
 * @jsx m
 */

var i88fm = i88fm || {};
i88fm.Index = i88fm.Index || {};
i88fm.NavBarFull = i88fm.NavBarFull || {};
i88fm.NavBarMini = i88fm.NavBarMini || {};
i88fm.RecentTracks = i88fm.RecentTracks || {};
i88fm.LikedTracks = i88fm.LikedTracks || {};
i88fm.TrackListItem = i88fm.TrackListItem || {};
i88fm.About = i88fm.About || {};

i88fm.Index.controller = function() {
    return m.route('/recent');
};

i88fm.NavBarFull.controller = function() {};
i88fm.NavBarMini.controller = function() {};

i88fm.RecentTracks.controller = function() {
    // Set navbar.
    $('.top-bar-section ul li').removeClass('active');
    $('.top-bar-section ul li.recent').addClass('active');

    // Set from/to properties.
    var from = m.route.param('from');
    var to = m.route.param('to');

    if (from && to) {
        i88fm.vm.from(from);
        i88fm.vm.to(to);
    }

    // Retrieve recent tracks.
    i88fm.Tracks.retrieve({
        online: {
            from: i88fm.vm.from(),
            to: i88fm.vm.to()
        },
        callback: function (results) {
            if (results.length > 0) {
                i88fm.vm.tracks(results);
                m.redraw();
            }
        }
    });

    // Define lazy-loading/scrolling behaviours.
    // TODO: Show loading indicator.
    window.onscroll = function() {
        if (m.route() === '/recent') {
            // Load latest tracks upon scrolling to the top./
            if (window.pageYOffset === 0) {
                // Adjust from/to values.
                i88fm.vm.to(Math.round(new Date().getTime() / 1000));
                var fromLatestTrack, tracks = i88fm.vm.tracks();
                if (tracks.length > 0) {
                    fromLatestTrack = Math.round(tracks[0].eventID());
                }

                i88fm.Tracks.retrieve({
                    online: {
                        from: fromLatestTrack,
                        to: i88fm.vm.to()
                    },
                    callback: function (results) {
                        if (results.length > 0) {
                            i88fm.vm.tracks(results);
                            m.redraw();
                        }
                    }
                });
            }
        }
    };

    this.loadOlder = function() {
        // Adjust from/to values.
        i88fm.vm.from(i88fm.vm.from() - 3600);
        var toOldestTrack, tracks = i88fm.vm.tracks();
        if (tracks.length > 0) {
            toOldestTrack = Math.round(tracks[tracks.length - 1].eventID());
        }

        // Retrieve tracks.
        i88fm.Tracks.retrieve({
            online: {
                from: i88fm.vm.from(),
                to: toOldestTrack
            },
            callback: function (results) {
                if (results.length > 0) {
                    i88fm.vm.tracks(results);
                    m.redraw();
                }
            }
        });
    };
};

i88fm.LikedTracks.controller = function() {
    var self = this;
    this.hasTracks = false;

    // Set navbar.
    $('.top-bar-section ul li').removeClass('active');
    $('.top-bar-section ul li.liked').addClass('active');

    i88fm.db.likedTracks(function (results) {
        if (results.length > 0)
            self.hasTracks = true;

        i88fm.vm.tracks(results);
        m.redraw();
    });
};

i88fm.TrackListItem.controller = function(track) {
    this.track = track;
};

i88fm.About.controller = function() {
    // Set navbar.
    $('.top-bar-section ul li').removeClass('active');
    $('.top-bar-section ul li.about').addClass('active');
};