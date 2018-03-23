/**
 * @file   : alias.js
 * @author : zhangjun36
 * @created: 2018-3-23 12:55:29
 */

const path = require('path');

function resolve(dir) {
    return path.resolve(__dirname, '../', dir);
}

module.exports = {
    resolve: ['.js', '/index.js'],
    '@': resolve('src')
};
