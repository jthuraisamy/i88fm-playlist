/**
 * i88fm-playlist by Jackson Thuraisamy
 *
 * @jsx m
 */

var i88fm = i88fm || {};

/******************************************************************************
 * View Model
 *****************************************************************************/
i88fm.vm = {
    tracks: m.prop([]),
    isLoading: m.prop(false),
    from: m.prop(Math.round(new Date().getTime() / 1000) - 1800),
    to: m.prop(Math.round(new Date().getTime() / 1000))
};

/******************************************************************************
 * Track Model Functions
 *****************************************************************************/

/**
 * Track Model
 *
 * @param track   object
 * @constructor
 */
i88fm.Track = function(track) {
    var self = this;

    /**
     * Default Track values.
     */
    this.defaults = {
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        title: 'Unknown Track',
        photo: 'images/default_album.jpg',
        time: '12:00 AM',
        duration: 0,
        isLiked: 0
    };

    // Assign corresponding Mithril props to this Track object.
    this.eventID = m.prop(track.event_id);
    this.songUUID = m.prop(track.song_uuid);
    this.artist = m.prop(track.artist);
    this.album = m.prop(track.album);
    this.title = m.prop(track.title);
    this.photo = m.prop(track.photo);
    this.time = m.prop(track.time);
    this.duration = m.prop(track.duration);
    this.tinysong = m.prop(track.links.stream);
    this.isLiked = m.prop(track.isLiked);

    /**
     * Getter method. Fail silently if prop is not found.
     *
     * @param prop string
     * @returns string
     */
    this.get = function(prop) {
        if (typeof self[prop] === 'function') {
            return self[prop]() ? self[prop]() : self.defaults[prop]
        }
    };

    this.toggleLike = function() {
        i88fm.db.toggleLike(this.eventID(), function(track) {
            self.isLiked(track.isLiked);
            m.redraw();
        });
    };
};

/******************************************************************************
 * IndexedDB Interface
 *****************************************************************************/

/**
 * Constructor for the IndexedDB interface.
 *
 * @constructor
 */
i88fm.Tracks = function() {
    console.log('Instantiating DB...');

    var self = this;
    this.dbName = 'i88fm';
    this.storeName = 'tracks';

    // Open or create the database.
    this.db = null;
    var request = window.indexedDB.open(this.dbName);

    request.onerror = function (event) {
        console.error('Cannot open i88fm DB.');
    };

    request.onsuccess = function (event) {
        self.db = request.result;
    };

    request.onupgradeneeded = function (event) {
        var db = event.target.result;

        try {
            var objectStore = db.createObjectStore(self.storeName, {keyPath: 'event_id'});
            var idIndex = objectStore.createIndex('id', 'event_id', {unique: true});
            var likedIndex = objectStore.createIndex('liked', 'isLiked', {unique: false});
        } catch (exception) {
            if (exception.name === 'ConstraintError') {
                console.warn('Tracks object store already exists.');
            }
        }
    };
};

/**
 * Add a track to the local DB.
 *
 * @param track object
 */
i88fm.Tracks.prototype.addTrack = function(track) {
    var self = this;
    var openRequest = window.indexedDB.open(this.dbName);

    openRequest.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction([self.storeName], 'readwrite');
        var objectStore = transaction.objectStore(self.storeName);

        track.isLiked = 0;
        var request = objectStore.add(track);
    };
};

i88fm.Tracks.prototype.search = function(from, to, callback) {
    var self = this;
    self.results = [];

    var openRequest = window.indexedDB.open(this.dbName);
    openRequest.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction([self.storeName], 'readwrite');
        var objectStore = transaction.objectStore(self.storeName);

        var index = objectStore.index('id');
        var boundKeyRange = IDBKeyRange.bound(from.toString(), to.toString());

        index.openCursor(boundKeyRange, 'prev').onsuccess = function(event) {
            var cursor = event.target.result;

            if (cursor) {
                self.results.push(new i88fm.Track(cursor.value));
                cursor.continue();
            } else {
                return callback(self.results);
            }
        }
    };
};

/**
 * Return an array of Track objects that are liked via provided callback.
 *
 * @param callback
 */
i88fm.Tracks.prototype.likedTracks = function(callback) {
    var self = this;
    self.results = [];

    var openRequest = window.indexedDB.open(this.dbName);
    openRequest.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction([self.storeName], 'readwrite');
        var objectStore = transaction.objectStore(self.storeName);

        var index = objectStore.index('liked');
        var singleKeyRange = IDBKeyRange.only(1);

        index.openCursor(singleKeyRange, 'prev').onsuccess = function(event) {
            var cursor = event.target.result;

            if (cursor) {
                self.results.push(new i88fm.Track(cursor.value));
                cursor.continue();
            } else {
                return callback(self.results);
            }
        }
    };
};

