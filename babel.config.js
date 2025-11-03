module.exports = function (api) {
  api.cache(true);
  
  const plugins = [
    // React Native Reanimated plugin (must be last)
    'react-native-reanimated/plugin',
  ];

  // Production optimizations
  if (process.env.NODE_ENV === 'production') {
    plugins.unshift(
      // Remove console logs in production
      ['transform-remove-console', { exclude: ['error', 'warn'] }],
      // Optimize imports
      ['babel-plugin-import', {
        libraryName: '@expo/vector-icons',
        libraryDirectory: '',
        camel2DashComponentName: false,
      }],
      // Tree shaking
      ['babel-plugin-transform-imports', {
        'react-native-vector-icons': {
          transform: 'react-native-vector-icons/${member}',
          preventFullImport: true,
        },
        'lodash': {
          transform: 'lodash/${member}',
          preventFullImport: false, // Allow full imports for chart-kit compatibility
        },
      }],
    );
  }

  // Development optimizations
  if (process.env.NODE_ENV === 'development') {
    plugins.unshift(
      // Hot reloading
      'react-refresh/babel',
    );
  }

  return {
    presets: [
      ['babel-preset-expo', {
        jsxImportSource: 'react',
        lazyImports: true,
      }],
    ],
    plugins,
    env: {
      production: {
        plugins: [
          // Additional production plugins
          ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
          // Optimize bundle size
          ['babel-plugin-transform-imports', {
            'lodash': {
              transform: 'lodash/${member}',
              preventFullImport: false, // Allow full imports for chart-kit compatibility
            },
          }],
        ],
      },
      development: {
        plugins: [
          // Development-specific plugins
          'react-refresh/babel',
        ],
      },
    },
  };
};
