/**
 * Port for the Webpack dev server. Only needed for Rich Cow developers
 */
exports.PORT = 12345;
/**
 * Is this a production environment?
 */
exports.PROD = false;
/**
 * Your application's name as you want it displayed to users
 */
exports.NAME = 'App';
/**
 * Passed to Material-UI's `createMUITheme()`. Can be left an empty object
 * https://material-ui.com/style/color/#color-tool
 */
exports.THEME = {};
/**
 * URL to your app's favicon
 */
exports.FAVICON = 'https://example.com/favicon.png';
/**
 * Where your users will be redirected to from Rich Cow. `{{JWT}}` will be
 *  replaced with the actual JWT.
 */
exports.APP_PAYMENT_URL = 'https://example.com/purchase?jwt={{JWT}}';
/**
 * URL for Rich Cow's API (rich-cow-server)
 */
exports.RICH_COW_API_URL = 'https://example.com/api/rich-cow';
