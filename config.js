/**
 * @file   : config.js
 * @author : zhangjun36
 * @created: 2018-3-23 12:53:7
 */

const path = require('path');

const alias = require('rollup-plugin-alias');
const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const node = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const postcss = require('rollup-plugin-postcss');
const serve = require('rollup-plugin-serve');
const livereload = require('rollup-plugin-livereload');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const {name: moduleName, version, author} = require('./package.json');
const aliases = require('./alias');

function resolve(dir) {
    return path.resolve(__dirname, './', dir);
}

const banner = `/*!
  * ${moduleName} v${version}
  * (c) 2014-${new Date().getFullYear()} ${author}
  * Released under the MIT License.
  */
`;

const options = {
    // CommonJS
    'web-cjs': {
        dest: resolve(`dist/${moduleName}.common.js`),
        format: 'cjs'
    },
    // ES Modules
    'web-esm': {
        dest: resolve(`dist/${moduleName}.esm.js`),
        format: 'es'
    },
    // UMD
    'web-dev': {
        dest: resolve(`dist/${moduleName}.js`),
        format: 'umd',
        env: 'development'
    },
    'web': {
        dest: resolve(`dist/${moduleName}.min.js`),
        format: 'umd'
    }
};

function genConfig(name) {
    const opts = options[name];
    const config = {
        input: resolve('src/index.js'),
        output: {
            file: opts.dest,
            format: opts.format,
            name: moduleName,
            banner
        },
        // external: opts.external || [],
        plugins: [
            node(),
            alias(Object.assign({}, opts.alias, aliases)),
            commonjs(),
            postcss({
                // not work in build
                extract: true,
                plugins: [
                    autoprefixer(),
                    cssnano({
                        preset: 'advanced'
                    })
                ]
            }),
            buble()
        ]
    };

    if (opts.env) {
        config.output.env = opts.env;
        config.plugins.push(replace({
            'process.env.NODE_ENV': JSON.stringify(opts.env)
        }));
    }

    if (process.env.NODE_ENV === 'development') {
        config.plugins = config.plugins.concat([
            serve({
                open: true,
                contentBase: '',
                historyApiFallback: false
            }),
            livereload({
                watch: 'dist',
                verbose: true
            })
        ]);
    }

    return config;
}

if (process.env.TARGET) {
    module.exports = genConfig(process.env.TARGET);
}
else {
    exports.getBuild = genConfig;
    exports.getBuilds = () => Object.keys(options).map(genConfig);
}
