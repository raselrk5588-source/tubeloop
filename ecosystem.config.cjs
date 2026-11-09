module.exports = {
  apps: [
    {
      name: "tubeloop",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3055",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3055,
      },
    },
  ],
};
