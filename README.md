# Rich Cow

Dead simple user payment system so simple a ~~caveman~~ **cow** could do it.

Turn your app into a ca💲h c🐄w.

---

Rich Cow is a small app that sits in the middle between your application and the payment processors it uses. Rich Cow offloads as much of the logic and user-interaction as possible to the forms maintained by and hosted on the payment processors themselves. Your app in turn offloads to Rich Cow everything but the bare minimum needed for your app to accept payments. The end result is a system that's straightforward for developers and users, secure, easy to mantain, and as customizable as possible without introducing too much complexity.

**Will it continue receiving updates?** Yes. It was built for and is mantained by [Ptorx](https://ptorx.com) and other projects in the [Xyfir Network](https://www.xyfir.com/network).

**What's it look like?** However you want it to, but for the default theme, see [Screenshots](#screenshots).

# Features

- Accept credit and debit cards with [Square](https://squareup.com/i/XYFIRLLC00)
- Accept popular cryptocurrencies like Bitcoin with [Coinbase Commerce](https://commerce.coinbase.com/)
- No dependencies other than Node and what npm will install
  - Older Node versions not actively supported
- No database needed
  - Data is saved in simple JSON files stored to disk via [node-persist](https://www.npmjs.com/package/node-persist)
- Standalone server and web client
  - Easy integration into new and existing applications of any stack
- JSON Web Tokens (JWT)
  - Secure and easy communication between your app and Rich Cow
- Easy theming via [Material-UI](https://material-ui.com/style/color/#color-tool)

# Install

As simple as Rich Cow is, you'll still need to download, configure, build, and integrate it into your app. We've made it just about as easy as it could possibly be.

**Note #1:** If your system does not yet have Node installed, start with [nvm](https://github.com/creationix/nvm#install-script) (or [nvm for Windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows)).

**Note #2:** You may alternatively download Rich Cow through npm (see [here](http://npmjs.com/package/rich-cow)), however this is not currently the recommended installation method. In the future we'll likely have a CLI tool available through npm to make configuring, running, and managing Rich Cow instances easier.

## Server

```bash
git clone https://github.com/Xyfir/rich-cow.git
cd rich-cow/server
npm install
touch .env
```

Now open up `rich-cow/server/.env` in your editor and fill out the values. See the `RichCow.Env.Common` and `RichCow.Env.Server` interfaces in [types/rich-cow.d.ts](https://github.com/Xyfir/rich-cow/blob/master/types/rich-cow.d.ts) for expected environment variables. Format is `KEY=VALUE` (`PROD=true`, `NAME="Rich Cow"`, etc).

```bash
npm run build
npm run start # or launch ./dist/app.js however you like
```

At this point the setup is based on your environment and what your needs are. Probably you'll run the server with [pm2](https://www.npmjs.com/package/pm2) and put Node behind Nginx or Apache.

## Web Client

```bash
cd ../web
npm install
touch .env
```

Now open up `rich-cow/web/.env` in your editor and fill out the values. See the `RichCow.Env.Common` and `RichCow.Env.Web` interfaces in [types/rich-cow.d.ts](https://github.com/Xyfir/rich-cow/blob/master/types/rich-cow.d.ts) for expected environment variables.

```bash
npm run build
```

## Docker

Docker support is currently being added. You should use the Dockerfiles within the server and web directories to run containers using the .env files. See the docker-compose.yml for a (development environment) example.

## Integration Into Your App

This part is largely up to you, so it's important to understand the flow of data between your app and Rich Cow:

1. Your app sends users to Rich Cow's payment form either by user action or automatically through a forced redirection. You'll pass a JWT whose payload contains basic payment information, like an identifier, amount, and accepted methods.
2. Rich Cow will handle everything until there's a successful purchase or until the user quits back to your app, at which point it will redirect the user back to your app with the JWT in the URL based on your configuration. The JWT will either be the original one you sent, or a new one generated by Rich Cow containing the full payment data.

To be a bit more specific:

1. You'll need to be able to sign and verify/decode JSON Web Tokens via [jsonwebttoken](https://www.npmjs.com/package/jsonwebtoken) or the equivalent in your preferred language.
2. Somewhere in your app you'll allow the user to select products they wish to purchase.
3. Your app will save this data somehow, linking it to a unique id.
4. Your app will send the user to Rich Cow with a JWT containing that id, the total amount of the purchase, and the accepted payment methods.
5. At some point the user will be redirected back to your app with the JWT in the url as you configured. Verify and decode this JWT to retrieve the payment information.
6. Using the JWT's payload, your app will check if the payment as been paid, and if your app has not already fulfilled the user's order it will do so then.

### Payment JWT Payload

Check the [RichCow.Payment](https://github.com/Xyfir/rich-cow/blob/master/types/rich-cow.d.ts) interface. Your app should only ever send a JWT containing `id`, `amount`, and `methods`; everything else will be added by Rich Cow and sent back to your app with the user later. To check if a payment has been paid, all you have to do is check that `paid` is a number, and not `undefined`. Other values sent back to your app like `method` or `squareTransactionId` can be ignored unless you have some other use for them.

# Screenshots

This is about all there is to see. Once the user chooses a payment method they will be redirected to the payment processor's hosted form. Most of Rich Cow's utility is in the work it does behind the scenes communicating with each payment processor API.

<img src="https://i.imgur.com/TRPkDfv.png" alt="Rich Cow payment form" height="400px" />
