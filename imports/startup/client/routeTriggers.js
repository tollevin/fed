import { $ } from 'meteor/jquery';

export const addTriggers = (FlowRouter) => {
  const previousPaths = [null, null];

  const saveScrollPosition = ({ path }) => {
    const pathInfo = {
      path,
      scrollPosition: $('body').scrollTop(),
    };

    // add a new path and remove the first path
    // using as a queue
    previousPaths.push(pathInfo);
    previousPaths.shift();
  };

  const jumpToPrevScrollPosition = ({ path }) => {
    let sPos = 0;
    const prevPathInfo = previousPaths[0];
    if (prevPathInfo && prevPathInfo.path === path) {
      sPos = prevPathInfo.scrollPosition;
    }

    if (sPos === 0) {
      // we can scroll right away since we don't need to wait for rendering
      $('body').animate({ scrollTop: sPos }, 0);
      return;
    }

    // Now we need to wait a bit for blaze/react does rendering.
    // We assume, there's subs-manager and we've previous page's data.
    // Here 10 millis deley is a arbitary value with some testing.
    setTimeout(function () {
      $('body').animate({ scrollTop: sPos }, 0);
    }, 10);
  };

  FlowRouter.triggers.exit([saveScrollPosition]);
  FlowRouter.triggers.enter([jumpToPrevScrollPosition]);
};
