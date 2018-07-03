import { mainRoutes } from '/imports/ui/routes.js';

var seoPicker = Picker.filter(function(req, res) {
  var isCrawler = [];
  var string = req.headers['user-agent'];
  isCrawler.push(/_escaped_fragment_/.test(req.url));
  if(string){
      isCrawler.push(string.indexOf('facebookexternalhit') >= 0);
      isCrawler.push(string.indexOf('Slack') >= 0);
      isCrawler.push(string.indexOf('Twitterbot') >= 0);
  }
  return isCrawler.indexOf(true) >= 0;
});

// mainRoutes.map(({route, name, layout, template}) => {
//   console.log("route = %j", route);
//   Picker.route(route, (params, req, res) => {
//     console.log("start route", route);
//     console.log("layout", layout);
//     console.log("template", template);
//     console.log("params", params);
//     const html = SSR.render(layout, {template, data: { id: params.id}});
//     console.log("html = %j", html);
//     res.setHeader( 'Content-Type', 'text/html; charset=utf-8' );
//     res.end(html);
//   })
// });
