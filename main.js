const electron = require('electron')
const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron

//set env
process.env.NODE_ENV = 'production'

let mainWindow
let addWindow


// listen for app to be ready
app.on('ready', function(){
  //create a new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  //load html file to the window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  })) // file://__dirname/index.html
  
  //Quit app when closed
  mainWindow.on('closed', function(){
    app.quit()
  })

  //Build menu from temp
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
  
  //insert menu
  Menu.setApplicationMenu(mainMenu)
})

//handle create add window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  })) // file://__dirname/addWindow.html
  //garbage collector
  addWindow.on('close', function(){
    addWindow = null
  })
}
//catch item:add
ipcMain.on('item:add', function(e, item){
  mainWindow.webContents.send('item:add', item)
  addWindow.close()
})

// create a menu temp
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click(){
          createAddWindow()
        }
      },
      {
        label: 'Clear Items',
        accelerator: process.platform == 'darwin' ? 'Command+U' : 'Ctrl+U',
        click(){
          mainWindow.webContents.send('item:clear')
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit()
        } 
      }
    ]
  }
]

//if mac, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({})
}

//add dev tools item if not in production
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'DevTools',
    submenu: [
      {
        label: 'Toggle Devtools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools()
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}