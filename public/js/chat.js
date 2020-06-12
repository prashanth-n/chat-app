const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.querySelector('input')
const $messageBtn = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')
const messageTemplapte = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const { userName, roomName } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const autoScroll = () => {
    // to get the latest message element
    const $newmEssageElem = $messages.lastElementChild
    //to get the height of the new message
    const newMessageStyles = getComputedStyle($newmEssageElem)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newmEssageElem.offsetHeight + newMessageMargin
    //to get visible heoght
    const visibleHeight = $messages.offsetHeight
    //to get height of messages container
    const containerHeight = $messages.scrollHeight
    //to get scrolled postion of user
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplapte, {
        userName:message.userName,message: message.text, createdAt: moment(message.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('locationMessage', (message) => {
    const locationHtml = Mustache.render(locationTemplate, {
        userName:message.userName,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', locationHtml)
    autoScroll()
})
socket.on('roomData',({roomName,users}) => {
    console.log(roomName)
    const roomHtml = Mustache.render(sidebarTemplate,{
        roomName,
        users
    })
    document.querySelector('#sidebar').innerHTML = roomHtml
})
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageBtn.setAttribute('disabled', 'disabled')
    const userMessage = e.target.elements.message.value;
    socket.emit('sendMessage', userMessage, (err) => {
        $messageBtn.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()
        if (err) return err
        console.log('message delivered', fromServerMessage)
    })
})
$locationButton.addEventListener('click', (e) => {
    $locationButton.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        alert('No location support')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, (fromServer) => {
            console.log('Location shared')
            $locationButton.removeAttribute('disabled')
        })
    }, (err) => {
        console.log(err)
    })
})
socket.emit('joinRoom', { userName, roomName }, (error) => {
    if(error){
        alert(error)
        location.href='/'
    }
})