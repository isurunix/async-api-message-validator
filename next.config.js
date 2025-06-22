/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for better Cloudflare Pages compatibility
  output: 'standalone',
  
  // Configure for Edge Runtime compatibility
  experimental: {
    serverComponentsExternalPackages: ['@asyncapi/parser', 'asyncapi-validator']
  },
  
  // Webpack configuration for client-side compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        'node:fs': false,
        'node:path': false,
      };
    }
    
    // Handle YAML files
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'raw-loader',
    });
    
    return config;
  },
};

module.exports = nextConfig;
