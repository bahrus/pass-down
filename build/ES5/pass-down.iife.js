//@ts-check
(function () {
  function define(custEl) {
    var tagName = custEl.is;

    if (customElements.get(tagName)) {
      console.warn('Already registered ' + tagName);
      return;
    }

    customElements.define(tagName, custEl);
  }

  function getHost(el) {
    var parent = el;

    while (parent = parent.parentNode) {
      if (parent.nodeType === 11) {
        return parent['host'];
      } else if (parent.tagName === 'BODY') {
        return null;
      }
    }

    return null;
  }

  function observeCssSelector(superClass) {
    var eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];
    return (
      /*#__PURE__*/
      function (_superClass) {
        babelHelpers.inherits(_class, _superClass);

        function _class() {
          babelHelpers.classCallCheck(this, _class);
          return babelHelpers.possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        babelHelpers.createClass(_class, [{
          key: "addCSSListener",
          value: function addCSSListener(id, targetSelector, insertListener) {
            var _this = this;

            // See https://davidwalsh.name/detect-node-insertion
            if (this._boundInsertListener) return;
            var styleInner =
            /* css */
            "\n            @keyframes ".concat(id, " {\n                from {\n                    opacity: 0.99;\n                }\n                to {\n                    opacity: 1;\n                }\n            }\n    \n            ").concat(targetSelector, "{\n                animation-duration: 0.001s;\n                animation-name: ").concat(id, ";\n            }\n            ");
            var style = document.createElement('style');
            style.innerHTML = styleInner;
            var host = getHost(this);

            if (host !== null) {
              host.shadowRoot.appendChild(style);
            } else {
              document.body.appendChild(style);
            }

            this._boundInsertListener = insertListener.bind(this);
            var container = host ? host.shadowRoot : document;
            eventNames.forEach(function (name) {
              container.addEventListener(name, _this._boundInsertListener, false);
            }); // container.addEventListener("animationstart", this._boundInsertListener, false); // standard + firefox
            // container.addEventListener("MSAnimationStart", this._boundInsertListener, false); // IE
            // container.addEventListener("webkitAnimationStart", this._boundInsertListener, false); // Chrome + Safari
          }
        }, {
          key: "disconnectedCallback",
          value: function disconnectedCallback() {
            var _this2 = this;

            if (this._boundInsertListener) {
              var host = getHost(this);
              var container = host ? host.shadowRoot : document;
              eventNames.forEach(function (name) {
                container.removeEventListener(name, _this2._boundInsertListener);
              }); // document.removeEventListener("animationstart", this._boundInsertListener); // standard + firefox
              // document.removeEventListener("MSAnimationStart", this._boundInsertListener); // IE
              // document.removeEventListener("webkitAnimationStart", this._boundInsertListener); // Chrome + Safari
            }

            if (babelHelpers.get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), "disconnectedCallback", this) !== undefined) babelHelpers.get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), "disconnectedCallback", this).call(this);
          }
        }]);
        return _class;
      }(superClass)
    );
  }

  var p_d_on = 'p-d-on';
  var pass_to = 'pass-to';
  var pass_to_next = 'pass-to-next';
  var and_to = 'and-to';
  var and_to_next = 'and-to-next';

  var PassDown =
  /*#__PURE__*/
  function (_observeCssSelector) {
    babelHelpers.inherits(PassDown, _observeCssSelector);

    function PassDown() {
      babelHelpers.classCallCheck(this, PassDown);
      return babelHelpers.possibleConstructorReturn(this, (PassDown.__proto__ || Object.getPrototypeOf(PassDown)).apply(this, arguments));
    }

    babelHelpers.createClass(PassDown, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        this.style.display = 'none';
        this._conn = true;
        this.onPropsChange();
      }
    }, {
      key: "insertListener",
      value: function insertListener(e) {
        var _this3 = this;

        if (e.animationName === PassDown.is) {
          var target = e.target;
          setTimeout(function () {
            _this3.parse(target); //this.registerScript(target);

          }, 0);
        }
      }
    }, {
      key: "onPropsChange",
      value: function onPropsChange() {
        if (!this._conn) return;
        this.addCSSListener(PassDown.is, '[data-on]', this.insertListener);
      }
    }, {
      key: "toLHSRHS",
      value: function toLHSRHS(s) {
        var pos = s.indexOf(':');
        return {
          lhs: s.substr(0, pos),
          rhs: s.substr(pos + 1)
        };
      }
    }, {
      key: "parseBr",
      value: function parseBr(s) {
        return s.split('}').map(function (t) {
          return t.substr(1);
        });
      }
    }, {
      key: "parse",
      value: function parse(target) {
        var _this4 = this;

        console.log(target);
        var on = target.dataset.on.split(' ');
        var rules = {};
        var rule;
        on.forEach(function (tkn) {
          var token = tkn.trim();
          if (token === '') return;

          if (token.endsWith(':')) {
            rule = {};
            rules[token.substr(0, token.length - 1)] = rule;
          } else {
            switch (token) {
              case 'skip-init':
                rule.skipInit = true;
                break;

              default:
                var lhsRHS = _this4.toLHSRHS(token);

                var lhs = lhsRHS.lhs;

                switch (lhs) {
                  case pass_to:
                  case pass_to_next:
                    rule.map = [];
                    break;
                }

                var cssProp = {};
                rule.map.push(cssProp);

                switch (lhs) {
                  case pass_to_next:
                  case and_to_next:
                    cssProp.max = 1;
                    break;
                }

            }
          }
        });
      }
    }], [{
      key: "is",
      get: function get() {
        return 'pass-down';
      }
    }]);
    return PassDown;
  }(observeCssSelector(HTMLElement));

  define(PassDown);
})();