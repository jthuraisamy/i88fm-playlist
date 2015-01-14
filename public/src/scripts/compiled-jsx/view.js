/**
 * i88fm-playlist by Jackson Thuraisamy
 *
 * @jsx m
 */

// TODO: navbar view
// TODO: datepicker view
var i88fm = i88fm || {};
i88fm.NavBarFull = i88fm.NavBarFull || {};
i88fm.NavBarMini = i88fm.NavBarMini || {};
i88fm.RecentTracks = i88fm.RecentTracks || {};
i88fm.LikedTracks = i88fm.LikedTracks || {};
i88fm.TrackList = i88fm.TrackList || {};
i88fm.TrackListItem = i88fm.TrackListItem || {};
i88fm.About = i88fm.About || {};

i88fm.NavBarFull.view = function(ctrl) {
    $('#nav-bar-full').addClass('sticky');
    $('#nav-bar-full').foundation('topbar', 'reflow');

    return m("nav", {class:"top-bar show-for-medium-up", 'data-topbar':true, role:"navigation"}, [
        m("ul", {class:"title-area"}, [
            m("li", {class:"name"}, [
                m("h1", [m("a", {href:"#"}, ["Indie88 Playlist"])])
            ]),
            m("li", {class:"toggle-topbar menu-icon"}, [m("a", {href:"#"}, [m("span", ["Menu"])])])
        ]),
        m("section", {class:"top-bar-section"}, [
            m("ul", {class:"right"}, [
                m("li", {class:"recent"}, [m("a", {href:"#/recent"}, ["Recent"])]),
                m("li", {class:"liked"}, [m("a", {href:"#/liked"}, ["Liked"])]),
                m("li", {class:"about"}, [m("a", {href:"#/about"}, ["About"])])
            ])
        ])
    ])
};

i88fm.NavBarMini.view = function(ctrl) {
    $('#nav-bar-mini').addClass('sticky');
    $('#nav-bar-mini').foundation('topbar', 'reflow');

    return m("nav", {class:"tab-bar show-for-small", 'data-topbar':true, role:"navigation"}, [
        m("section", {class:"middle tab-bar-section"}, [
            m("h1", {class:"title"}, ["Indie88 Playlist ", i88fm.vm.isLoading() ? '- Loading...' : ''])
        ]),
        m("section", {class:"right-small"}, [
            m("a", {class:"right-off-canvas-toggle menu-icon", href:"#"}, [m("span")])
        ])
    ])
};

i88fm.RecentTracks.view = function(ctrl) {
    var scrollTop = function() {
        document.body.scrollTop = 0;
    };

    return m("ul", {class:"small-block-grid-1 large-block-grid-2"}, [
        i88fm.vm.tracks().map(function (track) {
            var trackCtrl = new i88fm.TrackListItem.controller(track);
            return i88fm.TrackListItem.view(trackCtrl);
        }),
        m("li", {class:"load-more-tracks"}, [
            m("div", {class:"panel"}, [
                m("div", {class:"row"}, [
                    m("div", {class:"album-art-column columns small-3 large-2"}, [
                        m("img", {class:"album-art th", src:"images/default_album.jpg"} )
                    ]),
                    m("div", {class:"columns small-9 large-10"}, [
                        m("div", {class:"row"}, [
                            m("button", {onclick:function() {ctrl.loadOlder()},
                                    class:i88fm.vm.isLoading() ? 'button primary expand disabled' : 'button primary expand'}, [
                                    "⇦ ", i88fm.vm.isLoading() ? 'Loading...' : new Date(i88fm.vm.from()*1000).toLocaleString()
                            ])
                        ]),
                        m("div", {class:"row"}, [
                            m("button", {onclick:scrollTop, class:"button secondary expand"}, ["Back to Top"])
                        ])
                    ])
                ])
            ])
        ])
    ])
};

i88fm.LikedTracks.view = function(ctrl) {
    if (ctrl.hasTracks) {
            return m("ul", {class:"small-block-grid-1 large-block-grid-2"}, [
            i88fm.vm.tracks().map(function (track) {
                var trackCtrl = new i88fm.TrackListItem.controller(track);
                return i88fm.TrackListItem.view(trackCtrl);
            })
        ])
    } else {
        return m("div", {class:"panel"}, [
            m("h2", ["Nothing here!"]),
            m("h2", [m("small", ["Click ", m("u", ["Like"]), " on a track to add it."])])
        ])
    }
};

i88fm.TrackList.view = function(ctrl) {
    return m("ul", {class:"small-block-grid-1 large-block-grid-2"}, [
            i88fm.vm.tracks().map(function (track) {
                var trackCtrl = new i88fm.TrackListItem.controller(track);
                return i88fm.TrackListItem.view(trackCtrl);
            }),
            m("li", [
                m("button", {onclick:function() {ctrl.loadOlder()}, class:"button primary large"}, [new Date(i88fm.vm.from()*1000).toLocaleTimeString()])
            ])
        ])
};

i88fm.TrackListItem.view = function(ctrl) {
    return m("li", {class:"track-item"}, [
        m("div", {class:"panel"}, [
            m("div", {class:"row"}, [
                m("div", {class:"album-art-column columns small-3 large-2"}, [
                    m("img", {class:"album-art th", src:ctrl.track.defaults.photo, 'data-src':ctrl.track.get('photo'), alt:ctrl.track.get('album'), config:function(e) {$(e).unveil()}} )
                ]),
                m("div", {class:"columns small-9 large-10"}, [
                    m("span", {class:"play-time label info", title:new Date(ctrl.track.eventID() * 1000).toLocaleString()}, [ctrl.track.get('time')]),
                    m("div", {class:"row"}, [m("h3", {class:"title small-8 large-10", title:ctrl.track.get('title')}, [ctrl.track.get('title')])]),
                    m("div", {class:"row"}, [
                        m("div", {class:"columns small-8 large-10"}, [
                            m("div", {class:"row"}, [m("span", {class:"artist"}, [ctrl.track.get('artist')])]),
                            m("div", {class:"row"}, [m("span", {class:"album subheader small-5"}, [ctrl.track.get('album')])])
                        ]),
                        m("div", {class:"columns small-4 large-2"}, [
                            m("div", {class:"row"}, [
                                m("ul", {class:"stack button-group radius"}, [
                                    m("li", [m("a", {href:ctrl.track.get('tinysong') ? ctrl.track.get('tinysong') : '', class:ctrl.track.get('tinysong') ? 'button small' : 'button small disabled', target:"gs"}, ["Play"])]),
                                    m("li", [m("a", {onclick:function() {ctrl.track.toggleLike()}, class:ctrl.track.isLiked() ? 'button small success' : 'button small secondary'}, ["Like"])])
                                ])
                            ])
                        ])
                    ])
                ])
            ])
        ])
    ])
};

i88fm.About.view = function(ctrl) {
    return m("div", {class:"panel"}, [
        m("p", ["Like ", m("a", {href:"http://indie88.com/"}, ["Indie88"]), " and ", m("a", {href:"http://grooveshark.com/"}, ["Grooveshark"]),"? Well, this is the app for you!"])
    ])
};