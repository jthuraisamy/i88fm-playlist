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

    return <nav class="top-bar show-for-medium-up" data-topbar role="navigation">
        <ul class="title-area">
            <li class="name">
                <h1><a href="#">Indie88 Playlist</a></h1>
            </li>
            <li class="toggle-topbar menu-icon"><a href="#"><span>Menu</span></a></li>
        </ul>
        <section class="top-bar-section">
            <ul class="right">
                <li class="recent"><a href="#/recent">Recent</a></li>
                <li class="liked"><a href="#/liked">Liked</a></li>
                <li class="about"><a href="#/about">About</a></li>
            </ul>
        </section>
    </nav>
};

i88fm.NavBarMini.view = function(ctrl) {
    $('#nav-bar-mini').addClass('sticky');
    $('#nav-bar-mini').foundation('topbar', 'reflow');

    return <nav class="tab-bar show-for-small" data-topbar role="navigation">
        <section class="middle tab-bar-section">
            <h1 class="title">Indie88 Playlist {i88fm.vm.isLoading() ? '- Loading...' : ''}</h1>
        </section>
        <section class="right-small">
            <a class="right-off-canvas-toggle menu-icon" href="#"><span></span></a>
        </section>
    </nav>
};

i88fm.RecentTracks.view = function(ctrl) {
    var scrollTop = function() {
        document.body.scrollTop = 0;
    };

    return <ul class="small-block-grid-1 large-block-grid-2">
        {i88fm.vm.tracks().map(function (track) {
            var trackCtrl = new i88fm.TrackListItem.controller(track);
            return i88fm.TrackListItem.view(trackCtrl);
        })}
        <li class="load-more-tracks">
            <div class="panel">
                <div class="row">
                    <div class="album-art-column columns small-3 large-2">
                        <img class="album-art th" src="images/default_album.jpg" />
                    </div>
                    <div class="columns small-9 large-10">
                        <div class="row">
                            <button onclick={function() {ctrl.loadOlder()}}
                                    class={i88fm.vm.isLoading() ? 'button primary expand disabled' : 'button primary expand'}>
                                    &#8678; {i88fm.vm.isLoading() ? 'Loading...' : new Date(i88fm.vm.from()*1000).toLocaleString()}
                            </button>
                        </div>
                        <div class="row">
                            <button onclick={scrollTop} class="button secondary expand">Back to Top</button>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    </ul>
};

i88fm.LikedTracks.view = function(ctrl) {
    if (ctrl.hasTracks) {
            return <ul class="small-block-grid-1 large-block-grid-2">
            {i88fm.vm.tracks().map(function (track) {
                var trackCtrl = new i88fm.TrackListItem.controller(track);
                return i88fm.TrackListItem.view(trackCtrl);
            })}
        </ul>
    } else {
        return <div class="panel">
            <h2>Nothing here!</h2>
            <h2><small>Click <u>Like</u> on a track to add it.</small></h2>
        </div>
    }
};

i88fm.TrackList.view = function(ctrl) {
    return <ul class="small-block-grid-1 large-block-grid-2">
            {i88fm.vm.tracks().map(function (track) {
                var trackCtrl = new i88fm.TrackListItem.controller(track);
                return i88fm.TrackListItem.view(trackCtrl);
            })}
            <li>
                <button onclick={function() {ctrl.loadOlder()}} class="button primary large">{new Date(i88fm.vm.from()*1000).toLocaleTimeString()}</button>
            </li>
        </ul>
};

i88fm.TrackListItem.view = function(ctrl) {
    return <li class="track-item">
        <div class="panel">
            <div class="row">
                <div class="album-art-column columns small-3 large-2">
                    <img class="album-art th" src={ctrl.track.defaults.photo} data-src={ctrl.track.get('photo')} alt={ctrl.track.get('album')} config={function(e) {$(e).unveil()}} />
                </div>
                <div class="columns small-9 large-10">
                    <span class="play-time label info" title={new Date(ctrl.track.eventID() * 1000).toLocaleString()}>{ctrl.track.get('time')}</span>
                    <div class="row"><h3 class="title small-8 large-10" title={ctrl.track.get('title')}>{ctrl.track.get('title')}</h3></div>
                    <div class="row">
                        <div class="columns small-8 large-10">
                            <div class="row"><span class="artist">{ctrl.track.get('artist')}</span></div>
                            <div class="row"><span class="album subheader small-5">{ctrl.track.get('album')}</span></div>
                        </div>
                        <div class="columns small-4 large-2">
                            <div class="row">
                                <ul class="stack button-group radius">
                                    <li><a href={ctrl.track.get('tinysong') ? ctrl.track.get('tinysong') : ''} class={ctrl.track.get('tinysong') ? 'button small' : 'button small disabled'} target="gs">Play</a></li>
                                    <li><a onclick={function() {ctrl.track.toggleLike()}} class={ctrl.track.isLiked() ? 'button small success' : 'button small secondary'}>Like</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </li>
};

i88fm.About.view = function(ctrl) {
    return <div class="panel">
        <p>Like <a href="http://indie88.com/">Indie88</a> and <a href="http://grooveshark.com/">Grooveshark</a>? Well, this is the app for you!</p>
    </div>
};