import { cpus } from "node:os";
import type { NextConfig } from "next";

const parsePositiveInt = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const configuredBuildCpus = parsePositiveInt(process.env.NEXT_BUILD_CPUS);
const configuredTurbopackMemoryMb = parsePositiveInt(
  process.env.NEXT_TURBOPACK_MEMORY_MB,
);
const buildCpus = configuredBuildCpus ?? Math.max(1, Math.min(cpus().length, 4));

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: buildCpus,
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      bodySizeLimit: "100mb",
    },
    proxyClientMaxBodySize: "100mb",
    turbopackFileSystemCacheForBuild: true,
    ...(configuredTurbopackMemoryMb
      ? {
          turbopackMemoryLimit: configuredTurbopackMemoryMb * 1024 * 1024,
        }
      : {}),
  },
};

export default nextConfig;
