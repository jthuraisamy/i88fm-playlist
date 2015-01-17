'use strict';

// Import project modules.
var config = require('./config.js');

// Import node modules.
var request = require('request');
var async = require('async');
var util = require('util');
var mongoose = require('mongoose');

/**
 * Track schema.
 *
 * @type {Mongoose.Schema}
 */
var trackSchema = new mongoose.Schema({
    event_id:  {type: String, required: true, unique: true},
    song_uuid: {type: String, required: true},
    artist:    {type: String, required: true},
    album:     {type: String, required: false},
    title:     {type: String, required: true},
    photo:     {type: String, required: false},
    time:      {type: String, required: false},
    duration:  {type: Number, required: true},
    links:     {type: {buy: String, stream: String}, required: false}
});

/**
 * Retrieve tracks from the specified range.
 *
 * @param from
 * @param to
 * @param callback
 * @returns {*|Query}
 */
trackSchema.statics.findRange = function(from, to, callback) {
    return this.find(
        {'event_id': {$gte: from.toString(), $lte: to.toString()}},
        {_id: 0, __v: 0},
        callback
    );
};

/**
 * Retrieve the first track with a stream, given the track's song_uuid.
 *
 * @param song_uuid
 * @param callback
 * @returns {*|Query}
 */
trackSchema.statics.findStream = function(song_uuid, callback) {
    return this.findOne(
        {'song_uuid': song_uuid, 'links.stream': {$ne: null}},
        callback
    );
};

/**
 * Track model.
 *
 * @type {*|Model}
 */
var Track = mongoose.model('Track', trackSchema);

/**
 * Save the given Track into the database.
 *
 * @param track
 * @param callback
 */
var saveTrack = function(track, callback) {
    track.save(function(err) {
        if (err) {
            if (err.code === 11000) {
                console.warn('Duplicate key error for:', track.artist, '-', track.title);
            }
        }

        return callback(null, track);
    });
};

/**
 * Return tracks from the given time range into the given callback.
 *
 * @param from
 * @param to
 * @param success
 */
var getRemote = function(from, to, success) {
    if (!from || !to) {
        to = Math.round(new Date().getTime() / 1000);
        from = to - 3600;
    }

    request({
        url: util.format(config.api.STREAMON_URL, from, to),
        json: true
    }, function(err, res, body) {
        if (err || !res) {
            // Retrieve tracks locally via mongoose.
            return Track.findRange(from, to, function(err, tracks) {
                return success(tracks);
            });
        }

        var tracks = [];

        if (body.events) {
            for (var i = 0; i < body.events.length; i++) {
                var event = body.events[i];

                // If the event is a song, create a Track document,
                // then append it to the tracks array.
                if (event.song_uuid) {
                    var track = new Track({
                        event_id:  event.id,
                        song_uuid: event.song_uuid,
                        artist:    event.artist,
                        album:     event.album,
                        title:     event.title,
                        photo:     event.album_art_src,
                        time:      event.time,
                        duration:  Math.round(event.duration),
                        links: {
                            buy: event.buy_link,
                            stream: null
                        }
                    });

                    tracks.push(track);
                }
            }
        }

        // Save each track from the tracks array.
        async.map(tracks, saveTrack, function(err) {
            // Retrieve tracks locally via mongoose.
            Track.findRange(from, to, function(err, tracks) {
                // Add TinySong URLs to each track where available.
                async.map(tracks, getTinySong, function (err, updatedTracks) {
                    success(updatedTracks);
                });
            });
        });

    });
};

/**
 * Using the TinySong API, update the given track's streaming link and return
 * the track as the first argument for the success callback.
 *
 * @param track     object
 * @param success   function
 */
var getTinySong = function (track, success) {
    Track.findStream(track.song_uuid, function(err, foundTrack) {
        if (foundTrack) {
            track.links.stream = foundTrack.links.stream;
            Track.update(
                {song_uuid: track.song_uuid},
                {$set: {'links.stream': foundTrack.links.stream}},
                {multi: true}, function(err) {
                    if (err) console.log(err);
                    return success(null, track);
                }
            );
        } else {
            // Construct search query.
            var artist = track.artist.toLowerCase().replace(/\([^)]*\)/g, '');
            var title = track.title.toLowerCase().replace(/\([^)]*\)/g, '');
            var query = util.format('%s %s', artist, title);

            request({
                url: util.format(config.api.TINYSONG_URL, query, config.api.TINYSONG_KEY),
                json: true
            }, function(err, res, results) {
                if (!results) {
                    return success(null, track);
                }

                for (var i = 0; i < results.length; i++) {
                    var artistMatch = false;
                    var titleMatch = false;

                    if (results[i].ArtistName)
                        artistMatch = results[i].ArtistName.toLowerCase().indexOf(artist) !== -1;

                    if (results[i].SongName)
                        titleMatch = results[i].SongName.toLowerCase().indexOf(title) !== -1;

                    if (artistMatch && titleMatch) {
                        track.links.stream = results[i].Url;
                        break;
                    }
                }

                if (track.links.stream) {
                    console.log('Found TinySong URL for:', track.artist, '-', track.title);
                } else {
                    console.log('Missing TinySong URL for:', track.artist, '-', track.title);
                }

                Track.update(
                    {song_uuid: track.song_uuid},
                    {$set: {'links.stream': track.links.stream}},
                    {multi: true},
                    function(err) {
                        if (err) console.log(err);
                        return success(null, track);
                    }
                );
            });
        }
    });
};

module.exports = {
    getRemote: getRemote
};
