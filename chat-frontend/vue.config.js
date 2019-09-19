module.exports = {
  lintOnSave: false,
  devServer: {
    proxy: {
      '/chatty/*': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
};
