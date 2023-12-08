# Whatsapp Service

Unlock the power of seamless communication with our WhatsApp service! 🚀 Send messages effortlessly using our
user-friendly REST API. Plus, meet our Sticker Converter Bot, adding a touch of fun to your chats! 🌟 Connect, converse,
and convert with ease – all in one place!

This service use <a href="https://github.com/WhiskeySockets/Baileys" target="_blank">Baileys</a> as core package

## Core Features

1. REST APis send messages. Text, Image, Location, etc.
2. Bot for convert image to sticker
3. Bot for download view once
4. Bot forward view once to connected user

### Bot Triggers

1. Bot sticker
    - every whatsapp image message appeared with caption `#sticker` or `#convert_sticker`, then bot immediately convert
      and send to the sender
    - every whatsapp image message quoted with caption `#sticker` or `#convert_sticker`, then bot immediately convert
      and send to the sender
2. Bot for download view once
    - every whatsapp view once message appeared with caption `#download_view_once`, then bot immediately convert and
      send to the sender
    - every whatsapp view once message quoted with caption `#download_view_once`, then bot immediately convert and send
      to the sender
3. Bot forward view once
    - every view once message appeared then bot immediately convert and send to authenticated user
    - NB. this is not default bot you should update the code to run it

## Auth Method

1. File method
2. Database method (postgresql)

## How to use

1. clone repository
2. install dependencies
3. copy `example.env` to `.env` then replace it with value required
4. run the application
5. link whatsapp to application via QRCode that displayed in terminal (set env QR_TERMINAL to true)
6. application connected
7. application ready, bot ready listening new message
