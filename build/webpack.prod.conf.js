var glob = require('glob')
var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var env = config.build.env


var plugins = [
  new webpack.DefinePlugin({
    'process.env': env
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new ExtractTextPlugin(utils.assetsPath('css/[name].[contenthash].css')),
]


function getEntry(globPath) {
  var entries = {},
      basename;

  glob.sync(globPath).forEach(function(entry) {

    basename = path.basename(entry, path.extname(entry));
    entries[basename] = entry;
  });
  return entries;
}

var pages = getEntry('src/pages/**/*.html');

for (var pathname in pages) {
  var conf = {
    filename: process.env.NODE_ENV === 'testing' ? pathname + '.html' : config.build[pathname],
    template: pages[pathname],
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
    },
    chunks: [pathname]
  }
  plugins.push(new HtmlWebpackPlugin(conf));
}

var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: plugins
})

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
      new CompressionWebpackPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: new RegExp(
            '\\.(' +
            config.build.productionGzipExtensions.join('|') +
            ')$'
        ),
        threshold: 10240,
        minRatio: 0.8
      })
  )
}

if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig