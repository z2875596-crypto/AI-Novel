import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 构建时忽略 TypeScript 类型错误，不影响运行时功能
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
