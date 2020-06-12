const generateMessage = (userName,text) => {
    return {
        userName,
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocationMesage = (userName, url) => {
    return {
        userName,
        url,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMesage
}