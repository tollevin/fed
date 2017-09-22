import prerenderIO from 'prerender-node';

// process.env.PrerenderIO.prerenderServiceUrl = "http://localhost:3000/";
prerenderIO.set('prerenderServiceUrl', 'http://localhost:3000/');
prerenderIO.set('prerenderToken', 'Ew27iYLQaGXbOOKSJIOy');

// app.use(require('prerender-node').set('prerenderToken', 'Ew27iYLQaGXbOOKSJIOy'));