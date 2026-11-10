/** @type {import('next').NextConfig} */

// For a PROJECT site (https://<username>.github.io/<repo>), set
// NEXT_PUBLIC_BASE_PATH=/<repo> in the build environment.
// Leave it empty for a USER/ORG site (https://<username>.github.io) or a
// custom domain — see the basePath note in the deploy docs.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export", // static HTML export → ./out
  images: { unoptimized: true }, // GitHub Pages can't run Next image optimization
  trailingSlash: true, // emit /route/index.html for reliable GitHub Pages routing
  ...(basePath && { basePath }),
};

export default nextConfig;
