# Decentralized Database Chat Application

## Project Overview
This project is a chat application built with the Svelte framework and using Gun.js as a decentralized graph database. The application allows users to sign up, log in, send, and receive messages in real-time With decentralized chat experience using the Svelte framework and Gun.js for real-time.

## Important Aspects 

### Where the Database Stored ? And How this Happen "decentralized chat experience using the Svelte framework and Gun.js for real-time"

### Answer :- In this project, the messages are stored in the Gun.js database. Gun.js is a decentralized graph database that allows data to be synchronized in real-time across multiple devices or nodes in a peer-to-peer network.

### Specifically, the messages are stored in the Gun.js database within the chativanappostolov node. Each message is encrypted and stored as a separate entry, with a timestamp serving as the key.

### The database storage and retrieval logic is implemented in the src/Chat.svelte file, where messages are retrieved from the database and displayed in the chat interface. When a new message is sent, it is encrypted and stored in the database. When the chat component initializes, it fetches messages from the database and decrypts them for display.



## Project Structure




```javascript


`
## Project Structure
├── package-lock.json
├── package.json
├── public
│ ├── 404.html
│ ├── favicon.png
│ ├── global.css
│ └── index.html
├── rollup.config.js
└── src
├── App.svelte
├── Chat.svelte
├── ChatMessage.svelte
├── Header.svelte
├── Login.svelte
├── main.js
└── user.js

----------------------------------


+---------------------+
|  User Interactions  |
+---------------------+
          |
          v
+--------------------+     +--------------------+
|  App Initialization |<---|  main.js           |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  App Component     |<---|  App.svelte         |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  Header Component  |<---|  Header.svelte      |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  Chat Component    |<---|  Chat.svelte        |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  Message Component |<---|  ChatMessage.svelte |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  User Authentication |<--|  user.js           |
+--------------------+     +--------------------+
          |
          v
+--------------------+
|  Database (Gun.js) |
+--------------------+
`
```




## File Explanations

1. **package.json and package-lock.json**
   - These files contain metadata about the project and its dependencies, ensuring that the project can be correctly installed and built.

