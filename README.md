# Mbot - Modern Chat Application 
Mbot is a sleek chat application built with React, Node.js, and Tailwind CSS.

## Installation Guide

### Requirements
- [Nodejs](https://nodejs.org/en/download)
- [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/)

Both should be installed and make sure MongoDB is running.

### Installation

```shell
git clone https://github.com/yourusername/mbot
cd mbot
```

Now rename env files from .env.example to .env
```shell
cd public
mv .env.example .env
cd ..
cd server
mv .env.example .env
cd ..
```

Now install the dependencies
```shell
cd server
npm install
cd ..
cd public
npm install
```

We are almost done, Now just start the development server.

For Frontend.
```shell
cd public
npm start
```

For Backend.

Open another terminal in folder, Also make sure MongoDB is running in background.
```shell
cd server
npm start
```

Done! Now open localhost:3000 in your browser.

## Features

- Modern UI with Tailwind CSS
- Real-time messaging with Socket.io
- User authentication
- Responsive design
- Emoji picker
- Clean and intuitive interface