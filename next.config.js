const nextConfig = {
  // output: 'export', // Comentado temporalmente para desarrollo
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  poweredByHeader: false,
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  // Configuración para suprimir warnings de hidratación de extensiones del navegador
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configuración adicional para el cliente si es necesario
    }
    return config;
  },
};

module.exports = nextConfig;
