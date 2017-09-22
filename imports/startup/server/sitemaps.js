sitemaps.add('/sitemap.xml', function() {
  // required: page
  // optional: lastmod, changefreq, priority, xhtmlLinks, images, videos
  return [
    { page: '/', lastmod: "Thu Oct 06 2016 16:04:32 GMT-0400 (EDT)" },
    { page: '/menu', lastmod: "Thu Oct 06 2016 16:04:32 GMT-0400 (EDT)", changefreq: 'weekly' },
    { page: '/z', lastmod: new Date().getTime(), changefreq: 'monthly', priority: 0.8 },
    // https://support.google.com/webmasters/answer/178636?hl=en
    { page: '/pageWithVideoAndImages',
      images: [
        { loc: '/myImg.jpg', },        // Only loc is required
        { loc: '/myOtherImg.jpg',      // Below properties are optional
          caption: "..", geo_location: "..", title: "..", license: ".."}
      ],
      videos: [
        { loc: '/myVideo.jpg', },      // Only loc is required
        { loc: '/myOtherVideo.jpg',    // Below properties are optional
          thumbnail_loc: "..", title: "..", description: ".." etc }
      ]
    },
    // https://support.google.com/webmasters/answer/2620865?hl=en
    { page: 'lang/english', xhtmlLinks: [
      { rel: 'alternate', hreflang: 'de', href: '/lang/deutsch' },
      { rel: 'alternate', hreflang: 'de-ch', href: '/lang/schweiz-deutsch' },
      { rel: 'alternate', hreflang: 'en', href: '/lang/english' }
    ]}
  ];
});