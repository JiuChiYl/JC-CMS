
import express from 'express';
import { arrayToExpression, searchObj } from './Tools.js';

const app = express();

const port = 3009;

let data = {
    code:200,
    msg:'success',
    t:Date.now(),
    data:{
        result:'关注塔菲喵，关注塔菲谢谢喵！'
    }
}

// app.get('/{*test}', (req, res) => {
//     // data.data.callBackData == '' ? null : req.query;
//     // req.params.test == '' ? null : data.data.callBackData = {[req.params.test]:req.query};

//     data.data.resultList = user[arrayToExpression(req.params.test)];

//     console.log(JSON.stringify(arrayToExpression(req.params.test)));
//     // data.data.resultDatas 

//     res.send(data);
// });

const user = {
    admin: [
        {
            username: 'jiuchiyl',
            uid: '105203394'
        },
        {
            username: 'boluu',
            uid: '194452331'
        },
        {
            username: 'boluu',
            uid: '194452331'
        },
        {
            username: 'jiuchiyl',
            uid: '488888888'
        },
    ]
};

const scbj = searchObj(user);

app.get('/api/{*test}', (req, res) => {
    let responeBody = {};

    responeBody.data = scbj(req.params.test[0], req.query);

    res.send(responeBody);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
