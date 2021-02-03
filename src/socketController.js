
// peers = {}
//
// let roomsWithPeers={}

const roomPrefix="ROOM-";
module.exports = (io) => {
    io.on('connect', (socket) => {
        console.log('client-'+ socket.id+'is connected')


        socket.on('create or join',room_id => {


            let clientsInRoom = io.sockets.adapter.rooms[room_id];
            let numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
            console.log(io.sockets.adapter.rooms);

            console.log(socket.id +' is trying to create or join '+room_id+'('+numClients+')');

            if (numClients >3) {
                socket.emit('full', room_id);
            } else {
                socket.join(room_id);
                socket.broadcast.to(room_id).emit('initReceive', socket.id)
            }
        });

        // });
        // Initiate the connection process as soon as the client connects
        //
        // peers[socket.id] = socket
        //
        // // Asking all other clients to setup the peer connection receiver
        // for(let id in peers) {
        //     if(id === socket.id) continue
        //     console.log('sending init receive to ' + socket.id)
        //     peers[id].emit('initReceive', socket.id)
        // }

        /**
         * relay a peerconnection signal to a specific socket
         */
        socket.on('signal', data => {
            console.log('sending signal from '+socket.id + ' to '+data.socket_id)
            socket.broadcast.to(data.socket_id).emit('signal', {
                socket_id: socket.id,
                signal: data.signal
            });

            // if(!peers[data.socket_id])return
            // peers[data.socket_id].emit('signal', {
            //     socket_id: socket.id,
            //     signal: data.signal
            // })
        })

        /**
         * remove the disconnected peer connection from all other connected clients
         */

        socket.on('disconnecting', () => {
            const roomOrSocketId = Object.keys(socket.rooms);
            let disconnecting_room_id="";
            console.log(roomOrSocketId);
            for(let id of  roomOrSocketId) {
                console.log(id);
                if(id.startsWith(roomPrefix)){
                    disconnecting_room_id=id;
                }
            }
            if(disconnecting_room_id!==""){
                console.log('socket disconnected ' + socket.id+'from room - '+disconnecting_room_id)
                socket.broadcast.to(disconnecting_room_id).emit('removePeer', socket.id)
            }

            // the rooms array contains at least the socket ID
        });


        // socket.on('disconnect', () => {
        //     console.log(Object.keys(socket.rooms));
        //     let disconnecting_room_id=io.sockets.manager.rooms[socket.id]
        //     console.log('socket disconnected ' + socket.id+'from room -'+disconnecting_room_id)
        //     socket.broadcast.to(disconnecting_room_id).emit('removePeer', socket.id)
        //    // socket.broadcast.emit('removePeer', socket.id)
        //     //delete peers[socket.id]
        // })

        /**
         * Send message to client to initiate a connection
         * The sender has already setup a peer connection receiver
         */
        socket.on('initSend', init_socket_id => {
            console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id)

            socket.broadcast.to(init_socket_id).emit('initSend', socket.id);

            //peers[init_socket_id].emit('initSend', socket.id)
        })
    })
}