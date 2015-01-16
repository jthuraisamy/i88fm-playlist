var config = {
    server: {
        PORT: process.env.PORT || 8000
    },

    db: {
        HOSTNAME: 'localhost',
        NAME: 'i88fm',
        PORT: 27964
    },

    api: {
        STREAMON_URL: 'http://indie.streamon.fm/eventrange/%d-%d.json',
        TINYSONG_URL: 'http://tinysong.com/s/%s?format=json&limit=10&key=%s',
        TINYSONG_KEY: '5a7df1069789b4584c47a3d0b900eb48'
    }
};

module.exports = config;
