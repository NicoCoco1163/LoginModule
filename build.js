/**
 * @file   : build.js
 * @author : zhangjun36
 * @created: 2018-3-23 12:57:27
 */

const path = require('path');
const fs = require('fs');
const rollup = require('rollup');
const uglify = require('uglify-js');

const builds = require('./config').getBuilds();

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

function build(builds) {
    const next = () => {
        walk(build.task = builds.shift())
            .then(next)
            .catch(err => err && console.error(err));
    };

    next();
}

function walk(config) {

    if (!config) {
        return Promise.reject();
    }

    const output = config.output;
    const {file, env} = output;
    return rollup.rollup(config)
        .then(bundle => bundle.generate(output))
        .then(({code}) => {
            return write(file, env === 'development' ? code : uglify.minify(code, {
                output: {
                    ascii_only: true // eslint-disable-line
                },
                compress: {
                    pure_funcs: ['makeMap'] // eslint-disable-line
                }
            }).code);
        });
}

function write(dest, code) {
    return new Promise((resolve, reject) => {
        fs.writeFile(dest, code, err => {
            if (err) {
                return reject(err);
            }
            console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code));
            resolve();
        });
    });
}

function getSize(code) {
    return (code.length / 1024).toFixed(2) + 'kb';
}

function blue(str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
}

build(builds);
