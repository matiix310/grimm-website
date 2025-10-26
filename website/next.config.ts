import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/complete/epita/:slug*",
        destination: "/api/auth/oauth2/callback/forge-id/:slug*",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [new URL("https://photos.cri.epita.fr/**")],
  },
};

export default nextConfig;
