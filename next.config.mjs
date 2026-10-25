/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Garante que todas as páginas sejam SSR e não SSG
  // (evita erro de build quando env vars do Supabase não estão configuradas)
  output: undefined,
};

export default nextConfig;
