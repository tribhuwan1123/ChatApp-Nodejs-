const socket = io();

const messageForm = document.querySelector('#messageForm');
const inputMessage = messageForm.querySelector('input');
const messasgeButton = messageForm.querySelector('button');
const locationButton = document.querySelector("#sendLocation");
const messages = document.querySelector('#messages');

//Templates
const messageTemplates = document.querySelector('#messageTemplate').innerHTML;
const locationTemplate = document.querySelector('#locationTemplate').innerHTML;
const sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML;


const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
const autoscroll=()=>{
    const $newMessage=messages.lastElementChild;
    const newMessageStyle=getComputedStyle($newMessage);
    const newMessageMargin=parseInt(newMessageStyle.marginBottom);
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin;
    const visibleHeight=messages.offsetHeight;
    const contentHeight=messages.scrollHeight;
    const scrollOffSet=messages.scrollTop+visibleHeight;
    if (contentHeight-newMessageHeight<=scrollOffSet){
        messages.scrollTop=messages.scrollHeight;
    }
};

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplates, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoscroll();

});
socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate, {
       room,
        users
    });
   document.querySelector('#sidebar').innerHTML=html;
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    messasgeButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        messasgeButton.removeAttribute('disabled');
        inputMessage.value = '';
        inputMessage.focus();
        if (error) {
            return console.log(error);
        }
        console.log('Message Delivered');

    });
});

locationButton.addEventListener('click', () => {
    locationButton.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location Shared');
            locationButton.removeAttribute('disabled');
        });
    });
});
socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error);
        location.href='/'
    }
});
