import { moment } from 'meteor/momentjs:moment';
import { Meteor } from 'meteor/meteor';
import { sitemaps } from 'meteor/gadicohen:sitemaps';

sitemaps.add('/sitemap.xml', function(req) {
  let host = Meteor.absoluteUrl();
  if (req && req.headers && req.headers.host) {
    host = `https://${req.headers.host}/`;
  }
  // required: page
  // optional: lastmod, changefreq, priority, xhtmlLinks, images, videos
  return [
    {
      page: `${host}`,
      lastmod: 'Mon Oct 23 2017 16:04:32 GMT-0400 (EDT)',
      images: [
        { loc: `${host}images/Fed2.jpg` }, // Only loc is required
        {
          loc: `${host}images/home/1.jpg`, // Below properties are optional
          caption: 'Melon Gazpacho',
        },
        {
          loc: `${host}images/home/3.jpg`, // Below properties are optional
          caption: 'Chicken w/ Chipotle Pea Puree',
        },
        { loc: `${host}images/soupAndHerbs.jpg` },
      ],
    },
    {
      page: `${host}menu`,
      lastmod: moment().day(0).hour(12).toString(),
      changefreq: 'weekly',
    },
    {
      page: `${host}packs`,
      lastmod: moment().day(0).hour(12).toString(),
      changefreq: 'weekly',
    },
    // https://support.google.com/webmasters/answer/178636?hl=en
    {
      page: `${host}support`,
      lastmod: 'Mon Oct 23 2017 16:04:32 GMT-0400 (EDT)',
    },
    {
      page: `${host}subscribe`,
      lastmod: 'Mon Oct 23 2017 16:04:32 GMT-0400 (EDT)',
    },
    // https://support.google.com/webmasters/answer/2620865?hl=en
    {
      page: `${host}about-us`,
      lastmod: 'Mon Oct 23 2017 16:04:32 GMT-0400 (EDT)',
    },
  ];
});

sitemaps.config('gzip', true);
