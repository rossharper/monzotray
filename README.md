# monzotray

![Screenshot](https://github.com/rossharper/monzotray/raw/master/monzotrayss.png)

Quickly hacked Electron-based app that shows Monzo balance in the system tray. Uses code shamelessly stolen from @robinjmurphy.

Note: it currently only loads balance and recent transactions once on load - it does not refresh data automatically whilst running.

I don't make any promises about developing this any further!

Code currently nicked from https://github.com/robinjmurphy/monies
Could do with using an external Monzo client package.

The app uses http://electron.atom.io/
It is currently unpackaged, but can be run if you install Electron locally or globally.

# Usage

```
git clone https://github.com/rossharper/monzotray`
cd monzotray
npm install
```

Install Electron:

```
# local install
npm install electron

# global install
npm install electron -g
```

Get a Monzo access token from the developer portal: https://developers.getmondo.co.uk/

Export the token in your shell:

```
export MONZO_TOKEN=<paste_your_token_here>
```

Note: this token will expire periodically.

Run monzotray:

```
# locally installed electron
./node_modules/.bin/electron .

# globally installed electron
electron .
```
