/** @type {import('next').NextConfig} */
const actionCors = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,OPTIONS" },
  {
    key: "Access-Control-Allow-Headers",
    value:
      "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Action-Version, X-Blockchain-Ids",
  },
  { key: "Access-Control-Expose-Headers", value: "X-Action-Version, X-Blockchain-Ids" },
];

const nextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  async headers() {
    return [
      { source: "/api/actions/:path*", headers: actionCors },
      { source: "/actions.json", headers: actionCors },
      { source: "/.well-known/actions.json", headers: actionCors },
    ];
  },
};

export default nextConfig;
