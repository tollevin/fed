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

seoPicker.route('/blog/:postid', function(params, req, res){
    var post = Posts.findOne({_id:params.postid});
    var html = SSR.render('seoLayout',{
        template:'blogpost',
        data: {post:post}
    });
    res.end(html);
});