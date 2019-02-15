export namespace RichCow {
  export type PaymentMethod = "square" | "coinbase-commerce";

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
}
