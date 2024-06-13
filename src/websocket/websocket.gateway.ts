import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket} from 'socket.io';

interface ClientData {
    type: 'user' | 'support';
    id: string;
}

@WebSocketGateway({namespace: 'chat'})
export class WebsocketGateway 
    implements OnGatewayConnection, OnGatewayDisconnect 
{
    @WebSocketServer()
    server: Server
    private clients: ClientData[] = []; // almacena la info de los clientes conectados 

    handleConnection(client: Socket) {
        console.log(`Client connected:  ${client.id}`);
        
    }

    handleDisconnect(client: Socket) {
        this.clients = this.clients.filter(c => c.id !== client.id);
        console.log(`Client disconnected: ${client.id}`);
        console.log(this.clients);
        
    }

    @SubscribeMessage('register')
    handleRegister(@ConnectedSocket() client: Socket, @MessageBody() message: { event: string, data: { type: 'user' | 'support' } }) {
        const { data } = message;
        console.log('Received registration data:', data)
        if (data && data.type) {
            this.clients.push({ id: client.id, type: data.type });
            console.log(`Client registered: ${client.id} as ${data.type}`);
        } else {
            console.log(`Client registration failed: missing type`);
        }
    }

    //Message Event
    @SubscribeMessage('message')
    handleMesage(@ConnectedSocket() client: Socket, @MessageBody() data:any){ //catch de data being send 
        console.log(data);
        const sender = this.clients.find(c => c.id === client.id);
        if (sender) {
            client.broadcast.emit('messageServer', { sender: sender.type, message: data.message });
        }
    }
}