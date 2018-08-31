import { $ } from 'meteor/jquery';

export const addTriggers = (FlowRouter) => {
  const triggers = {
    // we need to keep two paths and we are interested
    // we need to check the first path to do our validations
    _previousPaths: [null, null],
    jumpToPrevScrollPosition({ path }) {
      let scrollPos = 0;
      const prevPathInfo = this._previousPaths[0];
      if (prevPathInfo && prevPathInfo.path === path) {
        scrollPos = prevPathInfo.scrollPosition;
      }

      if (scrollPos === 0) {
        // scroll is right away since we don't need to wait for rendering
        $('body').animate({ scrollTop: scrollPos }, 0);
      } else {
        // now we need to wait a bit for react/meteor does rendering
        // We assume, there's subs-manager and we've previous page's data
        // here 10 millis delay is an arbitrary value with some testing.
        setTimeout(function () {
          $('body').animate({ scrollTop: scrollPos }, 0);
        }, 10);
      }
    },
    saveScrollPosition({ path }) {
      const pathInfo = {
        path,
        scrollPosition: $('body').scrollTop(),
      };

      // add a new path and remove a one from the top
      this._previousPaths.push(pathInfo);
      this._previousPaths.shift();
    },
  };

  Object.keys(triggers)
    .forEach((key) => {
      if (typeof triggers[key] === 'function') {
        triggers[key] = triggers[key].bind(triggers);
      }
    });

  FlowRouter.triggers.exit([triggers.saveScrollPosition]);
  FlowRouter.triggers.enter([triggers.jumpToPrevScrollPosition]);
};
