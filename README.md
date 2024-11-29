# Whatsapp Service

Effortlessly send messages using our user-friendly REST API. Additionally, introduce our Sticker Converter Bot to enhance your chats. Connect, converse, and convert with ease—all in one place!

This service use <a href="https://github.com/WhiskeySockets/Baileys" target="_blank">Baileys</a> as core package

## Core Features

1. REST APIs send messages, including text, images, locations, etc
2. Sticker Bot

    > Bot for converting images to stickers.

3. View once downloader Bot

    > Bot for downloading view once messages.

4. View once forwarder Bot

    > Bot for forwarding view once messages to connected users.

5. Deleted message forwarder Bot
    > Bot for forwarding all deleted messages to connected users.

### Bot Triggers

1. Sticker Bot
    - Every WhatsApp image message appears with the caption `#sticker` or `#convert_sticker`. The bot then immediately
      converts and sends it to the sender.
    - Every WhatsApp image message replied with the caption `#sticker` or `#convert_sticker`. The bot then immediately
      converts and sends it to the sender.
2. View once downloader Bot
    - Every WhatsApp view once message appears with the caption `#dvo`. The bot then immediately converts
      and sends it to the
    - Every WhatsApp view once message replied with the caption `#dvo`. The bot then immediately converts
      and sends it to the sender.
3. View once forwarder Bot
    - Every view once message that appears is immediately converted and sent to the authenticated user.
    - NB. This is not the default bot, you should update the code to run it.
4. Deleted message forwarder
    - Every deleted messages will be automatically forwarded to the authenticated user along with the original content.
    - NB. This feature is exclusively supported with the database authentication method.

## Auth Method

1. File method
2. Database method (postgresql)

## How to use

1. Clone the repository.
2. Install dependencies.
3. Copy `example.env` to `.env` and replace the values with the required configurations.
4. Run the application.
5. Link WhatsApp to the application via the QR code displayed in the terminal (set the environment variable QR_TERMINAL
   to true).
6. The application is connected.
7. The application is ready, and the bot is listening for new messages.
