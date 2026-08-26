import type { NextConfig } from "next";

// velite build
const isDev = process.argv.indexOf("dev") !== -1;
const isBuild = process.argv.indexOf("build") !== -1;
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = "1";
  import("velite").then((m) => m.build({ watch: isDev, clean: !isDev }));
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [new URL("https://photos.cri.epita.fr/**")],
  },
};

export default nextConfig;
