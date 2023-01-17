const http = require('http');

const fsPromises = require('fs').promises;
const path = require('path');
const fs = require('fs')

const PORT = process.env.PORT || 5500;
const serveFile = async (filePath, contentType, response) => {
    try{
        const rawData = await fsPromises.readFile(
            filePath,
            !contentType.includes('image')?'utf8':''
            );
        const data = contentType ==='application/json'
        ?JSON.parse(rawData): rawData;
        response.writeHead(200, {'Content-Type':contentType})
        response.end(
            contentType ==='application/json'? JSON.stringify(data):data
        )
    }catch(err){
        console.log(err)
        response.statusCode = 500;
        response.end()
    }
}

const server = http.createServer((req,res)=>{
    console.log(req.url, req.method)    
    const extension = path.extname(req.url)
    let contentType;

    switch(extension){
        case '.css':
        contentType = 'text/css';
        break;
        case '.js':
        contentType = 'text/javascript';
        break;
        case '.jpg':
        contentType = 'image/jpeg';
        break;
        case '.json':
        contentType = 'application/json';
        break;
        case '.png':
        contentType = 'image/png';
        break;
        case '.txt':
        contentType = 'text/plain';
        break;
        default: //when .html or just "./"
        contentType = 'text/html';
    }

    let filePath = 
        contentType ==='text/html' && req.url === '/'
            ? path.join(__dirname,'index.html')
            : contentType ==='text/html' && req.url.slice(-1) === '/'
                ? path.join(__dirname,req.url ,'index.html')
                :contentType ==='text/html'
                    ? path.join(__dirname, req.url)
                    :path.join(__dirname, req.url)
    
     if(!extension && req.url.slice(-1) !== '/') filePath+='.html';

    const fileExists = fs.existsSync(filePath);
    if(fileExists){
            serveFile(filePath, contentType, res)
    }else{
        switch(path.parse(filePath).base){
            case 'page.html':
              res.writeHead(301,{'Location': '/new-page.html'
            });
            res.end()
            break;

         case 'www-page.html':
            res.writeHead(301,{'Location': '/'
          });
          res.end()
          break;
          default: 
            //404
            serveFile(path.join(__dirname,'404.html'), 'text/html', res)

        }
    }
})

server.listen(PORT, ()=> console.log(`server running on ${PORT} port`))