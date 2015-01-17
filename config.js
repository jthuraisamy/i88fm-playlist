var config = {
    server: {
        PORT: process.env.PORT || 8000
    },

    db: {
        URI: process.env.MONGOLAB_URI || 'mongodb://localhost/i88fm'
    },

    api: {
        STREAMON_URL: 'http://indie.streamon.fm/eventrange/%d-%d.json',
        TINYSONG_URL: 'http://tinysong.com/s/%s?format=json&limit=10&key=%s',
        TINYSONG_KEY: process.env.TINYSONG_KEY || 'INSERT_TINYSONG_KEY_HERE'
    }
};

module.exports = config;
