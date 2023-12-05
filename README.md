# whatsapp-service

Send whatsapp message via node.js, image to WhatsApp sticker bot.

This service use <a href="https://github.com/WhiskeySockets/Baileys" target="_blank">Baileys</a> as core package

## How to use

1. Start the server then **GET** /qr-code to get the qr for whatsapp connection
2. Open your whatsapp on your mobile phone then scan the qr that you got
3. Now you can send whatsapp message via **POST** /message

### Image to sticker

> Send image with a caption `#convert_to_sticker` or `convert to sticker` or `#sticker` to phone number connected, That
> will automatically reply with sticker from the image.

## Routes

### **GET** /status

> Check whatsapp connection status

### **GET** /qr-code

> Get the qr png for whatsapp connection

### **DELETE** /logout

> Logout from the connected device
