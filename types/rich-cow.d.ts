export namespace RichCow {
  export type PaymentMethod = 'square' | 'coinbase-commerce';

  export interface Payment {
    // Provided by application
    /**
     * A unique identifier for the payment as created by the application.
     */
    id: number;
    /**
     * Amount in USD cents.
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
       * Is this a production environment?
       */
      PROD: boolean;
      /**
       * Your application's name as you want it displayed to users
       */
      NAME: string;
    }

    export interface Server extends RichCow.Env.Common {
      /**
       * Port the API will be hosted on
       */
      PORT: number;
      /**
       * This is the shared HS256 key used by Rich Cow and your app to sign and verify
       *  JSON Web Tokens with.
       */
      JWT_KEY: string;
      /**
       * For Jest tests. Keep this as such so the TypeScript compiler is happy
       */
      TEST_STORAGE: object;
      /**
       * Absolute path for rich-cow-web.
       * @example "/path/to/rich-cow/web"
       */
      WEB_DIRECTORY: string;
      /**
       * URL for Rich Cow's web client (where your users will access it)
       * @example "https://example.com/rich-cow"
       */
      RICH_COW_WEB_URL: string;
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
      STORAGE: object;
      /**
       * Your api key for Coinbase Commerce if you wish to accept cryptocurrencies
       */
      COINBASE_COMMERCE_API_KEY?: string;
    }

    export interface Web extends RichCow.Env.Common {
      /**
       * Port for the Webpack dev server. Only needed for Rich Cow developers
       */
      PORT: number;
      /**
       * Passed to Material-UI's `createMUITheme()`. Can be left an empty object
       * https://material-ui.com/style/color/#color-tool
       */
      THEME: object;
      /**
       * URL to your app's favicon
       */
      FAVICON: string;
      /**
       * Where your users will be redirected to from Rich Cow. `{{JWT}}` will be
       *  replaced with the actual JWT.
       * @example "https://example.com/purchase?jwt={{JWT}}"
       */
      APP_PAYMENT_URL: string;
      /**
       * URL for Rich Cow's API (rich-cow-server)
       * @example "https://example.com/api/rich-cow"
       */
      RICH_COW_API_URL: string;
    }
  }
}
