/*eslint-env browser*/
'use strict';

(function() {
    var PROFALUX_PRESSION_DURATION = 500;
    var PROFALUX_VALID_ACTIONS = ['up', 'down', 'stop'];

    var Profalux = (function() {
        var _isPressingAllowed = true;
        var _pressIndicator;

        function disablePressing() {
            _isPressingAllowed = false;
            _pressIndicator.classList.add('on');
        }

        function enablePressing() {
            setTimeout(function() {
                _isPressingAllowed = true;
                _pressIndicator.classList.remove('on');
            }, PROFALUX_PRESSION_DURATION);
        }
        
        var press = function (action) {
            if (!_isPressingAllowed || PROFALUX_VALID_ACTIONS.indexOf(action.toLowerCase()) === -1) {
                return;
            }

            disablePressing();

            var xhr = new XMLHttpRequest();
            xhr.open('PUT', '/shutter/' + action.toLowerCase().replace(/.*/, function(action) {
                return action === 'stop' ? action : 'set/' + { down: 0, up: 100 }[action];
            }), true);
            xhr.send();

            enablePressing();
        };

        return {
            init: function (options) {
                _pressIndicator = document.querySelector(options.indicator);

                // Disable elastic scroll in mobile devices
                document.addEventListener('touchmove', function(event) {
                    event.preventDefault();
                });
            },
            press: press
        };
    })();

    window.Profalux = Profalux;
})();
