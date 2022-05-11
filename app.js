const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");

const port = 3000;
const apiKey = "sorry i don't show this";

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb' }));
app.use(express.static('asset'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


async function completion(prompt) {
    const configuration = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion("text-davinci-002", {
        prompt: "Créez la suite de cexte à partir de cette extrait : \n" + prompt,
        temperature: 0.8,
        max_tokens: 150,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.6,
    });
    return response.data.choices[0].text;
};
async function simplify(prompt) {
    const configuration = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion("text-davinci-002", {
        prompt: "Résumez ce texte pour un élève de CE2 : \n" + prompt,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });
    return response.data.choices[0].text;
}
async function rephrase(prompt) {
    const configuration = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion("text-davinci-002", {
        prompt: "Reformulez le texte suivant : \n" + prompt,
        temperature: 0.8,
        max_tokens: 1000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });
    return response.data.choices[0].text;
}
async function translate(prompt) {
    const configuration = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion("text-davinci-002", {
        prompt: "Traduisez cela en Français : \n" + prompt,
        temperature: 0.3,
        max_tokens: 1000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });
    return response.data.choices[0].text;
}
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.post('/create/:filetoken', (req, res) => {
    const fileToken = req.params.filetoken;
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        fs.writeFileSync(`./file/${token}-${fileToken}.txt`, 'Sans nom|||', (err) => {
            if (err) throw err;
        });
    } else {
        res.send('error - no token');
    }
});
app.post('/linksharetoken', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        let rawdata = fs.readFileSync(`./linksharetoken.json`);
        let linksharedata = JSON.parse(rawdata);
        let shareToken = req.body.shareToken;
        if (linksharedata[token] == undefined) {
            linksharedata[token] = shareToken;
        }
        let newdata = JSON.stringify(linksharedata);
        fs.writeFileSync(`./linksharetoken.json`, newdata);
    } else {
        res.send('error - no token');
    }
});
app.post('/save/:filetoken', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const fileToken = req.params.filetoken;
    const name = req.body.name;
    const content = req.body.content || '';
    if (token) {
        fs.writeFileSync(`./file/${token}-${fileToken}.txt`, name + '|||' + content, (err) => {
            if (err) throw err;
        });
        res.send('ok');
    } else {
        res.send('error - no token');
    }
});
app.get('/get/:filetoken', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const fileToken = req.params.filetoken;
    if (token) {
        fs.readFile(`./file/${token}-${fileToken}.txt`, 'utf8', (err, data) => {
            if (err) throw err;
            res.send(data);
        });
    } else {
        res.send('error - no token');
    }
});
app.post('/upload', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        const file = req.body.file;
        const fileToken = req.body.fileToken;
        const base64Data = new Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        fs.writeFileSync(`./minia/${token}-${fileToken}.png`, base64Data, (err) => {
            if (err) throw err;
        });
        res.send('ok');
    } else {
        res.send('error - no token');
    }
});
app.get('/getminia/:filetoken', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const fileToken = req.params.filetoken;
    if (token) {
        fs.readFile(`./minia/${token}-${fileToken}.png`, (err, data) => {
            if (err) throw err;
            res.send(data);
        });
    } else {
        res.send('error - no token');
    }
});
app.get('/getallfiles', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        fs.readdir('./file', (err, files) => {
            if (err) throw err;
            files = files.filter(file => file.split('-')[0] === token);
            res.send(files);
        });
    } else {
        res.send('error - no token');
    }
});
app.delete('/delete/:filetoken', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const fileToken = req.params.filetoken;
    if (token) {
        fs.unlink(`./file/${token}-${fileToken}.txt`, (err) => {
            if (err) throw err;
        });
        fs.unlink(`./minia/${token}-${fileToken}.png`, (err) => {
            if (err) throw err;
        });
    } else {
        res.send('error - no token');
    }
});
app.post('/completion', async(req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        let response = await completion(req.body.content);
        res.send(response);
    } else {
        res.send('error - no token');
    }
});
app.post('/simplify', async(req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        let response = await simplify(req.body.content);
        res.send(response);
    } else {
        res.send('error - no token');
    }
});
app.post('/rephrase', async(req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        let response = await rephrase(req.body.content);
        res.send(response);
    } else {
        res.send('error - no token');
    }
});
app.post('/translate', async(req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        let response = await translate(req.body.content);
        res.send(response);
    } else {
        res.send('error - no token');
    }
});
app.listen(port, () => console.log(`[D O C O P I L O T] listening on port ${port}!`));