// entry point of your application
// I will initialize Gun.js and establish connections.

import App from './App.svelte';

const app = new App({
	target: document.body,
});

export default app;

/*
import Gun from 'gun';
import 'gun/sea';
import 'gun/axe';

const gun = Gun();

// Setting up user authentication (if any)
const user = gun.user().recall({sessionStorage: true});

export { gun, user };


*/