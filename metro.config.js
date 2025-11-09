// // metro.config.js
// const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// const path = require('path');
// const fs = require('fs');

// const sdkPath = path.resolve(__dirname, '../digia_rn_sdk');

// // Check if dist directory exists after build
// const distExists = fs.existsSync(path.join(sdkPath, 'dist'));
// console.log('📦 SDK dist directory exists:', distExists);

// if (!distExists) {
//   console.warn('⚠️  SDK dist directory not found. Run "npm run build" in the SDK directory.');
// }

// const config = {
//   watchFolders: [sdkPath],
//   resolver: {
//     extraNodeModules: {
//       '@digia/rn-sdk': sdkPath,
//     },
//     resolverMainFields: ['react-native', 'browser', 'main'],
//   },
// };

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);

// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

// Get absolute paths to the local packages
const projectRoot = __dirname;
const sdkPath = path.resolve(__dirname, '../digia_rn_sdk');
const exprRnPath = path.resolve(__dirname, '../digia_expr_rn');

console.log('🔧 Project Root:', projectRoot);
console.log('🔧 SDK Path:', sdkPath);
console.log('🔧 Expr-RN Path:', exprRnPath);

const config = {
  projectRoot,
  // Watch all local package folders for changes
  watchFolders: [projectRoot, sdkPath, exprRnPath],

  resolver: {
    // Explicitly block SDK's node_modules to prevent duplicate dependencies
    blockList: [
      new RegExp(`${sdkPath}/node_modules/react/.*`),
      new RegExp(`${sdkPath}/node_modules/react-native/.*`),
      new RegExp(`${exprRnPath}/node_modules/react/.*`),
      new RegExp(`${exprRnPath}/node_modules/react-native/.*`),
    ],
    // Make node_modules available from the project root
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
    ],
    // Custom resolver to force React resolution
    resolveRequest: (context, moduleName, platform) => {
      // Force react and react-native to resolve from app's node_modules
      if (moduleName === 'react' || moduleName === 'react-native') {
        return {
          filePath: path.join(projectRoot, 'node_modules', moduleName, 'index.js'),
          type: 'sourceFile',
        };
      }
      // Let Metro handle other resolutions
      return context.resolveRequest(context, moduleName, platform);
    },
    // Map package names to their absolute paths
    extraNodeModules: new Proxy(
      {
        // Force React and React Native to resolve from the app's node_modules
        // to prevent multiple instances
        'react': path.resolve(projectRoot, 'node_modules/react'),
        'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
      },
      {
        get: (target, name) => {
          // Return predefined mappings first
          if (target[name]) {
            return target[name];
          }
          // Handle @digia scoped packages
          if (name === '@digia/rn-sdk') {
            return sdkPath;
          }
          if (name === '@digia/expr-rn') {
            return exprRnPath;
          }
          // Default to node_modules for everything else
          return path.join(projectRoot, 'node_modules', name);
        },
      }
    ),
    resolverMainFields: ['react-native', 'browser', 'main'],
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);