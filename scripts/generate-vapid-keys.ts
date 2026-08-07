import webPush from 'web-push';

const keys = webPush.generateVAPIDKeys();
console.log('--- VAPID KEYS GENERATED ---');
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('VAPID_SUBJECT=mailto:vinayaktuitionclasses76@gmail.com');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + keys.publicKey);
