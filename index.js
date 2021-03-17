const http = require('http');
const WebSocketServer = require('websocket').server
const Whatsapp = require('@adiwajshing/baileys');
const fs = require('fs');

const server = http.createServer();
server.listen(9898);

const wsServer = new WebSocketServer({ httpServer : server });

wsServer.on('request', (request)=>{
    const connection = request.accept(null, request.origin);
    const conn = new Whatsapp.WAConnection();
    const connectToWhatsapp = async () =>{ 
        conn.regenerateQRIntervalMs = null;
        conn.autoReconnect = Whatsapp.ReconnectMode.onConnectionLost

        const path_auth = './auth_info.json';
    
        try{
            if(fs.existsSync(path_auth)){
                conn.loadAuthInfo(path_auth);
            }
        }catch(err){ console.log(err) }
    
        conn.on('credentials-updated', () => {
            const authinfo = conn.base64EncodedAuthInfo();
            fs.writeFileSync('./auth_info.json', JSON.stringify(authinfo, null, '\t'));
        });
    
   
        conn.on('open', result=>{
            connection.send(JSON.stringify(result.user))
        });

        conn.on('chat-update', async chat => {
            if (chat.presences) {
                connection.send(JSON.stringify(chat.presences))
            }
        });

        conn.on('contacts-received', () => {
            connection.send(JSON.stringify(conn.contacts))
        });
    
        await conn.connect();
    }
    
    connectToWhatsapp().catch(err=>console.log(err));
    
    connection.on('message', (message)=>{
        console.log(message.utf8Data);
        command = message.utf8Data;
        switch(command){
            case 'info':
                connection.send(JSON.stringify(conn.user))
            break;
        }
    });
    connection.on('close',(rCode, desc)=>{
        console.log('Client Disconnected!');
    });
});

