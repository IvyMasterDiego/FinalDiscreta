import express from 'express';
const app = express();
const PORT = Number(process.env.PORT) || 5000;
app.set('view engine', 'ejs');
app.get('/', (req, res)=>{
    // req.headers['content-type'] = 'text/javascript';
    res.render('game');
});
app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
});
