import { observeCssSelector } from "./node_modules/xtal-latx/observeCssSelector.js";
import { define } from "./node_modules/xtal-latx/define.js";
import { debounce } from "./node_modules/xtal-latx/debounce.js"; //const p_d_on = 'p-d-on';

var p_d_rules = 'p-d-rules';
var p_d = 'data-pd';
var pass_to = 'pass-to';
var pass_to_next = 'pass-to-next';
var and_to = 'and-to';
var and_to_next = 'and-to-next';
export var PassDown =
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
      var _this = this;

      this.style.display = 'none';
      this._conn = true;
      this.onPropsChange();
      this._syncRangedb = debounce(function (srp) {
        return _this.syncRange(srp);
      }, 50);
    }
  }, {
    key: "insertListener",
    value: function insertListener(e) {
      var _this2 = this;

      if (e.animationName === PassDown.is) {
        var region = e.target;
        setTimeout(function () {
          _this2.getTargets(region, true);
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
      var _this3 = this;

      Array.from(srp.region.children).forEach(function (child) {
        var ds = child.dataset;

        if (ds && ds.on) {
          var aRules = child[p_d_rules]; //allRules

          for (var rk in aRules) {
            var eRules = aRules[rk];
            eRules.forEach(function (r) {
              if (srp.r && !r.recursive) return;

              if (r.lastEvent) {
                _this3._hndEv(r.lastEvent);
              }
            });
          }
        }
      });
    }
  }, {
    key: "getTargets",
    value: function getTargets(region, init) {
      var _this4 = this;

      //region.__region = region.getAttribute(p_d)!;
      Array.from(region.children).forEach(function (child) {
        var ds = child.dataset;

        if (ds && ds.on && !child[p_d_rules]) {
          _this4.parse(child);
        }
      });

      if (init) {
        setTimeout(function () {
          return _this4.addMutObs(region);
        }, 50);
      }
    }
  }, {
    key: "parse",
    value: function parse(target) {
      var _this5 = this;

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
                var lhsRHS = _this5.toLHSRHS(token);

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

                var rhs = _this5.parseBr(lhsRHS.rhs);

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
                  var lR = _this5.toLHSRHS(val);

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
      var _this6 = this;

      var obs = new MutationObserver(function (m) {
        var top = region;
        var hasP = false; //debounce(() => this.getTargets(region, false), 50);

        _this6._syncRangedb({
          region: region,
          r: false
        });

        while (top.dataset.pd === '-r') {
          hasP = true;
          top = top.parentElement;
        } //if(hasP) debounce(() => this.syncRange(top), 50);


        if (hasP && top !== region) _this6._syncRangedb({
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
      var _this7 = this;

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

        _this7.passDown({
          start: ct.nextElementSibling,
          e: e,
          rule: rule,
          topEl: ct
        });
      });
    } // passDown(start: HTMLElement, e: Event, rule: IEventRule, count: number, topEl: IPDTarget, mutEl: IPDTarget | null) {

  }, {
    key: "passDown",
    value: function passDown(p) {
      var _this8 = this;

      var nextSib = p.start;

      while (nextSib) {
        if (nextSib.tagName !== 'SCRIPT') {
          p.rule.map.forEach(function (map) {
            if (map.max > 0 && map.count >= map.max) return;

            if (map.isNext || nextSib.matches && nextSib.matches(map.cssSelector)) {
              map.count++;

              _this8.setVal(p.e, nextSib, map);
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

                  _this8.passDown(cl);
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
      var _this9 = this;

      map.setProps.forEach(function (setProp) {
        var propFromEvent = _this9.getPropFromPath(e, setProp.propSource);

        _this9.commit(target, setProp.propTarget, propFromEvent);
      });
    }
  }, {
    key: "commit",
    value: function commit(target, key, val) {
      var s = key.split('.');

      if (s.length === 1) {
        target[key] = val;
        return;
      }

      var key2 = s.pop();
      var target2 = target;
      var isNew = false;

      switch (key2) {
        case 'new()':
          isNew = true;
          key2 = s.pop();
          break;
      }

      var r = s.reverse();
      var tk = r.pop();
      var f = tk;

      while (tk !== undefined) {
        if (!target2[tk]) {
          target2[tk] = {};
        }

        target2 = target2[tk];
        tk = r.pop();
      }

      target2[key2] = val;

      if (isNew) {
        target[f] = Object.assign({}, target[f]);
      }
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
define(PassDown); //# sourceMappingURL=pass-down.js.map