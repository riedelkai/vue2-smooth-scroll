"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

// Get the top position of an element in the document
var getTop = function getTop(element, start) {
  // return value of html.getBoundingClientRect().top ... IE : 0, other browsers : -pageYOffset
  if (element.nodeName === "HTML") return -start;
  return element.getBoundingClientRect().top + start;
};

var VueSmoothScroll = {
  install: function install(Vue, config) {
    Vue.directive("smooth-scroll", {
      inserted: function inserted(el, binding) {
        // Do not initialize smoothScroll when running server side, handle it in client
        // We do not want this script to be applied in browsers that do not support those
        // That means no smoothscroll on IE9 and below.
        if (
          (typeof window === "undefined" ? "undefined" : _typeof(window)) !==
            "object" ||
          window.pageYOffset === undefined
        )
          return;
        var defaultValue = {
          duration: 500,
          offset: 0,
          container: window,
          updateHistory: true
        };

        if (config) {
          Object.assign(defaultValue, config);
        }

        // we use requestAnimationFrame to be called by the browser before every repaint
        var requestAnimationFrame =
          window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          function(fn) {
            window.setTimeout(fn, 16);
          };

        var _ref = binding.value || {},
          duration = _ref.duration,
          offset = _ref.offset,
          container = _ref.container,
          updateHistory = _ref.updateHistory;

        duration = duration || defaultValue.duration;
        offset = offset || defaultValue.offset;
        container = container || defaultValue.container;
        updateHistory =
          updateHistory !== undefined
            ? updateHistory
            : defaultValue.updateHistory;

        if (typeof container === "string") {
          container = document.querySelector(container);
        }

        // Attach the smoothscroll function
        el.addEventListener("click", function(ev) {
          ev.preventDefault();
          var scrollTo = document.getElementById(this.hash.substring(1));
          if (!scrollTo) return;

          // Do not scroll to non-existing node
          // Using the history api to solve issue: back doesn't work
          // most browser don't update :target when the history api is used:
          // THIS IS A BUG FROM THE BROWSERS.
          if (
            updateHistory &&
            window.history.pushState &&
            location.hash !== this.hash
          )
            window.history.pushState("", "", this.hash);
          var startPoint = container.scrollTop || window.pageYOffset;

          // Get the top position of an element in the document
          // return value of html.getBoundingClientRect().top ... IE : 0, other browsers : -pageYOffset
          var end = getTop(scrollTo, startPoint);

          // Ajusts offset from the end
          end += offset;
          var clock = Date.now();

          var step = function step() {
            // the time elapsed from the beginning of the scroll
            var elapsed = Date.now() - clock;

            // calculate the scroll position we should be in
            var position = end;

            if (elapsed < duration) {
              position =
                startPoint +
                (end - startPoint) * easeInOutCubic(elapsed / duration);
              requestAnimationFrame(step);
            } else if (updateHistory) {
              // this will cause the :target to be activated.
              location.replace("#" + scrollTo.id);
            }

            container === window
              ? container.scrollTo(0, position)
              : (container.scrollTop = position);
          };

          step();
        });
      }
    });
  }
};

var _default = VueSmoothScroll;

exports.default = _default;

/* istanbul ignore if */
if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(VueSmoothScroll);
}

/**
 * ease in out function
 * @see https://gist.github.com/gre/1650294
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}
