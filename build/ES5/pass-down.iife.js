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

  var debounce = function debounce(fn, time) {
    var timeout;
    return function () {
      var _this3 = this,
          _arguments = arguments;

      var functionCall = function functionCall() {
        return fn.apply(_this3, _arguments);
      };

      clearTimeout(timeout);
      timeout = setTimeout(functionCall, time);
    };
  }; //const p_d_on = 'p-d-on';


  var p_d_rules = 'p-d-rules';
  var p_d = 'data-pd';
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
        var _this4 = this;

        this.style.display = 'none';
        this._conn = true;
        this.onPropsChange();
        this._syncRangedb = debounce(function (srp) {
          return _this4.syncRange(srp);
        }, 50);
      }
    }, {
      key: "insertListener",
      value: function insertListener(e) {
        var _this5 = this;

        if (e.animationName === PassDown.is) {
          var region = e.target;
          setTimeout(function () {
            _this5.getTargets(region, true);
          }, 0);
        }
      }
    }, {
      key: "onPropsChange",
      value: function onPropsChange() {
        if (!this._conn) return;
        this.addCSSListener(PassDown.is, "[".concat(p_d, "]"), this.insertListener);
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
      key: "syncRange",
      value: function syncRange(srp) {
        var _this6 = this;

        Array.from(srp.region.children).forEach(function (child) {
          var ds = child.dataset;

          if (ds && ds.on) {
            var aRules = child[p_d_rules]; //allRules

            for (var rk in aRules) {
              var eRules = aRules[rk];
              eRules.forEach(function (r) {
                if (srp.r && !r.recursive) return;

                if (r.lastEvent) {
                  _this6._hndEv(r.lastEvent);
                }
              });
            }
          }
        });
      }
    }, {
      key: "getTargets",
      value: function getTargets(region, init) {
        var _this7 = this;

        //region.__region = region.getAttribute(p_d)!;
        Array.from(region.children).forEach(function (child) {
          var ds = child.dataset;

          if (ds && ds.on && !child[p_d_rules]) {
            _this7.parse(child);
          }
        });

        if (init) {
          setTimeout(function () {
            return _this7.addMutObs(region);
          }, 50);
        }
      }
    }, {
      key: "parse",
      value: function parse(target) {
        var _this8 = this;

        var on = target.dataset.on.split(' ');
        var rules = {};
        var rule;
        on.forEach(function (tkn) {
          var token = tkn.trim();
          if (token === '') return;

          if (token.endsWith(':')) {
            var evtName = token.substr(0, token.length - 1);
            if (!rules[evtName]) rules[evtName] = [];
            rule = {};
            rules[evtName].push(rule);
          } else {
            switch (token) {
              case 'skip-init':
                rule.skipInit = true;
                break;

              case 'recursive':
                rule.recursive = true;
                break;

              default:
                if (token.startsWith('if(')) {
                  rule.if = token.substring(3, token.length - 1);
                } else {
                  var lhsRHS = _this8.toLHSRHS(token);

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

                  var rhs = _this8.parseBr(lhsRHS.rhs);

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
                    var lR = _this8.toLHSRHS(val);

                    cssProp.setProps.push({
                      propSource: lR.rhs,
                      propTarget: lR.lhs
                    });
                  });
                }

            }
          }
        });
        target[p_d_rules] = rules;
        this.initTarget(target);
      }
    }, {
      key: "initTarget",
      value: function initTarget(target) {
        this.attchEvListnrs(target); //this.addMutObs(target);
      }
    }, {
      key: "addMutObs",
      value: function addMutObs(region) {
        var _this9 = this;

        var obs = new MutationObserver(function (m) {
          var top = region;
          var hasP = false; //debounce(() => this.getTargets(region, false), 50);

          _this9._syncRangedb({
            region: region,
            r: false
          });

          while (top.dataset.pd === '-r') {
            hasP = true;
            top = top.parentElement;
          } //if(hasP) debounce(() => this.syncRange(top), 50);


          if (hasP && top !== region) _this9._syncRangedb({
            region: top,
            r: true
          });
        });
        obs.observe(region, {
          childList: true
        });
      }
    }, {
      key: "attchEvListnrs",
      value: function attchEvListnrs(target) {
        var aRules = target[p_d_rules];

        var b = this._hndEv.bind(this);

        for (var key in aRules) {
          target.addEventListener(key, b);
          var eRules = aRules[key];
          if (eRules.findIndex(function (rule) {
            return rule.skipInit;
          }) > -1) continue;
          var fakeEvent = {
            type: key,
            isFake: true,
            detail: {
              value: target.value
            },
            target: target
          };

          this._hndEv(fakeEvent);
        }

        target.removeAttribute('disabled');
      }
    }, {
      key: "_hndEv",
      value: function _hndEv(e) {
        var _this10 = this;

        var ct = e.currentTarget || e.target;
        var eRules = ct[p_d_rules][e.type];
        eRules.forEach(function (rule) {
          if (rule.if && !e.target.matches(rule.if)) return;
          rule.lastEvent = e; // if(rule.recursive){
          //     eRules.stack = [];
          // }

          rule.map.forEach(function (v) {
            v.count = 0;
          }); //this.passDown(ct, e, rule, 0, ct, null);

          _this10.passDown({
            start: ct,
            e: e,
            rule: rule,
            topEl: ct
          });
        });
      } // passDown(start: HTMLElement, e: Event, rule: IEventRule, count: number, topEl: IPDTarget, mutEl: IPDTarget | null) {

    }, {
      key: "passDown",
      value: function passDown(p) {
        var _this11 = this;

        var nextSib = p.start;

        while (nextSib) {
          if (nextSib.tagName !== 'SCRIPT') {
            p.rule.map.forEach(function (map) {
              if (map.max > 0 && map.count > map.max) return;

              if (map.isNext || nextSib.matches && nextSib.matches(map.cssSelector)) {
                map.count++;

                _this11.setVal(p.e, nextSib, map);
              }

              if (p.rule.recursive) {
                var fec = nextSib.firstElementChild;
                var isPD = nextSib.hasAttribute(p_d);

                if (isPD) {
                  // (<IPDTarget>nextSib).__topEl = p.topEl; 
                  if (fec) {
                    nextSib.dataset.pd = '-r';
                    var cl = Object.assign({}, p);
                    cl.start = fec;

                    _this11.passDown(cl);
                  }
                }
              }
            });
          }

          nextSib = nextSib.nextElementSibling;
        }
      }
    }, {
      key: "setVal",
      value: function setVal(e, target, map) {
        var _this12 = this;

        map.setProps.forEach(function (setProp) {
          var propFromEvent = _this12.getPropFromPath(e, setProp.propSource);

          _this12.commit(target, setProp.propTarget, propFromEvent);
        });
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
        pathTokens.forEach(function (token) {
          if (context) context = context[token];
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