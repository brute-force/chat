// const VueLoaderPlugin = require('');
// const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  lintOnSave: false,
  devServer: {
    proxy: {
      '/chatty/*': {
        target: 'ws://localhost:3000',
        ws: true
        // logLevel: 'debug'
      }
    }
  }
  // ,
  // configureWebpack: {
  //   plugins: [
  //     new VueLoaderPlugin()
  //   ]
  // },
  // chainWebpack: (config) => {
  //   config.module
  //     .rule('vue')
  //     .test(/\.vue$/)
  //     .use('vue-loader')
  //     .loader('vue-loader')
  //     .end();

  //   config.module
  //     .rule('css')
  //     .test(/\.s?css$/)
  //     .use('vue-loader')
  //     .loader('vue-loader')
  //     .end();
  // }
};
