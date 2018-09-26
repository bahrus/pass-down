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
        return s.split('{').map(function (t) {
          return t.endsWith('}') ? t.substr(0, t.length - 1) : t;
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
                if (token.startsWith('if(')) {
                  console.log('TODO');
                } else {
                  var lhsRHS = _this4.toLHSRHS(token);

                  var lhs = lhsRHS.lhs;

                  switch (lhs) {
                    case pass_to:
                    case pass_to_next:
                      rule.map = [];
                      break;
                  }

                  var cssProp = {};
                  rule.map.push(cssProp); //let toNext = false;

                  switch (lhs) {
                    case pass_to_next:
                    case and_to_next:
                      cssProp.max = 1;
                      cssProp.isNext = true;
                      break;
                  }

                  var rhs = _this4.parseBr(lhsRHS.rhs);

                  var vals;

                  if (!cssProp.isNext) {
                    cssProp.max = parseInt(rhs[2]);
                    vals = rhs[1];
                    cssProp.cssSelector = rhs[0];
                  } else {
                    vals = rhs[1];
                  }

                  cssProp.setProps = [];
                  vals.split(';').forEach(function (val) {
                    var lR = _this4.toLHSRHS(val);

                    cssProp.setProps.push({
                      propSource: lR.rhs,
                      propTarget: lR.lhs
                    });
                  });
                }

            }
          }
        });
        setTimeout(function () {
          return _this4.initTarget(target, rules);
        }, 50);
      }
    }, {
      key: "initTarget",
      value: function initTarget(target, rules) {
        console.log({
          target: target,
          rules: rules
        });
        this.attchEvListnrs(target, rules);
      }
    }, {
      key: "attchEvListnrs",
      value: function attchEvListnrs(target, rules) {
        var _this5 = this;

        var _loop = function _loop(key) {
          var rule = rules[key];
          target.addEventListener(key, function (e) {
            _this5._hndEv(key, e, rule, target);
          });

          if (!rule.skipInit) {
            var fakeEvent = {
              isFake: true,
              detail: target.value,
              target: target
            };

            _this5._hndEv(key, fakeEvent, rule, target);
          }
        };

        for (var key in rules) {
          _loop(key);
        }

        target.removeAttribute('disabled');
      }
    }, {
      key: "_hndEv",
      value: function _hndEv(key, e, rule, target) {
        //if(this.hasAttribute('debug')) debugger;
        //if(!e) return;
        //if(e.stopPropagation && !this._noblock) e.stopPropagation();
        if (rule.if && !e.target.matches(rule.if)) return;
        rule.lastEvent = e;
        this.passDown(target.nextElementSibling, e, rule, 0);
      }
    }, {
      key: "passDown",
      value: function passDown(start, e, rule, count) {
        var _this6 = this;

        var nextSib = start;

        while (nextSib) {
          if (nextSib.tagName !== 'SCRIPT') {
            rule.map.forEach(function (map) {
              if (map.isNext || nextSib.matches && nextSib.matches(map.cssSelector)) {
                count++;

                _this6.setVal(e, nextSib, map);
              }

              var fec = nextSib.firstElementChild; // if (this.id && fec && nextSib!.hasAttribute(p_d_if)) {
              //     //if(!nextSibling[PDIf]) nextSibling[PDIf] = JSON.parse(nextSibling.getAttribute(p_d_if));
              //     if (this.matches(nextSib!.getAttribute(p_d_if) as string)) {
              //         this.passDown(fec, e, count);
              //         let addedSMOTracker = (<any>nextSib)[_addedSMO];
              //         if (!addedSMOTracker) addedSMOTracker = (<any>nextSib)[_addedSMO] = {};
              //         if (!addedSMOTracker[this.id]) {
              //             if (nextSib !== null) this.addMutObs(nextSib, true);
              //             (<any>nextSib)[_addedSMO][this.id] = true;
              //         }
              //     }
              // }
            });
          } //if (rule. && count >= this._m) break;


          nextSib = nextSib.nextElementSibling;
        }
      }
    }, {
      key: "setVal",
      value: function setVal(e, target, map) {
        var _this7 = this;

        map.setProps.forEach(function (setProp) {
          var propFromEvent = _this7.getPropFromPath(e, setProp.propSource);

          _this7.commit(target, setProp.propTarget, propFromEvent);
        }); //const gpfp = this.getPropFromPath.bind(this);
        //const propFromEvent = map.propSource ? gpfp(e, map.propSource) : gpfp(e, 'detail.value') || gpfp(e, 'target.value');
      }
    }, {
      key: "commit",
      value: function commit(target, key, val) {
        target[key] = val;
      }
    }, {
      key: "getPropFromPath",
      value: function getPropFromPath(val, path) {
        if (!path || path === '.') return val;
        return this.getProp(val, path.split('.'));
      }
    }, {
      key: "getProp",
      value: function getProp(val, pathTokens) {
        var context = val;
        var firstToken = true;
        var cp = 'composedPath';
        var cp_ = cp + '_';
        pathTokens.forEach(function (token) {
          if (context) {
            if (firstToken && context[cp]) {
              firstToken = false;
              var cpath = token.split(cp_);

              if (cpath.length === 1) {
                context = context[cpath[0]];
              } else {
                context = context[cp]()[parseInt(cpath[1])];
              }
            } else {
              context = context[token];
            }
          }
        });
        return context;
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