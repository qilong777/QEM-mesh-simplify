module.exports = {
  chainWebpack: config => {
    // GraphQL Loader
    config.module
      .rule('worker-loader')
      .test(/\.worker\.ts$/)
      .use('worker-loader')
      .loader('worker-loader')
      .end();
  },
};
