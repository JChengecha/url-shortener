/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore problematic HTML files
    config.plugins.push(
      new (require('webpack')).IgnorePlugin({
        resourceRegExp: /^\.\/.*\.html$/,
        contextRegExp: /node_modules\/@mapbox\/node-pre-gyp/
      })
    )

    // Add fallback for node modules
    config.resolve.fallback = { 
      ...config.resolve.fallback, 
      fs: false,
      net: false,
      tls: false 
    }

    // Transpile specific packages
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    }

    return config
  },
  
  // Disable strict mode if causing issues
  reactStrictMode: false,

  // Configure transpilation for specific packages
  transpilePackages: [
    '@mapbox/node-pre-gyp',
    'bcrypt'
  ],

  // Ignore certain warnings
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig
