// As `fs` module causes test fail, add the following config
// Reference: https://github.com/vercel/next.js/issues/7755
module.exports = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: 'empty',
      }
    }

    return config
  },
}
