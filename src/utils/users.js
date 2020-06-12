const users = []
const addUser = ({ id, userName, roomName }) => {
    userName = userName.trim().toLowerCase()
    roomName = roomName.trim().toLowerCase()
    if (!userName || !roomName) {
        return {
            error: 'Username and room name is required'
        }
    }
    const existingUser = users.find((user) => {
        return user.roomName === roomName && user.userName === userName
    })
    if (existingUser) {
        return {
            error: 'Username already exists in the room'
        }
    }
    const user = { id, userName, roomName }
    users.push(user)
    return { user }

}
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (roomName) => {
    roomName = roomName.trim().toLowerCase()
    return users.filter((user) => user.roomName === roomName)
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}