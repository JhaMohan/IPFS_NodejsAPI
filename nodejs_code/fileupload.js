const express = require("express");
const app = express();
const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient( {host:'45.79.123.103',port:'5001', protocol: 'http' });
const expFileUpload = require("express-fileupload");
const fs = require('fs');
app.use(expFileUpload());
app.use(express.json());


app.post("/upload", (req, res) => {

    let fileObj = {};
    
    if (req.files.inputFile) {
        let file = req.files.inputFile;
        const fileName = file.name;
        const filePath = __dirname + "/files/" + fileName;
       
        file.mv(filePath, async (err) => {
            if (err) {
                console.log("Error: failed to download file.");
                return res.status(500).send(err);
            }
            const fileHash = await addFile(fileName, filePath);

            fs.unlink(filePath,(err)=>{

                    if(err) {
                        console.log("Not able to delete file");
                    }

            })

            fileObj = {
                file: "http://45.79.123.103:8080/ipfs/" + fileHash,
                name: fileName,
                hash: fileHash
            };
            res.status(200).send({fileObj});
            
        });
    }
});


const addFile = async (fileName, filePath) => {
    const file = fs.readFileSync(filePath);
    const filesAdded = await ipfs.add({ path: fileName, content: file });
    console.log(filesAdded);
    const fileHash = filesAdded.cid.string;

    return fileHash;
};

const port = process.env.PORT || 8000;
app.listen(port,() => console.log(`listing to ${port} port`))