import { VueSSR } from 'meteor/akryum:vue-ssr'
import CreateApp from '/imports/ui/app.js'

VueSSR.createApp = (context) => {
  return new Promise((resolve, reject) => {
    const { app, router } = CreateApp()
    console.log("context = %j", context);

    // Set the url in the router
    router.push(context.url);
    context.meta = app.$meta();

    console.log("before on ready");
    router.onReady(() => {
      console.log("ready");
      console.log("router = %j", router);
      const matchedComponents = router.getMatchedComponents()
      if (!matchedComponents.length) {
        reject({ code: 404 })
      }

      console.log("matchedComponents = %j", matchedComponents);

      resolve({
        app,
        // Inject some arbitrary JS
        appendHtml: () => {
          console.log("about to append html");
          const { title, link, style, script, noscript, meta } = context.meta.inject();

          let textBod = script.text({ body: true });
          console.log("textBod = %j", textBod);
          return {
            head: `
              ${meta.text()}
              ${title.text()}
              ${link.text()}
              ${style.text()}
              ${script.text()}
              ${noscript.text()}
            `,
            // body: `<div id="_vue_root"></div>`
          }
        }
      })
    })
  });
}

VueSSR.outlet = '_vue_root';

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
