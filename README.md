# CCashCow 💳💲🐄

Accept credit cards and cryptocurrencies. Dead simple user payment system so simple a ~~caveman~~ **cow** could do it.

CCashCow is a small app that sits between your application and the payment processors it uses. CCashCow offloads as much of the logic and user-interaction as possible to the forms maintained by and hosted on the payment processors themselves. Your app in turn offloads to CCashCow everything but the bare minimum needed for your app to accept payments. The end result is a system that's straightforward for developers and users, secure, easy to mantain, and as customizable as possible without introducing too much complexity.

![](https://i.imgur.com/bDtQ3yF.png)

Built and mantained by **[Ptorx](https://ptorx.com)** and other **[Xyfir](https://www.xyfir.com)** projects.

# Features

- Accept **c**redit **c**ards and debit cards with [Square](https://squareup.com/i/XYFIRLLC00)
- Accept popular **c**rypto**c**urrencies like Bitcoin with [**C**oinbase **C**ommerce](https://commerce.coinbase.com)
- Configurable fiat currency
- No dependencies other than Node and what npm will install
- No database needed
- Standalone server and web client that integrates into apps of any stack
- JSON Web Tokens (JWT) for secure and easy communication between your app and CCashCow
- Easy theming via [Material-UI](https://material-ui.com/style/color/#color-tool)

# Install

From now on we'll assume commands are run from `ccashcow/`.

As simple as CCashCow is, you'll still need to download, configure, build, and integrate it into your app. We've made it just about as easy as it could possibly be.

**Note #1:** If your system does not yet have Node installed, start with [nvm](https://github.com/creationix/nvm#install-script) (or [nvm for Windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows)).

**Note #2:** You may alternatively download CCashCow through npm (see [here](http://npmjs.com/package/ccashcow)), however this is not currently the recommended installation method. In the future we'll likely have a CLI tool available through npm to make configuring, running, and managing CCashCow instances easier.

## Step 0: Clone the repo

```bash
git clone https://github.com/Xyfir/ccashcow.git
cd ccashcow
```

## Step 1: Download npm dependencies

Install npm depencies for each module:

```bash
cd server
npm install
cd ../web
npm install
cd ../ # back to ccashcow/
```

## Step 2: Set environment variables

The CCashCow modules are configured via environment variables which are loaded into the applications via `.env` files located in each module's directory.

To understand the syntax of the `.env` files, know that they are first loaded via [dotenv](https://www.npmjs.com/package/dotenv) and then the string values provided by dotenv are parsed by [enve](https://www.npmjs.com/package/dotenv).

### Step 2a: Create `.env` files

First we'll create each file by copying the example `.env` files and then we'll work our way through populating them with values.

```bash
cp server/example.env server/.env
cp web/example.env web/.env
```

### Step 2b: Edit `.env` files

Edit the files `server/.env` and `web/.env`. Update the config keys with your own values. You can find descriptions for each one under the `CCashCow` -> `Env` namespaces in the [type definitions](https://github.com/Xyfir/ccashcow/blob/master/types/ccashcow.d.ts). Use the appropriate `interface` for each corresponding file.

## Step 3: Build from source

```bash
cd server
npm run build
cd ../web
npm run build
cd ../
```

## Step 4: Start the server

Now you'll need to start the server and serve the built files. The simplest way to do this is:

```bash
cd server
npm run start
cd ../
```

If you're in production, you'll probably run the server with [pm2](https://www.npmjs.com/package/pm2) and proxy the server through Nginx or Apache while serving static files through them instead of Node. For you, know that files to be served to the client are located in `web/dist` with `web/dist/index.html` serving as the web client's entry file.

## Step 5: Integrate into your app

This part is largely up to you, so it's important to understand the flow of data between your app and CCashCow:

1. Your app sends users to CCashCow's payment form either by user action or automatically through a forced redirection. You'll pass a JWT whose payload contains basic payment information, like an identifier, amount, and accepted methods.
2. CCashCow will handle everything until there's a successful purchase or until the user quits back to your app, at which point it will redirect the user back to your app with the JWT in the URL based on your configuration. The JWT will either be the original one you sent, or a new one generated by CCashCow containing the full payment data.

To be a bit more specific:

1. You'll need to be able to sign and verify/decode JSON Web Tokens via [jsonwebttoken](https://www.npmjs.com/package/jsonwebtoken) or the equivalent in your preferred language.
2. Somewhere in your app you'll allow the user to select products they wish to purchase.
3. Your app will save this data somehow, linking it to a unique id.
4. Your app will send the user to CCashCow with a JWT containing that id, the total amount of the purchase, and the accepted payment methods.
5. At some point the user will be redirected back to your app with the JWT in the url as you configured. Verify and decode this JWT to retrieve the payment information.
6. Using the JWT's payload, your app will check if the payment as been paid, and if your app has not already fulfilled the user's order it will do so then.

Check the [CCashCow.Payment](https://github.com/Xyfir/ccashcow/blob/master/types/ccashcow.d.ts) interface. Your app should only ever send a JWT containing `id`, `amount`, and `methods`; everything else will be added by CCashCow and sent back to your app with the user later. To check if a payment has been paid, all you have to do is check that `paid` is a number, and not `undefined`. Other values sent back to your app like `method` or `squareTransactionId` can be ignored unless you have some other use for them.

# Contribute

If you'd like to help work on CCashCow, the tutorial above will suffice to get you up and running. Certain things however will make your life easier:

- Make sure your `NODE_ENV` variables in the `.env` files are set to `"development"`.
- Run the web client's dev server via `npm run start` when in `web/`. Connect to it via the `PORT` you set in `web/.env`.
- Check the `scripts` in each module's `package.json` for helpful scripts.
