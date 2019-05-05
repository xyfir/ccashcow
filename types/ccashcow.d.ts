export namespace CCashCow {
  export type PaymentMethod = 'square' | 'coinbase-commerce';

  export interface Payment {
    // Provided by main application to CCashCow
    /**
     * A unique identifier for the payment as created by the application.
     */
    id: number;
    /**
     * Amount in the smallest denomination of the applicable currency.
     * @example 999 // $9.99 if currency is USD
     */
    amount: number;
    /**
     * Allowed methods for the user to choose from for the payment.
     */
    methods: PaymentMethod[];

    // For completed payments
    /**
     * Unix timestamp in milliseconds of when the payment was paid.
     */
    paid?: number;
    /**
     * The payment method the user fulfilled the payment with.
     */
    method?: PaymentMethod;
    /**
     * ID of the Square transaction.
     * https://docs.connect.squareup.com/api/connect/v2#type-transaction
     */
    squareTransactionId?: string;
    /**
     * The code for the Coinbase Commerce charge.
     * https://commerce.coinbase.com/docs/api/#charges
     */
    coinbaseCommerceChargeCode?: string;

    // JWT properties
    iat?: number;
    exp?: number;
  }

  export namespace Env {
    export interface Common {
      /**
       * Your application's name as you want it displayed to users
       */
      NAME: string;
      /**
       * Is this a production environment?
       */
      NODE_ENV: 'development' | 'production';
      /**
       * Base path (for URL) of static files
       * @example "/static/"
       */
      STATIC_PATH: string;
      /**
       * Code of the currency to use.
       *  https://www.iban.com/currency-codes
       * @example "USD"
       * @example "CAD"
       */
      CURRENCY: string;
      /**
       * Because `amount` is provided in the smallest denomination of the
       *  applicable currency, we need a modifier to convert the amount to the
       *  currency's typical denomination.
       * @example 0.01 // For USD, convert 999 cents to $9.99
       */
      CURRENCY_MODIFIER: number;
    }

    export interface Server extends CCashCow.Env.Common {
      /**
       * Port the API will be hosted on
       */
      PORT: number;
      /**
       * This is the shared HS256 key used by CCashCow and your app to sign and verify
       *  JSON Web Tokens with.
       */
      JWT_KEY: string;
      /**
       * For Jest tests. Keep this as such so the TypeScript compiler is happy
       */
      TEST_STORAGE: any;
      /**
       * Absolute path for ccashcow-web.
       * @example "/path/to/ccashcow/web"
       */
      WEB_DIRECTORY: string;
      /**
       * URL for CCashCow's web client (where your users will access it)
       * @example "https://example.com/ccashcow"
       */
      CCASHCOW_WEB_URL: string;
      /**
       * Your access token for Square's API if you wish to accept credit cards
       */
      SQUARE_ACCESS_TOKEN?: string;
      /**
       * Your location key for Square's API if you wish to accept credit cards
       */
      SQUARE_LOCATION_KEY?: string;
      /**
       * Options for the user database (uses node-persist). All that's needed is `dir`
       * https://www.npmjs.com/package/node-persist#async-initoptions-callback
       */
      STORAGE: any;
      /**
       * Your api key for Coinbase Commerce if you wish to accept cryptocurrencies
       */
      COINBASE_COMMERCE_API_KEY?: string;
    }

    export interface Web extends CCashCow.Env.Common {
      /**
       * Port for the Webpack dev server. Only needed for CCashCow developers
       */
      PORT: number;
      /**
       * Passed to Material-UI's `createMUITheme()`. Can be left an empty
       *  object. If you provide an array, the first element will be treated
       *  as a light theme and the second element as a dark theme. Make sure
       *  the `palette.type` property is set respectively.
       * https://material-ui.com/style/color/#color-tool
       * @example {}
       * @example [{"palette":{"type":"light"}},{"palette":{"type":"dark"}}]
       */
      THEME: any | any[];
      /**
       * URL to your app's favicon
       */
      FAVICON: string;
      /**
       * If you provide both light and dark themes, this is the key used for
       *  `localStorage.getItem()` to retrieve the current theme type
       *  (`"light"` or `"dark"`).
       * @example "theme"
       */
      THEME_TYPE_KEY?: string;
      /**
       * Where your users will be redirected to from CCashCow. `{{JWT}}` will be
       *  replaced with the actual JWT.
       * @example "https://example.com/purchase?jwt={{JWT}}"
       */
      APP_PAYMENT_URL: string;
      /**
       * URL for CCashCow's API (ccashcow-server)
       * @example "https://example.com/api/ccashcow"
       */
      CCASHCOW_API_URL: string;
    }
  }
}