2. **public/**
   - Contains static files like `404.html`, `favicon.png`, `global.css`, and `index.html` which are served to the client.

3. **rollup.config.js**
   - This is the configuration file for Rollup, a module bundler for JavaScript. It sets up the build process for the Svelte application, including plugins for Svelte compilation, CSS handling, and live reloading during development.

4. **src/main.js**
   - The entry point for the Svelte application. It initializes the Svelte App component and mounts it to the document.body.

5. **src/user.js**
   - Initializes the Gun.js database and handles user authentication. It also sets up a Svelte store to manage the current username.


```javascript

import GUN from 'gun';
import 'gun/sea';
import 'gun/axe';
import { writable } from 'svelte/store';

export const db = GUN();
export const user = db.user().recall({ sessionStorage: true });
export const username = writable('');

user.get('alias').on(v => username.set(v));

db.on('auth', async (event) => {
    const alias = await user.get('alias');
    username.set(alias);
    console.log(`signed in as ${alias}`);
});

```

6. **src/App.svelte**
   - The root Svelte component. It includes the Header and Chat components.

```javascript
<script>
  import Chat from './Chat.svelte';
  import Header from './Header.svelte';
</script>

<div class="app">
    <Header />
    <Chat />
</div>
```

7. **src/Chat.svelte**
   - Manages the chat interface. It handles message input, sending messages, and displaying received messages. It also deals with automatic scrolling of the chat view.

```javascript
<script>
  import Login from './Login.svelte';
  import ChatMessage from './ChatMessage.svelte';
  import { onMount } from 'svelte';
  import { username, user } from './user';
  import debounce from 'lodash.debounce';
  import GUN from 'gun';

  const db = GUN();
  let newMessage;
  let messages = [];
  let scrollBottom;
  let lastScrollTop;
  let canAutoScroll = true;
  let unreadMessages = false;

  function autoScroll() {
    setTimeout(() => scrollBottom?.scrollIntoView({ behavior: 'auto' }), 50);
    unreadMessages = false;
  }

  function watchScroll(e) {
    canAutoScroll = (e.target.scrollTop || Infinity) > lastScrollTop;
    lastScrollTop = e.target.scrollTop;
  }

  $: debouncedWatchScroll = debounce(watchScroll, 1000);

  onMount(() => {
    var match = {
      '.': { '>': new Date(+new Date() - 1 * 1000 * 60 * 60 * 3).toISOString() }, '-': 1,
    };

    db.get('chativanappostolov')
      .map(match)
      .once(async (data, id) => {
        if (data) {
          const key = '#foo';
          var message = {
            who: await db.user(data).get('alias'),
            what: (await SEA.decrypt(data.what, key)) + '',
            when: GUN.state.is(data, 'what'),
          };

          if (message.what) {
            messages = [...messages.slice(-100), message].sort((a, b) => a.when - b.when);
            if (canAutoScroll) {
              autoScroll();
            } else {
              unreadMessages = true;
            }
          }
        }
      });
  });

  async function sendMessage() {
    const secret = await SEA.encrypt(newMessage, '#foo');
    const message = user.get('all').set({ what: secret });
    const index = new Date().toISOString();
    db.get('chativanappostolov').get(index).put(message);
    newMessage = '';
    canAutoScroll = true;
    autoScroll();
  }
</script>

<div class="container">
  {#if $username}
    <main on:scroll={debouncedWatchScroll}>
      {#each messages as message (message.when)}
        <ChatMessage {message} sender={$username} />
      {/each}
      <div class="dummy" bind:this={scrollBottom} />
    </main>

    <form on:submit|preventDefault={sendMessage}>
      <input type="text" placeholder="Type a message..." bind:value={newMessage} maxlength="100" />
      <button type="submit" disabled={!newMessage}>Send</button>
    </form>
  {:else}
    <main>
      <Login />
    </main>
  {/if}
</div>
```

8. **src/ChatMessage.svelte**
   - Displays individual chat messages.

```javascript
<script>
  export let message;
  export let sender;

  const messageClass = message.who === sender ? 'sent' : 'received';
  const avatar = `https://avatars.dicebear.com/api/initials/${message.who}.svg`;
  const ts = new Date(message.when);
</script>

<div class={`message ${messageClass}`}>
  <img src={avatar} alt="avatar" />
  <div class="message-text">
    <p>{message.what}</p>
    <time>{ts.toLocaleTimeString()}</time>
  </div>
</div>

```

9. **src/Header.svelte**
   - Displays the header with the username and a sign-out button.

```javascript
<script>
  import { username, user } from './user';

  function signout() {
    user.leave();
    username.set('');
  }
</script>

<header>
  <h1>MychatApp</h1>
  {#if $username}
    <div class="user-bio">
      <span><strong>{$username}</strong></span>
      <img src={`https://avatars.dicebear.com/api/initials/${$username}.svg`} alt="avatar" />
    </div>
    <button class="signout-button" on:click={signout}>Sign Out</button>
  {/if}
</header>
```

10. **src/Login.svelte**
   - Manages user login and signup.

```javascript
<script>
  import { user } from './user';

  let username;
  let password;

  function login() {
    user.auth(username, password, ({ err }) => err && alert(err));
  }

  function signup() {
    user.create(username, password, ({ err }) => {
      if (err) {
        alert(err);
      } else {
        login();
      }
    });
  }
</script>

<label for="username">Username</label>
<input name="username" bind:value={username} minlength="3" maxlength="16" />
<label for="password">Password</label>
<input name="password" bind:value={password} type="password" />
<button class="login" on:click={login}>Login</button>
<button class="login"  on:click={signup}>Sign Up</button>
```



```javascript
+---------------------+
|  User Interactions  |
+---------------------+
          |
          v
+--------------------+     +--------------------+
|  App Initialization |<---|  main.js           |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  App Component     |<---|  App.svelte         |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  Header Component  |<---|  Header.svelte      |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  Chat Component    |<---|  Chat.svelte        |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  Message Component |<---|  ChatMessage.svelte |
+--------------------+     +--------------------+
          |
          v
+--------------------+     +--------------------+
|  User Authentication |<--|  user.js           |
+--------------------+     +--------------------+
          |
          v
+--------------------+
|  Database (Gun.js) |
+--------------------+
```


### Project Overview:

Initialization (main.js):

- The application initializes by creating a new instance of the App component and mounting it to the DOM.

Root Component (App.svelte):

- The root component (App.svelte) includes the Header and Chat components, which are rendered inside a div.

Header Component (Header.svelte):

- Displays the current username and a sign-out button.
- Shows the user's avatar and name if signed in; otherwise, omits the sign-out button.

Chat Component (Chat.svelte):

- Responsible for handling the chat interface.
- Loads existing messages from the Gun.js database, displays them, and handles new message input and sending.
- Utilizes the `onMount` lifecycle function to load messages from the database and set up listeners for new messages.
- Handles user input for new messages and sends them to the database upon form submission.

Message Component (ChatMessage.svelte):

- Renders individual messages, formatting the message text and metadata (sender and timestamp).

User Authentication (user.js):

- Initializes Gun.js and manages user authentication.
- Sets up a writable store for the username and handles login and signup processes.
- Configures the Gun.js database instance (`db`) to recall the user session and update the username store upon authentication.

Login Component (Login.svelte):

- Manages the login and signup forms.
- Handles user input for username and password.
- Performs login or signup actions when the respective buttons are clicked.



# The application offers a decentralized chat experience using the Svelte framework and Gun.js for real-time data synchronization. Each component fulfills a specific role, ensuring smooth functionality from user authentication to message handling and rendering. The flow chart provides a clear overview of the application's data flow and interactions.

