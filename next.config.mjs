/** @type {import('next').NextConfig} */
import path from "path"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // ensure react-native imports resolve to react-native-web
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
      "react-native": "react-native-web",
    }

    // prefer .web.* extensions
    config.resolve.extensions = [
      ...(config.resolve.extensions || []),
      ".web.ts",
      ".web.tsx",
      ".web.js",
      ".web.jsx",
    ]

    return config
  },
}

export default nextConfig
