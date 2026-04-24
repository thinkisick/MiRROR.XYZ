import { createRequire } from 'module'
const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    config.resolve.alias['@react-native-async-storage/async-storage'] =
      require.resolve('./lib/empty-module.js')
    return config
  },
}

export default nextConfig
