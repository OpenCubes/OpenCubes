module.exports = {
    securitySalt: '&*5/5+hd-5qkjzn;?66@-{]=}',
    db_uri: "mongodb://troup.mongohq.com:10045/opencubes",
    db_opt: {
        'user': 'server',
        'pass': 'faae5288a8a0e9f986d9e496926beb55a7e9c041'
    },
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 5000,
    ip: process.env.OPENSHIFT_NODEJS_IP || process.env.IP || ''
};
