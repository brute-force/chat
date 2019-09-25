# chat

Are you tired of your friends never looking at the videos you send them in chat? Do they say "I'll look later!" or "I'll bookmark this?" And then when you talk about the videos you can tell they've never seen them? Or have they just started saying "I'm never clicking this?"  
  
Here's a chat server that parses YouTube links and automatically plays the videos right on their chat page! Now they'll have to watch your videos -- at least until they close the browser tab.  
  
This is a rewrite of [chat-server](https://github.com/brute-force/chat-server). The front end uses [Vue.js](https://github.com/vuejs/vue) and handles authentication. The back end serves express and socketio.  
  
## Front end setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).  
  
***
   
## Back end setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Deploy to AWS Elastic Beanstalk
```
eb deploy
```