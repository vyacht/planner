# vy travel

## NPM Scripts

* 🔥 `start` - run development server
* 🔧 `dev` - run development server
* 🔧 `build-dev` - build web app using development mode (faster build without minification and optimization)
* 🔧 `build-prod` - build web app for production
* 📱 `build-dev-cordova` - build cordova app using development mode (faster build without minification and optimization)
* 📱 `build-prod-cordova` - build cordova app
* 📱 `build-dev-cordova-ios` - build cordova iOS app using development mode (faster build without minification and optimization)
* 📱 `build-prod-cordova-ios` - build cordova iOS app
* 📱 `build-dev-cordova-android` - build cordova Android app using development mode (faster build without minification and optimization)
* 📱 `build-prod-cordova-android` - build cordova Android app

## WebPack

There is a webpack bundler setup. It compiles and bundles all "front-end" resources. You should work only with files located in `/src` folder. Webpack config located in `build/webpack.config.js`.

Webpack has specific way of handling static assets (CSS files, images, audios). You can learn more about correct way of doing things on [official webpack documentation](https://webpack.js.org/guides/asset-management/).
