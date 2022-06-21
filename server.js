const express = require('express');
const cluster = require('cluster');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

const numCPUs = require('os').cpus().length;

const mode = args.mode || 'other';

if(mode == 'CLUSTER' || undefined){

    if(cluster.isMaster){
        console.log(`I am master ${process.pid}`);
        for(let i = 0; i < numCPUs; i++){
            cluster.fork()
        }
        cluster.on('listening', (worker, adress) => {
            console.log(`${worker.process.pid} is listenining in port ${adress.port}`);
        });
    } else {
    
        const app = express();
        
        const PORT = args.port || 8080;
        
        app.listen(PORT, (err) => {
        
            if(!err){
                console.log(
                    `Servidor escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`
                );
            }
        
        });
        
        app.get('/api/randoms/:cant?', async (req, res) => {
            try{
        
                const cant = req.query.cant || 100000;
        
                let array = [];
        
                let uniqueNumbers = [];
                let numbersRepet = [];
                let count = 1;
                
                const finishProcess = [];
            
                for(let i = 0; i <= cant ;i++){
                    array.push(Math.floor(Math.random() * (1000 - 1)) + 1);
                }
                
                array = array.sort(function(a,b){return a - b});
            
                for(let i = 1; i <= cant ;i++){
                    if(array[i] === array[i+1]){
                        count++;
                    } else {
                        uniqueNumbers.push(array[i]);
                        numbersRepet.push(count);
                        count = 1;
                    }
                }
            
                for(let i = 0; i < uniqueNumbers.length; i++){
                    if(numbersRepet[i] > 1){
                        finishProcess.push(`El número [${uniqueNumbers[i]}] se ha repetido: ${numbersRepet[i]} veces`);
                    } else {
                        finishProcess.push(`El número [${uniqueNumbers[i]}] se ha repetido: ${numbersRepet[i]} vez`);
                    }
                }
        
                res.status(200).send({finishProcess});
        
            }catch(err){
                console.log(err);
            }
        });
    
        console.log(`Worker ${process.pid}`);
    }
    

} else {

    console.log('Sólo ejecuciones en modo cluster, para ello agregue el parametro --mode CLUSTER');

}