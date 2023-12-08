// https://webpack.docschina.org/guides/public-path/#on-the-fly
// MICRO_APP 框架的地址
if ((window as any).__MICRO_APP_ENVIRONMENT__) {
  (window as any).__webpack_public_path__ = (window as any).__MICRO_APP_PUBLIC_PATH__;
}
