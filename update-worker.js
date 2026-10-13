'use strict';
// Revalidate app files against the network; leave unrelated requests alone.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;if(event.request.mode==='navigate'||/\.(?:js|css|csv|html)$/.test(url.pathname))event.respondWith(fetch(event.request,{cache:'no-cache'}));});