/**
 * Given a track's eventID, toggle and return the state of a track's isLike
 * field into the given callback function.
 *
 * @param eventID
 * @param callback
 */
i88fm.Tracks.prototype.toggleLike = function(eventID, callback) {
    var self = this;

    var openRequest = window.indexedDB.open(this.dbName);
    openRequest.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction([self.storeName], 'readwrite');
        var objectStore = transaction.objectStore(self.storeName);

        var getRequest = objectStore.get(eventID);
        getRequest.onsuccess = function(event) {
            var track = event.target.result;
            track.isLiked = 1 ^ track.isLiked; // Hack since boolean values cannot be valid keys.
            objectStore.put(track).onsuccess = function() {
                callback(track);
            };
        }
    };
};

/**
 * Retrieve playlist data from Indie88 with optional date range arguments.
 *
 * @param options object
 * @returns {*.}
 */
i88fm.Tracks.retrieve = function(options) {
    var online = options.online,
        callback = options.callback;

    console.info(
        'Searching local DB...',
        'from', new Date(i88fm.vm.from()*1000).toLocaleTimeString(),
        'to', new Date(i88fm.vm.to()*1000).toLocaleTimeString(),
        '- Duration:', ((i88fm.vm.to()-i88fm.vm.from())/3600).toFixed(2), 'hr'
    );

    i88fm.db.search(i88fm.vm.from(), i88fm.vm.to(), function(localResults) {
        if (online) {
            if (localResults.length > 0) {
                console.log('Found local results:', localResults.length);
                var nextFrom = Math.ceil(localResults[0].eventID());
                var nextTo = Math.floor(localResults[localResults.length - 1].eventID());

                // Request tracks that are after "from" and before first match.
                if ((nextTo - online.from) > 120) {
                    console.log(
                        'Requesting before local results...',
                        'from', new Date(online.from*1000).toLocaleTimeString(),
                        'to', new Date(nextTo*1000).toLocaleTimeString(),
                        '- Duration:', ((nextTo-online.from)/60).toFixed(2), 'min'
                    );
                    i88fm.Tracks.request(online.from, nextTo, function (onlineResults) {

                        // Add tracks to local DB.
                        for (var i = 0; i < onlineResults.length; i++)
                            i88fm.db.addTrack(onlineResults[i]);

                        // Retrieve again with newly added tracks.
                        i88fm.Tracks.retrieve({
                            callback: callback
                        });
                    });
                }

                // Request tracks that are after last match and before "to".
                if ((online.to - nextFrom) > 120) {
                    console.log(
                        'Requesting after local results...',
                        'from', new Date(nextFrom*1000).toLocaleTimeString(),
                        'to', new Date(online.to*1000).toLocaleTimeString(),
                        '- Duration:', ((online.to-nextFrom)/60).toFixed(2), 'min'
                    );
                    i88fm.Tracks.request(nextFrom, online.to, function (onlineResults) {

                        // Add tracks to local DB.
                        for (var i = 0; i < onlineResults.length; i++)
                            i88fm.db.addTrack(onlineResults[i]);

                        // Retrieve again with newly added tracks.
                        i88fm.Tracks.retrieve({
                            callback: callback
                        });
                    });
                }
            } else {
                console.log(
                    'No local results. Requesting all online...',
                    'from', new Date(online.from*1000).toLocaleTimeString(),
                    'to', new Date(online.to*1000).toLocaleTimeString(),
                    '- Duration:', ((online.to-online.from)/3600).toFixed(2), 'hr'
                );
                i88fm.Tracks.request(online.from, online.to, function (results) {
                    for (var i = 0; i < results.length; i++)
                        i88fm.db.addTrack(results[i]);

                    i88fm.Tracks.retrieve({
                        callback: callback
                    });
                })
            }
        }

        return callback(localResults);
    });
};

i88fm.Tracks.request = function(from, to, callback) {
    i88fm.vm.isLoading(true);
    m.redraw();

    return m.request({
        method: 'GET',
        url: '/api/recent-tracks',
        data: {
            from: from,
            to: to
        },
        unwrapSuccess: function(response) {
            i88fm.vm.isLoading(false);
            callback(response);
        }
    });
};