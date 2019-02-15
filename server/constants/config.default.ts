import { InitOptions } from 'node-persist';

/**
 * Port the API will be hosted on
 */
export const PORT = 12345;
/**
 * Is this a production environment?
 */
export const PROD = false;
/**
 * Your application's name as you want it displayed to users
 */
export const NAME = 'App';
/**
 * For Jest tests. Keep this as such so the TypeScript compiler is happy
 */
export const TESTS = { STORAGE: { dir: '' } };
/**
 * This is the shared HS256 key used by Rich Cow and your app to sign and verify
 *  JSON Web Tokens with.
 */
export const JWT_KEY = 'some_secret_key1234';
/**
 * Absolute path to rich-cow-web
 */
export const WEB_DIRECTORY = '/path/to/rich-cow/web';
/**
 * URL for Rich Cow's web client (where your users will access it)
 */
export const RICH_COW_WEB_URL = 'https://example.com/rich-cow';
/**
 * Your access token for Square's API if you wish to accept credit cards
 */
export const SQUARE_ACCESS_TOKEN = '';
/**
 * Your location key for Square's API if you wish to accept credit cards
 */
export const SQUARE_LOCATION_KEY = '';
/**
 * Options for the user database (uses node-persist). All that's needed is `dir`
 * https://www.npmjs.com/package/node-persist#async-initoptions-callback
 */
export const STORAGE: InitOptions = {
  dir: 'C:\\Users\\_\\Desktop\\Projects\\_data\\rich-cow'
};
/**
 * Your api key for Coinbase Commerce if you wish to accept cryptocurrencies
 */
export const COINBASE_COMMERCE_API_KEY = '';
