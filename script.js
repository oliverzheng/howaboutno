function getSize($node) {
  return {
    height: $node.height(),
    width: $node.width(),
  };
}

var CENTER_THRESHOLD = 100; // pixels
var AREA_THRESHOLD = 0.4; // %

function isBullshit($node, windowSize) {
  if ($node.css('position') !== 'fixed') {
    return false;
  }

  // Is it even visible?
  if ($node.css('display') === 'none' ||
      $node.css('visibility') === 'hidden') {
    return false;
  }

  // Did we whitelist this?
  if ($node.data('isNotBullshit')) {
    return false;
  }

  var size = getSize($node);
  var position = $node.position();

  // If the element is approximately horizontally and vertically centered, it's
  // probably obscuring content.
  var horizCenter = position.left + size.width / 2;
  var vertCenter = position.top + size.height / 2;

  var isHorizCentered =
    Math.abs((windowSize.width / 2) - horizCenter) < CENTER_THRESHOLD;
  var isVertCentered =
    Math.abs((windowSize.height / 2) - vertCenter) < CENTER_THRESHOLD;

  if (isHorizCentered && isVertCentered) {
    return true;
  }

  // If the element is big enough to take up a large area, then it's probalby
  // obscuring content.
  var horizArea = size.width / windowSize.width;
  var vertArea = size.height / windowSize.height;
  // It's only annoying if the area is big enough in the opposite direction that
  // it's centered. Counterexample: a fixed horizontal menu at the top that's
  // 100% wide.
  if (isHorizCentered && vertArea > AREA_THRESHOLD ||
      isVertCentered && horizArea > AREA_THRESHOLD) {
    return true;
  }

  return false;
}

// DOM changes that originate from the following events are probably user
// generated.
var WHITELISTED_EVENTS = [
  'click',
];

function getBullshit() {
  var windowSize = getSize($(window));
  return $('*').filter(function() {
    return isBullshit($(this), windowSize);
  });
}

function whitelistBullshit() {
  getBullshit().data('isNotBullshit', true);
}

function hideBullshit() {
  getBullshit().hide();//.data('hiddenBullshit', true);
}

// Setup

WHITELISTED_EVENTS.forEach(function(eventName) {
  document.body.addEventListener(eventName, function(event) {
    // The capture event is definitely fired (the bubble event can be cancelled
    // by the page). If this callstack modifies the DOM, we'll whitelist the
    // changes made here.
    setTimeout(whitelistBullshit, 0);
  }, true /* capture */);
});

hideBullshit();
setInterval(hideBullshit, 1000);
