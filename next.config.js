const nextConfig = {
   /* config options here */
   webpack: (config) => {
      config.resolve.alias.canvas = false
      config.resolve.alias.encoding = false
      return config
   },
   typescript: {
      ignoreBuildErrors: true,
   },
   eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
   },
   images: {
      domains: ["img.clerk.com"], // Allow Clerk-hosted images
    },
};

module.exports = nextConfig;
