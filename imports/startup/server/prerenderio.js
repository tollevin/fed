// import prerender from 'prerender-node';

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
  const prerenderio = Npm.require('prerender-node');
  //     const settings = Meteor.settings.PrerenderIO;

  //     if (settings && settings.token && settings.host) {
  prerenderio.set('prerenderToken', 'Ew27iYLQaGXbOOKSJIOy');
  //         prerenderio.set('host', settings.host);
  //         prerenderio.set('protocol', 'https');
  WebApp.rawConnectHandlers.use(prerenderio);
//     }
});

// process.env.PrerenderIO.prerenderServiceUrl = "http://localhost:3000/";
// prerenderIO.set('prerenderServiceUrl', 'http://localhost:3000/');
// prerenderIO.set('prerenderToken', 'Ew27iYLQaGXbOOKSJIOy');

// app.use(require('prerender-node').set('prerenderToken', 'Ew27iYLQaGXbOOKSJIOy'));
