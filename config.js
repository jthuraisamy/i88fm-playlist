var config = {
    server: {
        PORT: 8000
    },

    db: {
        HOSTNAME: 'localhost',
        NAME: 'i88fm'
    },

    api: {
        STREAMON_URL: 'http://indie.streamon.fm/eventrange/%d-%d.json',
        TINYSONG_URL: 'http://tinysong.com/s/%s?format=json&limit=10&key=%s',
        TINYSONG_KEY: ''
    }
};

module.exports = config;
