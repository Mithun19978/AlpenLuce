import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',      // Static HTML export — served by Spring Boot JAR
  trailingSlash: true,   // /login → /login/index.html

  // Dev only: rewrites API calls and OAuth2 endpoints to Spring Boot backend
  // In production (static export), ApiForwardingFilter in Spring Boot handles /api/** → /server/**
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/server/:path*',
        },
        // Proxy OAuth2 initiation to Spring Boot so "Continue with Google" works in dev mode
        {
          source: '/oauth2/:path*',
          destination: 'http://localhost:8080/oauth2/:path*',
        },
        {
          source: '/login/oauth2/:path*',
          destination: 'http://localhost:8080/login/oauth2/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;
