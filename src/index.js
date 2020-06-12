const http = require('http');
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()
const webServer = http.createServer(app)
const io = socketio(webServer)
const port = process.env.PORT || 3000
const publicDir = path.join(__dirname, '../public')
const { generateMessage, generateLocationMesage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
app.use(express.static(publicDir))
let welcome = 'Welcome!'
io.on('connection', (socket) => {
    console.log('new WS connections')
    socket.on('sendMessage', (message, callback) => {
        const { userName, roomName } = getUser(socket.id)

        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('no bad language')
        }
        io.to(roomName).emit('message', generateMessage(userName, message))
        callback('delivered')
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.roomName).emit('message', generateMessage('Admin', `${user.userName} has left`))
            io.to(user.roomName).emit('roomData', {
                roomName: user.roomName,
                users: getUsersInRoom(user.roomName)
            })
        }
    })
    socket.on('sendLocation', (location, callback) => {
        const { userName, roomName } = getUser(socket.id)
        io.to(roomName).emit('locationMessage', generateLocationMesage(userName, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
    socket.on('joinRoom', ({ userName, roomName }, callback) => {
        const { user, error } = addUser({ id: socket.id, userName, roomName })
        if (error) {
            return callback(error)
        }
        socket.join(user.roomName)
        socket.emit('message', generateMessage('Admin', welcome))
        socket.broadcast.to(user.roomName).emit('message', generateMessage('Admin', `${user.userName} has joined`))
        io.to(user.roomName).emit('roomData', {
            roomName: user.roomName,
            users: getUsersInRoom(user.roomName)
        })
        callback()

    })
})
webServer.listen(port, () => {
    console.log('started server')
})
