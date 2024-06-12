import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket} from 'socket.io';

//Aca se manejan los eventos de cionexion y desconexion
@WebSocketGateway({namespace: 'chat'})
export class WebsocketGateway 
    implements OnGatewayConnection, OnGatewayDisconnect 
{
    @WebSocketServer()
    server: Server

    handleConnection(client: Socket) {
        console.log(`Client connected:  ${client.id}`);
        
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        
    }

    //Message Event
    @SubscribeMessage('message')
    handleMesage(@ConnectedSocket() client: Socket, @MessageBody() data:any){ //catch de data being send 
        console.log(data);
        // this.server.emit('messageServer', data); // emit send the message to all the clients

        client.broadcast.emit('messageServer', data);
    }
}