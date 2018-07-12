import prerenderIO from 'prerender-node';
// var settings = Meteor.settings.PrerenderIO;

// Meteor.startup(() => {

//     // const settings = Meteor.settings.PrerenderIO;

//     // if (settings && settings.token && settings.host) {
//     prerender.set('prerenderToken', 'Ew27iYLQaGXbOOKSJIOy');
//     // prerenderIO.set('prerenderServiceUrl', 'http://localhost:3000/');
//     prerender.set('host', 'www.getfednyc.com');
//     prerender.set('protocol', 'https');
//     WebApp.rawConnectHandlers.use(prerender);
//     // }
// });

Meteor.startup(() => {
  // if (!__meteor_runtime_config__.ROOT_URL.match(/www|stg|app/)) return;
  // prerenderIO.set('prerenderToken', settings.token);
  console.log("prerender setup");
  prerenderIO.set('prerenderToken', 'Ew27iYLQaGXbOOKSJIOy');
  prerenderIO.crawlerUserAgents = ["Mozilla"];

  prerenderIO.set('beforeRender', function(req, done) {
    console.log('\nprerender before', req.headers, '\n\n');
    done();
  });
  prerenderIO.set('afterRender', function afterRender(err, req, prerender_res) {
    if (err) {
      console.log('prerenderio error', err); 
      return;
    }
    console.log('prerender after', req.url, '\nheaders:', req.headers, '\nres complete:', prerender_res.complete, prerender_res.statusCode, prerender_res.statusMessage , '\nres headers:', prerender_res.headers, '\nres body', prerender_res);
  });

  
  // console.log('\nprerender service:', settings);

  
  WebApp.rawConnectHandlers.use(prerenderIO);

});

// process.env.PrerenderIO.prerenderServiceUrl = "http://localhost:3000/";
// prerenderIO.set('prerenderServiceUrl', 'http://localhost:3000/');
// prerenderIO.set('prerenderToken', 'Ew27iYLQaGXbOOKSJIOy');

// app.use(require('prerender-node').set('prerenderToken', 'Ew27iYLQaGXbOOKSJIOy'));