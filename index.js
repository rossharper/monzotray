const {
    app,
    BrowserWindow,
    Tray,
    Menu,
    MenuItem
} = require('electron')

const _ = require('lodash');
const async = require('async');
const client = require('./client');
const token = require('./token');
const moment = require('moment');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let tray
let menu

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600
    })

    // and load the index.html of the app.
    win.loadURL(`file://${__dirname}/index.html`)

    // Open the DevTools.
    //win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

function loadBalance() {
    async.waterfall([
        function getAccountId(done) {
            client.getAccountId(token, done);
        },
        function getBalance(accountId, done) {
            client.getBalance(token, accountId, done);
        }
    ], (err, balance) => {
        if (err) {
            console.log('error getting balance')
            return;
        }

        tray.setTitle(`${balance}`);
    });
}



function pad(string, length) {
    while (string.length < length) {
        string += ' ';
    }

    return string;
}

function longest(data, key) {
    return _.cloneDeep(data).sort((a, b) => {
        return a[key].length - b[key].length;
    }).reverse()[0][key].length;
}

function print(transactions) {
    const data = transactions.map((t) => {
        const credit = t.amount > 0;
        const color = credit ? 'green' : 'red';
        const prefix = credit ? '+' : '-';
        const amount = (Math.sqrt(t.amount * t.amount) / 100).toFixed(2);
        const emoji = _.get(t, 'merchant.emoji') || '💳';
        const description = _.get(t, 'merchant.name', t.description);

        return {
            amount: `${prefix}£${amount}`,
            description: `${emoji}  ${description}`,
            time: moment(t.created).fromNow()
        };
    });

    const longestAmount = longest(data, 'amount');
    const longestDescription = longest(data, 'description');

    menu = new Menu()
    data.forEach((d) => {
        menu.append(new MenuItem({
            label: pad(d.amount, longestAmount) + pad(d.description, longestDescription) + d.time,
            click() {
                console.log('item clicked')
            }
        }))
    });
    tray.setContextMenu(menu)
}

function loadRecents() {
    const since = moment().subtract(72, 'hours');

    async.waterfall([
        function getAccountId(done) {
            client.getAccountId(token, done);
        },
        function getBalance(accountId, done) {
            client.getTransactions(token, accountId, since.format(), done);
        }
    ], (err, transactions) => {
        if (err) {
            console.log('error getting recents')
            return;
        }

        print(transactions);
    });
}

function onReady() {
    tray = new Tray('trayicon.png')

    tray.setToolTip('💳 Monzo')

    //createWindow()
    loadBalance()
    loadRecents()

    tray.on('click', () => {
            //win.isVisible() ? win.hide() : win.show()
        })
        /*
        win.on('show', () => {
            tray.setHighlightMode('always')
        })
        win.on('hide', () => {
            tray.setHighlightMode('never')
        })*/
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onReady)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
