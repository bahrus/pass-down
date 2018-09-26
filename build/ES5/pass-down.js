import { observeCssSelector } from "./node_modules/xtal-latx/observeCssSelector.js";
import { define } from "./node_modules/xtal-latx/define.js";
var p_d_on = 'p-d-on';
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
      this.style.display = 'none';
      this._conn = true;
      this.onPropsChange();
    }
  }, {
    key: "insertListener",
    value: function insertListener(e) {
      var _this = this;

      if (e.animationName === PassDown.is) {
        var target = e.target;
        setTimeout(function () {
          _this.parse(target); //this.registerScript(target);

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
      var _this2 = this;

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
              var lhsRHS = _this2.toLHSRHS(token);

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
define(PassDown); //# sourceMappingURL=pass-down.js.map