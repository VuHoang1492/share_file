const checkSupport =()=>{
    return 'File' in window && 'FileReader' in window && 'FileList' in window && 'Blob' in window &&'WebSocket' in window;
    }
const socketClient = (roomId,path) => {
    if(!    checkSupport()){
        onRenderBrowserNotSupport();
        return
    }

    const client = new WebSocket(path);

    if(roomId !=null)
    {
        //Truyen file trong room
        client.onopen = () => {
            console.log("Create socket!!");
    
        }
        client.addEventListener('close', () => {
            console.log("Close Socket!!");
        })
        client.onerror = (err) => {
            console.log(err);
        }
        client.addEventListener('message', (e) => {
            console.log('Get Message!!');
            console.log(JSON.parse(e.data));
    
        })
    }
    else
    {
       //Truyen file trong local 
        client.onopen = () => {
            console.log("Create socket!!");
    
        }
        client.addEventListener('close', () => {
            console.log("Close Socket!!");
        })
        client.onerror = (err) => {
            console.log(err);
        }
        client.addEventListener('message', (e) => {
            console.log('Get Message!!');
            console.log(JSON.parse(e.data));
    
        })
    }
}





