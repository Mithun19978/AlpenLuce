import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',      // Static HTML export — served by Spring Boot JAR
  trailingSlash: true,   // /login → /login/index.html

  // Dev only: rewrites API calls to Spring Boot backend
  // In production (static export), ApiForwardingFilter in Spring Boot handles /api/** → /server/**
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/server/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;
