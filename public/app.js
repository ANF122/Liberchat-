const socket = io();

document.getElementById('send-button').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const message = input.value;
    input.value = '';

    // Encrypt message
    crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    ).then(key => {
        const encodedMessage = new TextEncoder().encode(message);
        return crypto.subtle.encrypt(
            { name: "AES-GCM", iv: new Uint8Array(12) },
            key,
            encodedMessage
        );
    }).then(encryptedMessage => {
        socket.emit('message', encryptedMessage);
    });
});

socket.on('message', (encryptedMessage) => {
    // Decrypt message
    crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    ).then(key => {
        return crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(12) },
            key,
            encryptedMessage
        );
    }).then(decryptedMessage => {
        const decodedMessage = new TextDecoder().decode(decryptedMessage);
        const messageElement = document.createElement('div');
        messageElement.textContent = decodedMessage;
        document.getElementById('messages').appendChild(messageElement);
    });
});

// WebRTC setup for voice call
const peer = new Peer({ initiator: location.hash === '#init', trickle: false });

peer.on('signal', (data) => {
    socket.emit('peer-signal', data);
});

socket.on('peer-signal', (data) => {
    peer.signal(data);
});

document.getElementById('start-call').addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        peer.addStream(stream);
        const video = document.createElement('video');
        document.body.appendChild(video);
        video.srcObject = stream;
        video.play();
    });
});

peer.on('stream', (stream) => {
    const video = document.createElement('video');
    document.body.appendChild(video);
    video.srcObject = stream;
    video.play();
});
