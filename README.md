# whatsapp-service

Send whatsapp message via node.js for free.

This service use <a href="https://github.com/adiwajshing/Baileys" target="_blank">Baileys</a> as core package

## How to use

1. Start the server then **GET** /qr-code to get the qr for whatsapp connection
2. Open your whatsapp on your mobile phone then scan the qr that you got
3. Now you can send whatsapp message via **POST** /message

## Routes

### **GET** /status

> Check whatsapp connection status

### **GET** /qr-code

> Get the qr png for whatsapp connection

### **POST** /message

> Send message to the specified phone number

#### **Body:**

```
    phone_number : string | required
    message      : string | required
```

### **DELETE** /logout

> Logout from the connected device
