/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getAugmentedNamespace(n) {
  var f = n.default;
	if (typeof f == "function") {
		var a = function () {
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var jsbiUmd = {exports: {}};

(function (module, exports) {
	(function(i,_){module.exports=_();})(commonjsGlobal,function(){var i=Math.imul,_=Math.clz32,t=Math.abs,e=Math.max,g=Math.floor;class o extends Array{constructor(i,_){if(super(i),this.sign=_,i>o.__kMaxLength)throw new RangeError("Maximum BigInt size exceeded")}static BigInt(i){var _=Number.isFinite;if("number"==typeof i){if(0===i)return o.__zero();if(o.__isOneDigitInt(i))return 0>i?o.__oneDigit(-i,!0):o.__oneDigit(i,!1);if(!_(i)||g(i)!==i)throw new RangeError("The number "+i+" cannot be converted to BigInt because it is not an integer");return o.__fromDouble(i)}if("string"==typeof i){const _=o.__fromString(i);if(null===_)throw new SyntaxError("Cannot convert "+i+" to a BigInt");return _}if("boolean"==typeof i)return !0===i?o.__oneDigit(1,!1):o.__zero();if("object"==typeof i){if(i.constructor===o)return i;const _=o.__toPrimitive(i);return o.BigInt(_)}throw new TypeError("Cannot convert "+i+" to a BigInt")}toDebugString(){const i=["BigInt["];for(const _ of this)i.push((_?(_>>>0).toString(16):_)+", ");return i.push("]"),i.join("")}toString(i=10){if(2>i||36<i)throw new RangeError("toString() radix argument must be between 2 and 36");return 0===this.length?"0":0==(i&i-1)?o.__toStringBasePowerOfTwo(this,i):o.__toStringGeneric(this,i,!1)}static toNumber(i){const _=i.length;if(0===_)return 0;if(1===_){const _=i.__unsignedDigit(0);return i.sign?-_:_}const t=i.__digit(_-1),e=o.__clz30(t),n=30*_-e;if(1024<n)return i.sign?-Infinity:1/0;let g=n-1,s=t,l=_-1;const r=e+3;let a=32===r?0:s<<r;a>>>=12;const u=r-12;let d=12<=r?0:s<<20+r,h=20+r;for(0<u&&0<l&&(l--,s=i.__digit(l),a|=s>>>30-u,d=s<<u+2,h=u+2);0<h&&0<l;)l--,s=i.__digit(l),d|=30<=h?s<<h-30:s>>>30-h,h-=30;const m=o.__decideRounding(i,h,l,s);if((1===m||0===m&&1==(1&d))&&(d=d+1>>>0,0===d&&(a++,0!=a>>>20&&(a=0,g++,1023<g))))return i.sign?-Infinity:1/0;const b=i.sign?-2147483648:0;return g=g+1023<<20,o.__kBitConversionInts[1]=b|g|a,o.__kBitConversionInts[0]=d,o.__kBitConversionDouble[0]}static unaryMinus(i){if(0===i.length)return i;const _=i.__copy();return _.sign=!i.sign,_}static bitwiseNot(i){return i.sign?o.__absoluteSubOne(i).__trim():o.__absoluteAddOne(i,!0)}static exponentiate(i,_){if(_.sign)throw new RangeError("Exponent must be positive");if(0===_.length)return o.__oneDigit(1,!1);if(0===i.length)return i;if(1===i.length&&1===i.__digit(0))return i.sign&&0==(1&_.__digit(0))?o.unaryMinus(i):i;if(1<_.length)throw new RangeError("BigInt too big");let t=_.__unsignedDigit(0);if(1===t)return i;if(t>=o.__kMaxLengthBits)throw new RangeError("BigInt too big");if(1===i.length&&2===i.__digit(0)){const _=1+(0|t/30),e=i.sign&&0!=(1&t),n=new o(_,e);n.__initializeDigits();const g=1<<t%30;return n.__setDigit(_-1,g),n}let e=null,n=i;for(0!=(1&t)&&(e=i),t>>=1;0!==t;t>>=1)n=o.multiply(n,n),0!=(1&t)&&(null===e?e=n:e=o.multiply(e,n));return e}static multiply(_,t){if(0===_.length)return _;if(0===t.length)return t;let i=_.length+t.length;30<=_.__clzmsd()+t.__clzmsd()&&i--;const e=new o(i,_.sign!==t.sign);e.__initializeDigits();for(let n=0;n<_.length;n++)o.__multiplyAccumulate(t,_.__digit(n),e,n);return e.__trim()}static divide(i,_){if(0===_.length)throw new RangeError("Division by zero");if(0>o.__absoluteCompare(i,_))return o.__zero();const t=i.sign!==_.sign,e=_.__unsignedDigit(0);let n;if(1===_.length&&32767>=e){if(1===e)return t===i.sign?i:o.unaryMinus(i);n=o.__absoluteDivSmall(i,e,null);}else n=o.__absoluteDivLarge(i,_,!0,!1);return n.sign=t,n.__trim()}static remainder(i,_){if(0===_.length)throw new RangeError("Division by zero");if(0>o.__absoluteCompare(i,_))return i;const t=_.__unsignedDigit(0);if(1===_.length&&32767>=t){if(1===t)return o.__zero();const _=o.__absoluteModSmall(i,t);return 0===_?o.__zero():o.__oneDigit(_,i.sign)}const e=o.__absoluteDivLarge(i,_,!1,!0);return e.sign=i.sign,e.__trim()}static add(i,_){const t=i.sign;return t===_.sign?o.__absoluteAdd(i,_,t):0<=o.__absoluteCompare(i,_)?o.__absoluteSub(i,_,t):o.__absoluteSub(_,i,!t)}static subtract(i,_){const t=i.sign;return t===_.sign?0<=o.__absoluteCompare(i,_)?o.__absoluteSub(i,_,t):o.__absoluteSub(_,i,!t):o.__absoluteAdd(i,_,t)}static leftShift(i,_){return 0===_.length||0===i.length?i:_.sign?o.__rightShiftByAbsolute(i,_):o.__leftShiftByAbsolute(i,_)}static signedRightShift(i,_){return 0===_.length||0===i.length?i:_.sign?o.__leftShiftByAbsolute(i,_):o.__rightShiftByAbsolute(i,_)}static unsignedRightShift(){throw new TypeError("BigInts have no unsigned right shift; use >> instead")}static lessThan(i,_){return 0>o.__compareToBigInt(i,_)}static lessThanOrEqual(i,_){return 0>=o.__compareToBigInt(i,_)}static greaterThan(i,_){return 0<o.__compareToBigInt(i,_)}static greaterThanOrEqual(i,_){return 0<=o.__compareToBigInt(i,_)}static equal(_,t){if(_.sign!==t.sign)return !1;if(_.length!==t.length)return !1;for(let e=0;e<_.length;e++)if(_.__digit(e)!==t.__digit(e))return !1;return !0}static notEqual(i,_){return !o.equal(i,_)}static bitwiseAnd(i,_){if(!i.sign&&!_.sign)return o.__absoluteAnd(i,_).__trim();if(i.sign&&_.sign){const t=e(i.length,_.length)+1;let n=o.__absoluteSubOne(i,t);const g=o.__absoluteSubOne(_);return n=o.__absoluteOr(n,g,n),o.__absoluteAddOne(n,!0,n).__trim()}return i.sign&&([i,_]=[_,i]),o.__absoluteAndNot(i,o.__absoluteSubOne(_)).__trim()}static bitwiseXor(i,_){if(!i.sign&&!_.sign)return o.__absoluteXor(i,_).__trim();if(i.sign&&_.sign){const t=e(i.length,_.length),n=o.__absoluteSubOne(i,t),g=o.__absoluteSubOne(_);return o.__absoluteXor(n,g,n).__trim()}const t=e(i.length,_.length)+1;i.sign&&([i,_]=[_,i]);let n=o.__absoluteSubOne(_,t);return n=o.__absoluteXor(n,i,n),o.__absoluteAddOne(n,!0,n).__trim()}static bitwiseOr(i,_){const t=e(i.length,_.length);if(!i.sign&&!_.sign)return o.__absoluteOr(i,_).__trim();if(i.sign&&_.sign){let e=o.__absoluteSubOne(i,t);const n=o.__absoluteSubOne(_);return e=o.__absoluteAnd(e,n,e),o.__absoluteAddOne(e,!0,e).__trim()}i.sign&&([i,_]=[_,i]);let n=o.__absoluteSubOne(_,t);return n=o.__absoluteAndNot(n,i,n),o.__absoluteAddOne(n,!0,n).__trim()}static asIntN(_,t){if(0===t.length)return t;if(_=g(_),0>_)throw new RangeError("Invalid value: not (convertible to) a safe integer");if(0===_)return o.__zero();if(_>=o.__kMaxLengthBits)return t;const e=0|(_+29)/30;if(t.length<e)return t;const s=t.__unsignedDigit(e-1),l=1<<(_-1)%30;if(t.length===e&&s<l)return t;if(!((s&l)===l))return o.__truncateToNBits(_,t);if(!t.sign)return o.__truncateAndSubFromPowerOfTwo(_,t,!0);if(0==(s&l-1)){for(let n=e-2;0<=n;n--)if(0!==t.__digit(n))return o.__truncateAndSubFromPowerOfTwo(_,t,!1);return t.length===e&&s===l?t:o.__truncateToNBits(_,t)}return o.__truncateAndSubFromPowerOfTwo(_,t,!1)}static asUintN(i,_){if(0===_.length)return _;if(i=g(i),0>i)throw new RangeError("Invalid value: not (convertible to) a safe integer");if(0===i)return o.__zero();if(_.sign){if(i>o.__kMaxLengthBits)throw new RangeError("BigInt too big");return o.__truncateAndSubFromPowerOfTwo(i,_,!1)}if(i>=o.__kMaxLengthBits)return _;const t=0|(i+29)/30;if(_.length<t)return _;const e=i%30;if(_.length==t){if(0===e)return _;const i=_.__digit(t-1);if(0==i>>>e)return _}return o.__truncateToNBits(i,_)}static ADD(i,_){if(i=o.__toPrimitive(i),_=o.__toPrimitive(_),"string"==typeof i)return "string"!=typeof _&&(_=_.toString()),i+_;if("string"==typeof _)return i.toString()+_;if(i=o.__toNumeric(i),_=o.__toNumeric(_),o.__isBigInt(i)&&o.__isBigInt(_))return o.add(i,_);if("number"==typeof i&&"number"==typeof _)return i+_;throw new TypeError("Cannot mix BigInt and other types, use explicit conversions")}static LT(i,_){return o.__compare(i,_,0)}static LE(i,_){return o.__compare(i,_,1)}static GT(i,_){return o.__compare(i,_,2)}static GE(i,_){return o.__compare(i,_,3)}static EQ(i,_){for(;;){if(o.__isBigInt(i))return o.__isBigInt(_)?o.equal(i,_):o.EQ(_,i);if("number"==typeof i){if(o.__isBigInt(_))return o.__equalToNumber(_,i);if("object"!=typeof _)return i==_;_=o.__toPrimitive(_);}else if("string"==typeof i){if(o.__isBigInt(_))return i=o.__fromString(i),null!==i&&o.equal(i,_);if("object"!=typeof _)return i==_;_=o.__toPrimitive(_);}else if("boolean"==typeof i){if(o.__isBigInt(_))return o.__equalToNumber(_,+i);if("object"!=typeof _)return i==_;_=o.__toPrimitive(_);}else if("symbol"==typeof i){if(o.__isBigInt(_))return !1;if("object"!=typeof _)return i==_;_=o.__toPrimitive(_);}else if("object"==typeof i){if("object"==typeof _&&_.constructor!==o)return i==_;i=o.__toPrimitive(i);}else return i==_}}static NE(i,_){return !o.EQ(i,_)}static __zero(){return new o(0,!1)}static __oneDigit(i,_){const t=new o(1,_);return t.__setDigit(0,i),t}__copy(){const _=new o(this.length,this.sign);for(let t=0;t<this.length;t++)_[t]=this[t];return _}__trim(){let i=this.length,_=this[i-1];for(;0===_;)i--,_=this[i-1],this.pop();return 0===i&&(this.sign=!1),this}__initializeDigits(){for(let _=0;_<this.length;_++)this[_]=0;}static __decideRounding(i,_,t,e){if(0<_)return -1;let n;if(0>_)n=-_-1;else {if(0===t)return -1;t--,e=i.__digit(t),n=29;}let g=1<<n;if(0==(e&g))return -1;if(g-=1,0!=(e&g))return 1;for(;0<t;)if(t--,0!==i.__digit(t))return 1;return 0}static __fromDouble(i){o.__kBitConversionDouble[0]=i;const _=2047&o.__kBitConversionInts[1]>>>20,t=_-1023,e=(0|t/30)+1,n=new o(e,0>i);let g=1048575&o.__kBitConversionInts[1]|1048576,s=o.__kBitConversionInts[0];const l=20,r=t%30;let a,u=0;if(20>r){const i=l-r;u=i+32,a=g>>>i,g=g<<32-i|s>>>i,s<<=32-i;}else if(20===r)u=32,a=g,g=s,s=0;else {const i=r-l;u=32-i,a=g<<i|s>>>32-i,g=s<<i,s=0;}n.__setDigit(e-1,a);for(let _=e-2;0<=_;_--)0<u?(u-=30,a=g>>>2,g=g<<30|s>>>2,s<<=30):a=0,n.__setDigit(_,a);return n.__trim()}static __isWhitespace(i){return !!(13>=i&&9<=i)||(159>=i?32==i:131071>=i?160==i||5760==i:196607>=i?(i&=131071,10>=i||40==i||41==i||47==i||95==i||4096==i):65279==i)}static __fromString(i,_=0){let t=0;const e=i.length;let n=0;if(n===e)return o.__zero();let g=i.charCodeAt(n);for(;o.__isWhitespace(g);){if(++n===e)return o.__zero();g=i.charCodeAt(n);}if(43===g){if(++n===e)return null;g=i.charCodeAt(n),t=1;}else if(45===g){if(++n===e)return null;g=i.charCodeAt(n),t=-1;}if(0===_){if(_=10,48===g){if(++n===e)return o.__zero();if(g=i.charCodeAt(n),88===g||120===g){if(_=16,++n===e)return null;g=i.charCodeAt(n);}else if(79===g||111===g){if(_=8,++n===e)return null;g=i.charCodeAt(n);}else if(66===g||98===g){if(_=2,++n===e)return null;g=i.charCodeAt(n);}}}else if(16===_&&48===g){if(++n===e)return o.__zero();if(g=i.charCodeAt(n),88===g||120===g){if(++n===e)return null;g=i.charCodeAt(n);}}if(0!=t&&10!==_)return null;for(;48===g;){if(++n===e)return o.__zero();g=i.charCodeAt(n);}const s=e-n;let l=o.__kMaxBitsPerChar[_],r=o.__kBitsPerCharTableMultiplier-1;if(s>1073741824/l)return null;const a=l*s+r>>>o.__kBitsPerCharTableShift,u=new o(0|(a+29)/30,!1),h=10>_?_:10,b=10<_?_-10:0;if(0==(_&_-1)){l>>=o.__kBitsPerCharTableShift;const _=[],t=[];let s=!1;do{let o=0,r=0;for(;;){let _;if(g-48>>>0<h)_=g-48;else if((32|g)-97>>>0<b)_=(32|g)-87;else {s=!0;break}if(r+=l,o=o<<l|_,++n===e){s=!0;break}if(g=i.charCodeAt(n),30<r+l)break}_.push(o),t.push(r);}while(!s);o.__fillFromParts(u,_,t);}else {u.__initializeDigits();let t=!1,s=0;do{let a=0,D=1;for(;;){let o;if(g-48>>>0<h)o=g-48;else if((32|g)-97>>>0<b)o=(32|g)-87;else {t=!0;break}const l=D*_;if(1073741823<l)break;if(D=l,a=a*_+o,s++,++n===e){t=!0;break}g=i.charCodeAt(n);}r=30*o.__kBitsPerCharTableMultiplier-1;const c=0|(l*s+r>>>o.__kBitsPerCharTableShift)/30;u.__inplaceMultiplyAdd(D,a,c);}while(!t)}if(n!==e){if(!o.__isWhitespace(g))return null;for(n++;n<e;n++)if(g=i.charCodeAt(n),!o.__isWhitespace(g))return null}return u.sign=-1==t,u.__trim()}static __fillFromParts(_,t,e){let n=0,g=0,o=0;for(let s=t.length-1;0<=s;s--){const i=t[s],l=e[s];g|=i<<o,o+=l,30===o?(_.__setDigit(n++,g),o=0,g=0):30<o&&(_.__setDigit(n++,1073741823&g),o-=30,g=i>>>l-o);}if(0!==g){if(n>=_.length)throw new Error("implementation bug");_.__setDigit(n++,g);}for(;n<_.length;n++)_.__setDigit(n,0);}static __toStringBasePowerOfTwo(_,i){const t=_.length;let e=i-1;e=(85&e>>>1)+(85&e),e=(51&e>>>2)+(51&e),e=(15&e>>>4)+(15&e);const n=e,g=i-1,s=_.__digit(t-1),l=o.__clz30(s);let r=0|(30*t-l+n-1)/n;if(_.sign&&r++,268435456<r)throw new Error("string too long");const a=Array(r);let u=r-1,d=0,h=0;for(let e=0;e<t-1;e++){const i=_.__digit(e),t=(d|i<<h)&g;a[u--]=o.__kConversionChars[t];const s=n-h;for(d=i>>>s,h=30-s;h>=n;)a[u--]=o.__kConversionChars[d&g],d>>>=n,h-=n;}const m=(d|s<<h)&g;for(a[u--]=o.__kConversionChars[m],d=s>>>n-h;0!==d;)a[u--]=o.__kConversionChars[d&g],d>>>=n;if(_.sign&&(a[u--]="-"),-1!=u)throw new Error("implementation bug");return a.join("")}static __toStringGeneric(_,i,t){const e=_.length;if(0===e)return "";if(1===e){let e=_.__unsignedDigit(0).toString(i);return !1===t&&_.sign&&(e="-"+e),e}const n=30*e-o.__clz30(_.__digit(e-1)),g=o.__kMaxBitsPerChar[i],s=g-1;let l=n*o.__kBitsPerCharTableMultiplier;l+=s-1,l=0|l/s;const r=l+1>>1,a=o.exponentiate(o.__oneDigit(i,!1),o.__oneDigit(r,!1));let u,d;const h=a.__unsignedDigit(0);if(1===a.length&&32767>=h){u=new o(_.length,!1),u.__initializeDigits();let t=0;for(let e=2*_.length-1;0<=e;e--){const i=t<<15|_.__halfDigit(e);u.__setHalfDigit(e,0|i/h),t=0|i%h;}d=t.toString(i);}else {const t=o.__absoluteDivLarge(_,a,!0,!0);u=t.quotient;const e=t.remainder.__trim();d=o.__toStringGeneric(e,i,!0);}u.__trim();let m=o.__toStringGeneric(u,i,!0);for(;d.length<r;)d="0"+d;return !1===t&&_.sign&&(m="-"+m),m+d}static __unequalSign(i){return i?-1:1}static __absoluteGreater(i){return i?-1:1}static __absoluteLess(i){return i?1:-1}static __compareToBigInt(i,_){const t=i.sign;if(t!==_.sign)return o.__unequalSign(t);const e=o.__absoluteCompare(i,_);return 0<e?o.__absoluteGreater(t):0>e?o.__absoluteLess(t):0}static __compareToNumber(i,_){if(o.__isOneDigitInt(_)){const e=i.sign,n=0>_;if(e!==n)return o.__unequalSign(e);if(0===i.length){if(n)throw new Error("implementation bug");return 0===_?0:-1}if(1<i.length)return o.__absoluteGreater(e);const g=t(_),s=i.__unsignedDigit(0);return s>g?o.__absoluteGreater(e):s<g?o.__absoluteLess(e):0}return o.__compareToDouble(i,_)}static __compareToDouble(i,_){if(_!==_)return _;if(_===1/0)return -1;if(_===-Infinity)return 1;const t=i.sign;if(t!==0>_)return o.__unequalSign(t);if(0===_)throw new Error("implementation bug: should be handled elsewhere");if(0===i.length)return -1;o.__kBitConversionDouble[0]=_;const e=2047&o.__kBitConversionInts[1]>>>20;if(2047==e)throw new Error("implementation bug: handled elsewhere");const n=e-1023;if(0>n)return o.__absoluteGreater(t);const g=i.length;let s=i.__digit(g-1);const l=o.__clz30(s),r=30*g-l,a=n+1;if(r<a)return o.__absoluteLess(t);if(r>a)return o.__absoluteGreater(t);let u=1048576|1048575&o.__kBitConversionInts[1],d=o.__kBitConversionInts[0];const h=20,m=29-l;if(m!==(0|(r-1)%30))throw new Error("implementation bug");let b,D=0;if(20>m){const i=h-m;D=i+32,b=u>>>i,u=u<<32-i|d>>>i,d<<=32-i;}else if(20===m)D=32,b=u,u=d,d=0;else {const i=m-h;D=32-i,b=u<<i|d>>>32-i,u=d<<i,d=0;}if(s>>>=0,b>>>=0,s>b)return o.__absoluteGreater(t);if(s<b)return o.__absoluteLess(t);for(let e=g-2;0<=e;e--){0<D?(D-=30,b=u>>>2,u=u<<30|d>>>2,d<<=30):b=0;const _=i.__unsignedDigit(e);if(_>b)return o.__absoluteGreater(t);if(_<b)return o.__absoluteLess(t)}if(0!==u||0!==d){if(0===D)throw new Error("implementation bug");return o.__absoluteLess(t)}return 0}static __equalToNumber(i,_){return o.__isOneDigitInt(_)?0===_?0===i.length:1===i.length&&i.sign===0>_&&i.__unsignedDigit(0)===t(_):0===o.__compareToDouble(i,_)}static __comparisonResultToBool(i,_){return 0===_?0>i:1===_?0>=i:2===_?0<i:3===_?0<=i:void 0}static __compare(i,_,t){if(i=o.__toPrimitive(i),_=o.__toPrimitive(_),"string"==typeof i&&"string"==typeof _)switch(t){case 0:return i<_;case 1:return i<=_;case 2:return i>_;case 3:return i>=_;}if(o.__isBigInt(i)&&"string"==typeof _)return _=o.__fromString(_),null!==_&&o.__comparisonResultToBool(o.__compareToBigInt(i,_),t);if("string"==typeof i&&o.__isBigInt(_))return i=o.__fromString(i),null!==i&&o.__comparisonResultToBool(o.__compareToBigInt(i,_),t);if(i=o.__toNumeric(i),_=o.__toNumeric(_),o.__isBigInt(i)){if(o.__isBigInt(_))return o.__comparisonResultToBool(o.__compareToBigInt(i,_),t);if("number"!=typeof _)throw new Error("implementation bug");return o.__comparisonResultToBool(o.__compareToNumber(i,_),t)}if("number"!=typeof i)throw new Error("implementation bug");if(o.__isBigInt(_))return o.__comparisonResultToBool(o.__compareToNumber(_,i),2^t);if("number"!=typeof _)throw new Error("implementation bug");return 0===t?i<_:1===t?i<=_:2===t?i>_:3===t?i>=_:void 0}__clzmsd(){return o.__clz30(this.__digit(this.length-1))}static __absoluteAdd(_,t,e){if(_.length<t.length)return o.__absoluteAdd(t,_,e);if(0===_.length)return _;if(0===t.length)return _.sign===e?_:o.unaryMinus(_);let n=_.length;(0===_.__clzmsd()||t.length===_.length&&0===t.__clzmsd())&&n++;const g=new o(n,e);let s=0,l=0;for(;l<t.length;l++){const i=_.__digit(l)+t.__digit(l)+s;s=i>>>30,g.__setDigit(l,1073741823&i);}for(;l<_.length;l++){const i=_.__digit(l)+s;s=i>>>30,g.__setDigit(l,1073741823&i);}return l<g.length&&g.__setDigit(l,s),g.__trim()}static __absoluteSub(_,t,e){if(0===_.length)return _;if(0===t.length)return _.sign===e?_:o.unaryMinus(_);const n=new o(_.length,e);let g=0,s=0;for(;s<t.length;s++){const i=_.__digit(s)-t.__digit(s)-g;g=1&i>>>30,n.__setDigit(s,1073741823&i);}for(;s<_.length;s++){const i=_.__digit(s)-g;g=1&i>>>30,n.__setDigit(s,1073741823&i);}return n.__trim()}static __absoluteAddOne(_,i,t=null){const e=_.length;null===t?t=new o(e,i):t.sign=i;let n=1;for(let g=0;g<e;g++){const i=_.__digit(g)+n;n=i>>>30,t.__setDigit(g,1073741823&i);}return 0!=n&&t.__setDigitGrow(e,1),t}static __absoluteSubOne(_,t){const e=_.length;t=t||e;const n=new o(t,!1);let g=1;for(let o=0;o<e;o++){const i=_.__digit(o)-g;g=1&i>>>30,n.__setDigit(o,1073741823&i);}if(0!=g)throw new Error("implementation bug");for(let g=e;g<t;g++)n.__setDigit(g,0);return n}static __absoluteAnd(_,t,e=null){let n=_.length,g=t.length,s=g;if(n<g){s=n;const i=_,e=n;_=t,n=g,t=i,g=e;}let l=s;null===e?e=new o(l,!1):l=e.length;let r=0;for(;r<s;r++)e.__setDigit(r,_.__digit(r)&t.__digit(r));for(;r<l;r++)e.__setDigit(r,0);return e}static __absoluteAndNot(_,t,e=null){const n=_.length,g=t.length;let s=g;n<g&&(s=n);let l=n;null===e?e=new o(l,!1):l=e.length;let r=0;for(;r<s;r++)e.__setDigit(r,_.__digit(r)&~t.__digit(r));for(;r<n;r++)e.__setDigit(r,_.__digit(r));for(;r<l;r++)e.__setDigit(r,0);return e}static __absoluteOr(_,t,e=null){let n=_.length,g=t.length,s=g;if(n<g){s=n;const i=_,e=n;_=t,n=g,t=i,g=e;}let l=n;null===e?e=new o(l,!1):l=e.length;let r=0;for(;r<s;r++)e.__setDigit(r,_.__digit(r)|t.__digit(r));for(;r<n;r++)e.__setDigit(r,_.__digit(r));for(;r<l;r++)e.__setDigit(r,0);return e}static __absoluteXor(_,t,e=null){let n=_.length,g=t.length,s=g;if(n<g){s=n;const i=_,e=n;_=t,n=g,t=i,g=e;}let l=n;null===e?e=new o(l,!1):l=e.length;let r=0;for(;r<s;r++)e.__setDigit(r,_.__digit(r)^t.__digit(r));for(;r<n;r++)e.__setDigit(r,_.__digit(r));for(;r<l;r++)e.__setDigit(r,0);return e}static __absoluteCompare(_,t){const e=_.length-t.length;if(0!=e)return e;let n=_.length-1;for(;0<=n&&_.__digit(n)===t.__digit(n);)n--;return 0>n?0:_.__unsignedDigit(n)>t.__unsignedDigit(n)?1:-1}static __multiplyAccumulate(_,t,e,n){if(0===t)return;const g=32767&t,s=t>>>15;let l=0,r=0;for(let a,u=0;u<_.length;u++,n++){a=e.__digit(n);const i=_.__digit(u),t=32767&i,d=i>>>15,h=o.__imul(t,g),m=o.__imul(t,s),b=o.__imul(d,g),D=o.__imul(d,s);a+=r+h+l,l=a>>>30,a&=1073741823,a+=((32767&m)<<15)+((32767&b)<<15),l+=a>>>30,r=D+(m>>>15)+(b>>>15),e.__setDigit(n,1073741823&a);}for(;0!=l||0!==r;n++){let i=e.__digit(n);i+=l+r,r=0,l=i>>>30,e.__setDigit(n,1073741823&i);}}static __internalMultiplyAdd(_,t,e,g,s){let l=e,a=0;for(let n=0;n<g;n++){const i=_.__digit(n),e=o.__imul(32767&i,t),g=o.__imul(i>>>15,t),u=e+((32767&g)<<15)+a+l;l=u>>>30,a=g>>>15,s.__setDigit(n,1073741823&u);}if(s.length>g)for(s.__setDigit(g++,l+a);g<s.length;)s.__setDigit(g++,0);else if(0!==l+a)throw new Error("implementation bug")}__inplaceMultiplyAdd(i,_,t){t>this.length&&(t=this.length);const e=32767&i,n=i>>>15;let g=0,s=_;for(let l=0;l<t;l++){const i=this.__digit(l),_=32767&i,t=i>>>15,r=o.__imul(_,e),a=o.__imul(_,n),u=o.__imul(t,e),d=o.__imul(t,n);let h=s+r+g;g=h>>>30,h&=1073741823,h+=((32767&a)<<15)+((32767&u)<<15),g+=h>>>30,s=d+(a>>>15)+(u>>>15),this.__setDigit(l,1073741823&h);}if(0!=g||0!==s)throw new Error("implementation bug")}static __absoluteDivSmall(_,t,e=null){null===e&&(e=new o(_.length,!1));let n=0;for(let g,o=2*_.length-1;0<=o;o-=2){g=(n<<15|_.__halfDigit(o))>>>0;const i=0|g/t;n=0|g%t,g=(n<<15|_.__halfDigit(o-1))>>>0;const s=0|g/t;n=0|g%t,e.__setDigit(o>>>1,i<<15|s);}return e}static __absoluteModSmall(_,t){let e=0;for(let n=2*_.length-1;0<=n;n--){const i=(e<<15|_.__halfDigit(n))>>>0;e=0|i%t;}return e}static __absoluteDivLarge(i,_,t,e){const g=_.__halfDigitLength(),n=_.length,s=i.__halfDigitLength()-g;let l=null;t&&(l=new o(s+2>>>1,!1),l.__initializeDigits());const r=new o(g+2>>>1,!1);r.__initializeDigits();const a=o.__clz15(_.__halfDigit(g-1));0<a&&(_=o.__specialLeftShift(_,a,0));const d=o.__specialLeftShift(i,a,1),u=_.__halfDigit(g-1);let h=0;for(let a,m=s;0<=m;m--){a=32767;const i=d.__halfDigit(m+g);if(i!==u){const t=(i<<15|d.__halfDigit(m+g-1))>>>0;a=0|t/u;let e=0|t%u;const n=_.__halfDigit(g-2),s=d.__halfDigit(m+g-2);for(;o.__imul(a,n)>>>0>(e<<16|s)>>>0&&(a--,e+=u,!(32767<e)););}o.__internalMultiplyAdd(_,a,0,n,r);let e=d.__inplaceSub(r,m,g+1);0!==e&&(e=d.__inplaceAdd(_,m,g),d.__setHalfDigit(m+g,32767&d.__halfDigit(m+g)+e),a--),t&&(1&m?h=a<<15:l.__setDigit(m>>>1,h|a));}if(e)return d.__inplaceRightShift(a),t?{quotient:l,remainder:d}:d;if(t)return l;throw new Error("unreachable")}static __clz15(i){return o.__clz30(i)-15}__inplaceAdd(_,t,e){let n=0;for(let g=0;g<e;g++){const i=this.__halfDigit(t+g)+_.__halfDigit(g)+n;n=i>>>15,this.__setHalfDigit(t+g,32767&i);}return n}__inplaceSub(_,t,e){let n=0;if(1&t){t>>=1;let g=this.__digit(t),o=32767&g,s=0;for(;s<e-1>>>1;s++){const i=_.__digit(s),e=(g>>>15)-(32767&i)-n;n=1&e>>>15,this.__setDigit(t+s,(32767&e)<<15|32767&o),g=this.__digit(t+s+1),o=(32767&g)-(i>>>15)-n,n=1&o>>>15;}const i=_.__digit(s),l=(g>>>15)-(32767&i)-n;n=1&l>>>15,this.__setDigit(t+s,(32767&l)<<15|32767&o);if(t+s+1>=this.length)throw new RangeError("out of bounds");0==(1&e)&&(g=this.__digit(t+s+1),o=(32767&g)-(i>>>15)-n,n=1&o>>>15,this.__setDigit(t+_.length,1073709056&g|32767&o));}else {t>>=1;let g=0;for(;g<_.length-1;g++){const i=this.__digit(t+g),e=_.__digit(g),o=(32767&i)-(32767&e)-n;n=1&o>>>15;const s=(i>>>15)-(e>>>15)-n;n=1&s>>>15,this.__setDigit(t+g,(32767&s)<<15|32767&o);}const i=this.__digit(t+g),o=_.__digit(g),s=(32767&i)-(32767&o)-n;n=1&s>>>15;let l=0;0==(1&e)&&(l=(i>>>15)-(o>>>15)-n,n=1&l>>>15),this.__setDigit(t+g,(32767&l)<<15|32767&s);}return n}__inplaceRightShift(_){if(0===_)return;let t=this.__digit(0)>>>_;const e=this.length-1;for(let n=0;n<e;n++){const i=this.__digit(n+1);this.__setDigit(n,1073741823&i<<30-_|t),t=i>>>_;}this.__setDigit(e,t);}static __specialLeftShift(_,t,e){const g=_.length,n=new o(g+e,!1);if(0===t){for(let t=0;t<g;t++)n.__setDigit(t,_.__digit(t));return 0<e&&n.__setDigit(g,0),n}let s=0;for(let o=0;o<g;o++){const i=_.__digit(o);n.__setDigit(o,1073741823&i<<t|s),s=i>>>30-t;}return 0<e&&n.__setDigit(g,s),n}static __leftShiftByAbsolute(_,i){const t=o.__toShiftAmount(i);if(0>t)throw new RangeError("BigInt too big");const e=0|t/30,n=t%30,g=_.length,s=0!==n&&0!=_.__digit(g-1)>>>30-n,l=g+e+(s?1:0),r=new o(l,_.sign);if(0===n){let t=0;for(;t<e;t++)r.__setDigit(t,0);for(;t<l;t++)r.__setDigit(t,_.__digit(t-e));}else {let t=0;for(let _=0;_<e;_++)r.__setDigit(_,0);for(let o=0;o<g;o++){const i=_.__digit(o);r.__setDigit(o+e,1073741823&i<<n|t),t=i>>>30-n;}if(s)r.__setDigit(g+e,t);else if(0!==t)throw new Error("implementation bug")}return r.__trim()}static __rightShiftByAbsolute(_,i){const t=_.length,e=_.sign,n=o.__toShiftAmount(i);if(0>n)return o.__rightShiftByMaximum(e);const g=0|n/30,s=n%30;let l=t-g;if(0>=l)return o.__rightShiftByMaximum(e);let r=!1;if(e){if(0!=(_.__digit(g)&(1<<s)-1))r=!0;else for(let t=0;t<g;t++)if(0!==_.__digit(t)){r=!0;break}}if(r&&0===s){const i=_.__digit(t-1);0==~i&&l++;}let a=new o(l,e);if(0===s){a.__setDigit(l-1,0);for(let e=g;e<t;e++)a.__setDigit(e-g,_.__digit(e));}else {let e=_.__digit(g)>>>s;const n=t-g-1;for(let t=0;t<n;t++){const i=_.__digit(t+g+1);a.__setDigit(t,1073741823&i<<30-s|e),e=i>>>s;}a.__setDigit(n,e);}return r&&(a=o.__absoluteAddOne(a,!0,a)),a.__trim()}static __rightShiftByMaximum(i){return i?o.__oneDigit(1,!0):o.__zero()}static __toShiftAmount(i){if(1<i.length)return -1;const _=i.__unsignedDigit(0);return _>o.__kMaxLengthBits?-1:_}static __toPrimitive(i,_="default"){if("object"!=typeof i)return i;if(i.constructor===o)return i;if("undefined"!=typeof Symbol&&"symbol"==typeof Symbol.toPrimitive){const t=i[Symbol.toPrimitive];if(t){const i=t(_);if("object"!=typeof i)return i;throw new TypeError("Cannot convert object to primitive value")}}const t=i.valueOf;if(t){const _=t.call(i);if("object"!=typeof _)return _}const e=i.toString;if(e){const _=e.call(i);if("object"!=typeof _)return _}throw new TypeError("Cannot convert object to primitive value")}static __toNumeric(i){return o.__isBigInt(i)?i:+i}static __isBigInt(i){return "object"==typeof i&&null!==i&&i.constructor===o}static __truncateToNBits(i,_){const t=0|(i+29)/30,e=new o(t,_.sign),n=t-1;for(let t=0;t<n;t++)e.__setDigit(t,_.__digit(t));let g=_.__digit(n);if(0!=i%30){const _=32-i%30;g=g<<_>>>_;}return e.__setDigit(n,g),e.__trim()}static __truncateAndSubFromPowerOfTwo(_,t,e){var n=Math.min;const g=0|(_+29)/30,s=new o(g,e);let l=0;const r=g-1;let a=0;for(const i=n(r,t.length);l<i;l++){const i=0-t.__digit(l)-a;a=1&i>>>30,s.__setDigit(l,1073741823&i);}for(;l<r;l++)s.__setDigit(l,0|1073741823&-a);let u=r<t.length?t.__digit(r):0;const d=_%30;let h;if(0==d)h=0-u-a,h&=1073741823;else {const i=32-d;u=u<<i>>>i;const _=1<<32-i;h=_-u-a,h&=_-1;}return s.__setDigit(r,h),s.__trim()}__digit(_){return this[_]}__unsignedDigit(_){return this[_]>>>0}__setDigit(_,i){this[_]=0|i;}__setDigitGrow(_,i){this[_]=0|i;}__halfDigitLength(){const i=this.length;return 32767>=this.__unsignedDigit(i-1)?2*i-1:2*i}__halfDigit(_){return 32767&this[_>>>1]>>>15*(1&_)}__setHalfDigit(_,i){const t=_>>>1,e=this.__digit(t),n=1&_?32767&e|i<<15:1073709056&e|32767&i;this.__setDigit(t,n);}static __digitPow(i,_){let t=1;for(;0<_;)1&_&&(t*=i),_>>>=1,i*=i;return t}static __isOneDigitInt(i){return (1073741823&i)===i}}return o.__kMaxLength=33554432,o.__kMaxLengthBits=o.__kMaxLength<<5,o.__kMaxBitsPerChar=[0,0,32,51,64,75,83,90,96,102,107,111,115,119,122,126,128,131,134,136,139,141,143,145,147,149,151,153,154,156,158,159,160,162,163,165,166],o.__kBitsPerCharTableShift=5,o.__kBitsPerCharTableMultiplier=1<<o.__kBitsPerCharTableShift,o.__kConversionChars=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],o.__kBitConversionBuffer=new ArrayBuffer(8),o.__kBitConversionDouble=new Float64Array(o.__kBitConversionBuffer),o.__kBitConversionInts=new Int32Array(o.__kBitConversionBuffer),o.__clz30=_?function(i){return _(i)-2}:function(i){var _=Math.LN2,t=Math.log;return 0===i?30:0|29-(0|t(i>>>0)/_)},o.__imul=i||function(i,_){return 0|i*_},o});
	
} (jsbiUmd));

var JSBI = jsbiUmd.exports;

var isProduction = process.env.NODE_ENV === 'production';
var prefix = 'Invariant failed';
function invariant(condition, message) {
    if (condition) {
        return;
    }
    if (isProduction) {
        throw new Error(prefix);
    }
    var provided = typeof message === 'function' ? message() : message;
    var value = provided ? prefix + ": " + provided : prefix;
    throw new Error(value);
}

var decimal = {exports: {}};

/*! decimal.js-light v2.5.1 https://github.com/MikeMcl/decimal.js-light/LICENCE */

(function (module) {
(function (globalScope) {


	  /*
	   *  decimal.js-light v2.5.1
	   *  An arbitrary-precision Decimal type for JavaScript.
	   *  https://github.com/MikeMcl/decimal.js-light
	   *  Copyright (c) 2020 Michael Mclaughlin <M8ch88l@gmail.com>
	   *  MIT Expat Licence
	   */


	  // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //


	    // The limit on the value of `precision`, and on the value of the first argument to
	    // `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
	  var MAX_DIGITS = 1e9,                        // 0 to 1e9


	    // The initial configuration properties of the Decimal constructor.
	    Decimal = {

	      // These values must be integers within the stated ranges (inclusive).
	      // Most of these values can be changed during run-time using `Decimal.config`.

	      // The maximum number of significant digits of the result of a calculation or base conversion.
	      // E.g. `Decimal.config({ precision: 20 });`
	      precision: 20,                         // 1 to MAX_DIGITS

	      // The rounding mode used by default by `toInteger`, `toDecimalPlaces`, `toExponential`,
	      // `toFixed`, `toPrecision` and `toSignificantDigits`.
	      //
	      // ROUND_UP         0 Away from zero.
	      // ROUND_DOWN       1 Towards zero.
	      // ROUND_CEIL       2 Towards +Infinity.
	      // ROUND_FLOOR      3 Towards -Infinity.
	      // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
	      // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
	      // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
	      // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
	      // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
	      //
	      // E.g.
	      // `Decimal.rounding = 4;`
	      // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
	      rounding: 4,                           // 0 to 8

	      // The exponent value at and beneath which `toString` returns exponential notation.
	      // JavaScript numbers: -7
	      toExpNeg: -7,                          // 0 to -MAX_E

	      // The exponent value at and above which `toString` returns exponential notation.
	      // JavaScript numbers: 21
	      toExpPos:  21,                         // 0 to MAX_E

	      // The natural logarithm of 10.
	      // 115 digits
	      LN10: '2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286'
	    },


	  // ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //


	    external = true,

	    decimalError = '[DecimalError] ',
	    invalidArgument = decimalError + 'Invalid argument: ',
	    exponentOutOfRange = decimalError + 'Exponent out of range: ',

	    mathfloor = Math.floor,
	    mathpow = Math.pow,

	    isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,

	    ONE,
	    BASE = 1e7,
	    LOG_BASE = 7,
	    MAX_SAFE_INTEGER = 9007199254740991,
	    MAX_E = mathfloor(MAX_SAFE_INTEGER / LOG_BASE),    // 1286742750677284

	    // Decimal.prototype object
	    P = {};


	  // Decimal prototype methods


	  /*
	   *  absoluteValue                       abs
	   *  comparedTo                          cmp
	   *  decimalPlaces                       dp
	   *  dividedBy                           div
	   *  dividedToIntegerBy                  idiv
	   *  equals                              eq
	   *  exponent
	   *  greaterThan                         gt
	   *  greaterThanOrEqualTo                gte
	   *  isInteger                           isint
	   *  isNegative                          isneg
	   *  isPositive                          ispos
	   *  isZero
	   *  lessThan                            lt
	   *  lessThanOrEqualTo                   lte
	   *  logarithm                           log
	   *  minus                               sub
	   *  modulo                              mod
	   *  naturalExponential                  exp
	   *  naturalLogarithm                    ln
	   *  negated                             neg
	   *  plus                                add
	   *  precision                           sd
	   *  squareRoot                          sqrt
	   *  times                               mul
	   *  toDecimalPlaces                     todp
	   *  toExponential
	   *  toFixed
	   *  toInteger                           toint
	   *  toNumber
	   *  toPower                             pow
	   *  toPrecision
	   *  toSignificantDigits                 tosd
	   *  toString
	   *  valueOf                             val
	   */


	  /*
	   * Return a new Decimal whose value is the absolute value of this Decimal.
	   *
	   */
	  P.absoluteValue = P.abs = function () {
	    var x = new this.constructor(this);
	    if (x.s) x.s = 1;
	    return x;
	  };


	  /*
	   * Return
	   *   1    if the value of this Decimal is greater than the value of `y`,
	   *  -1    if the value of this Decimal is less than the value of `y`,
	   *   0    if they have the same value
	   *
	   */
	  P.comparedTo = P.cmp = function (y) {
	    var i, j, xdL, ydL,
	      x = this;

	    y = new x.constructor(y);

	    // Signs differ?
	    if (x.s !== y.s) return x.s || -y.s;

	    // Compare exponents.
	    if (x.e !== y.e) return x.e > y.e ^ x.s < 0 ? 1 : -1;

	    xdL = x.d.length;
	    ydL = y.d.length;

	    // Compare digit by digit.
	    for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
	      if (x.d[i] !== y.d[i]) return x.d[i] > y.d[i] ^ x.s < 0 ? 1 : -1;
	    }

	    // Compare lengths.
	    return xdL === ydL ? 0 : xdL > ydL ^ x.s < 0 ? 1 : -1;
	  };


	  /*
	   * Return the number of decimal places of the value of this Decimal.
	   *
	   */
	  P.decimalPlaces = P.dp = function () {
	    var x = this,
	      w = x.d.length - 1,
	      dp = (w - x.e) * LOG_BASE;

	    // Subtract the number of trailing zeros of the last word.
	    w = x.d[w];
	    if (w) for (; w % 10 == 0; w /= 10) dp--;

	    return dp < 0 ? 0 : dp;
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal divided by `y`, truncated to
	   * `precision` significant digits.
	   *
	   */
	  P.dividedBy = P.div = function (y) {
	    return divide(this, new this.constructor(y));
	  };


	  /*
	   * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
	   * by the value of `y`, truncated to `precision` significant digits.
	   *
	   */
	  P.dividedToIntegerBy = P.idiv = function (y) {
	    var x = this,
	      Ctor = x.constructor;
	    return round(divide(x, new Ctor(y), 0, 1), Ctor.precision);
	  };


	  /*
	   * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
	   *
	   */
	  P.equals = P.eq = function (y) {
	    return !this.cmp(y);
	  };


	  /*
	   * Return the (base 10) exponent value of this Decimal (this.e is the base 10000000 exponent).
	   *
	   */
	  P.exponent = function () {
	    return getBase10Exponent(this);
	  };


	  /*
	   * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
	   * false.
	   *
	   */
	  P.greaterThan = P.gt = function (y) {
	    return this.cmp(y) > 0;
	  };


	  /*
	   * Return true if the value of this Decimal is greater than or equal to the value of `y`,
	   * otherwise return false.
	   *
	   */
	  P.greaterThanOrEqualTo = P.gte = function (y) {
	    return this.cmp(y) >= 0;
	  };


	  /*
	   * Return true if the value of this Decimal is an integer, otherwise return false.
	   *
	   */
	  P.isInteger = P.isint = function () {
	    return this.e > this.d.length - 2;
	  };


	  /*
	   * Return true if the value of this Decimal is negative, otherwise return false.
	   *
	   */
	  P.isNegative = P.isneg = function () {
	    return this.s < 0;
	  };


	  /*
	   * Return true if the value of this Decimal is positive, otherwise return false.
	   *
	   */
	  P.isPositive = P.ispos = function () {
	    return this.s > 0;
	  };


	  /*
	   * Return true if the value of this Decimal is 0, otherwise return false.
	   *
	   */
	  P.isZero = function () {
	    return this.s === 0;
	  };


	  /*
	   * Return true if the value of this Decimal is less than `y`, otherwise return false.
	   *
	   */
	  P.lessThan = P.lt = function (y) {
	    return this.cmp(y) < 0;
	  };


	  /*
	   * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
	   *
	   */
	  P.lessThanOrEqualTo = P.lte = function (y) {
	    return this.cmp(y) < 1;
	  };


	  /*
	   * Return the logarithm of the value of this Decimal to the specified base, truncated to
	   * `precision` significant digits.
	   *
	   * If no base is specified, return log[10](x).
	   *
	   * log[base](x) = ln(x) / ln(base)
	   *
	   * The maximum error of the result is 1 ulp (unit in the last place).
	   *
	   * [base] {number|string|Decimal} The base of the logarithm.
	   *
	   */
	  P.logarithm = P.log = function (base) {
	    var r,
	      x = this,
	      Ctor = x.constructor,
	      pr = Ctor.precision,
	      wpr = pr + 5;

	    // Default base is 10.
	    if (base === void 0) {
	      base = new Ctor(10);
	    } else {
	      base = new Ctor(base);

	      // log[-b](x) = NaN
	      // log[0](x)  = NaN
	      // log[1](x)  = NaN
	      if (base.s < 1 || base.eq(ONE)) throw Error(decimalError + 'NaN');
	    }

	    // log[b](-x) = NaN
	    // log[b](0) = -Infinity
	    if (x.s < 1) throw Error(decimalError + (x.s ? 'NaN' : '-Infinity'));

	    // log[b](1) = 0
	    if (x.eq(ONE)) return new Ctor(0);

	    external = false;
	    r = divide(ln(x, wpr), ln(base, wpr), wpr);
	    external = true;

	    return round(r, pr);
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal minus `y`, truncated to
	   * `precision` significant digits.
	   *
	   */
	  P.minus = P.sub = function (y) {
	    var x = this;
	    y = new x.constructor(y);
	    return x.s == y.s ? subtract(x, y) : add(x, (y.s = -y.s, y));
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal modulo `y`, truncated to
	   * `precision` significant digits.
	   *
	   */
	  P.modulo = P.mod = function (y) {
	    var q,
	      x = this,
	      Ctor = x.constructor,
	      pr = Ctor.precision;

	    y = new Ctor(y);

	    // x % 0 = NaN
	    if (!y.s) throw Error(decimalError + 'NaN');

	    // Return x if x is 0.
	    if (!x.s) return round(new Ctor(x), pr);

	    // Prevent rounding of intermediate calculations.
	    external = false;
	    q = divide(x, y, 0, 1).times(y);
	    external = true;

	    return x.minus(q);
	  };


	  /*
	   * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
	   * i.e. the base e raised to the power the value of this Decimal, truncated to `precision`
	   * significant digits.
	   *
	   */
	  P.naturalExponential = P.exp = function () {
	    return exp(this);
	  };


	  /*
	   * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
	   * truncated to `precision` significant digits.
	   *
	   */
	  P.naturalLogarithm = P.ln = function () {
	    return ln(this);
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
	   * -1.
	   *
	   */
	  P.negated = P.neg = function () {
	    var x = new this.constructor(this);
	    x.s = -x.s || 0;
	    return x;
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal plus `y`, truncated to
	   * `precision` significant digits.
	   *
	   */
	  P.plus = P.add = function (y) {
	    var x = this;
	    y = new x.constructor(y);
	    return x.s == y.s ? add(x, y) : subtract(x, (y.s = -y.s, y));
	  };


	  /*
	   * Return the number of significant digits of the value of this Decimal.
	   *
	   * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
	   *
	   */
	  P.precision = P.sd = function (z) {
	    var e, sd, w,
	      x = this;

	    if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);

	    e = getBase10Exponent(x) + 1;
	    w = x.d.length - 1;
	    sd = w * LOG_BASE + 1;
	    w = x.d[w];

	    // If non-zero...
	    if (w) {

	      // Subtract the number of trailing zeros of the last word.
	      for (; w % 10 == 0; w /= 10) sd--;

	      // Add the number of digits of the first word.
	      for (w = x.d[0]; w >= 10; w /= 10) sd++;
	    }

	    return z && e > sd ? e : sd;
	  };


	  /*
	   * Return a new Decimal whose value is the square root of this Decimal, truncated to `precision`
	   * significant digits.
	   *
	   */
	  P.squareRoot = P.sqrt = function () {
	    var e, n, pr, r, s, t, wpr,
	      x = this,
	      Ctor = x.constructor;

	    // Negative or zero?
	    if (x.s < 1) {
	      if (!x.s) return new Ctor(0);

	      // sqrt(-x) = NaN
	      throw Error(decimalError + 'NaN');
	    }

	    e = getBase10Exponent(x);
	    external = false;

	    // Initial estimate.
	    s = Math.sqrt(+x);

	    // Math.sqrt underflow/overflow?
	    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
	    if (s == 0 || s == 1 / 0) {
	      n = digitsToString(x.d);
	      if ((n.length + e) % 2 == 0) n += '0';
	      s = Math.sqrt(n);
	      e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);

	      if (s == 1 / 0) {
	        n = '5e' + e;
	      } else {
	        n = s.toExponential();
	        n = n.slice(0, n.indexOf('e') + 1) + e;
	      }

	      r = new Ctor(n);
	    } else {
	      r = new Ctor(s.toString());
	    }

	    pr = Ctor.precision;
	    s = wpr = pr + 3;

	    // Newton-Raphson iteration.
	    for (;;) {
	      t = r;
	      r = t.plus(divide(x, t, wpr + 2)).times(0.5);

	      if (digitsToString(t.d).slice(0, wpr) === (n = digitsToString(r.d)).slice(0, wpr)) {
	        n = n.slice(wpr - 3, wpr + 1);

	        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
	        // 4999, i.e. approaching a rounding boundary, continue the iteration.
	        if (s == wpr && n == '4999') {

	          // On the first iteration only, check to see if rounding up gives the exact result as the
	          // nines may infinitely repeat.
	          round(t, pr + 1, 0);

	          if (t.times(t).eq(x)) {
	            r = t;
	            break;
	          }
	        } else if (n != '9999') {
	          break;
	        }

	        wpr += 4;
	      }
	    }

	    external = true;

	    return round(r, pr);
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal times `y`, truncated to
	   * `precision` significant digits.
	   *
	   */
	  P.times = P.mul = function (y) {
	    var carry, e, i, k, r, rL, t, xdL, ydL,
	      x = this,
	      Ctor = x.constructor,
	      xd = x.d,
	      yd = (y = new Ctor(y)).d;

	    // Return 0 if either is 0.
	    if (!x.s || !y.s) return new Ctor(0);

	    y.s *= x.s;
	    e = x.e + y.e;
	    xdL = xd.length;
	    ydL = yd.length;

	    // Ensure xd points to the longer array.
	    if (xdL < ydL) {
	      r = xd;
	      xd = yd;
	      yd = r;
	      rL = xdL;
	      xdL = ydL;
	      ydL = rL;
	    }

	    // Initialise the result array with zeros.
	    r = [];
	    rL = xdL + ydL;
	    for (i = rL; i--;) r.push(0);

	    // Multiply!
	    for (i = ydL; --i >= 0;) {
	      carry = 0;
	      for (k = xdL + i; k > i;) {
	        t = r[k] + yd[i] * xd[k - i - 1] + carry;
	        r[k--] = t % BASE | 0;
	        carry = t / BASE | 0;
	      }

	      r[k] = (r[k] + carry) % BASE | 0;
	    }

	    // Remove trailing zeros.
	    for (; !r[--rL];) r.pop();

	    if (carry) ++e;
	    else r.shift();

	    y.d = r;
	    y.e = e;

	    return external ? round(y, Ctor.precision) : y;
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
	   * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
	   *
	   * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
	   *
	   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   */
	  P.toDecimalPlaces = P.todp = function (dp, rm) {
	    var x = this,
	      Ctor = x.constructor;

	    x = new Ctor(x);
	    if (dp === void 0) return x;

	    checkInt32(dp, 0, MAX_DIGITS);

	    if (rm === void 0) rm = Ctor.rounding;
	    else checkInt32(rm, 0, 8);

	    return round(x, dp + getBase10Exponent(x) + 1, rm);
	  };


	  /*
	   * Return a string representing the value of this Decimal in exponential notation rounded to
	   * `dp` fixed decimal places using rounding mode `rounding`.
	   *
	   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   */
	  P.toExponential = function (dp, rm) {
	    var str,
	      x = this,
	      Ctor = x.constructor;

	    if (dp === void 0) {
	      str = toString(x, true);
	    } else {
	      checkInt32(dp, 0, MAX_DIGITS);

	      if (rm === void 0) rm = Ctor.rounding;
	      else checkInt32(rm, 0, 8);

	      x = round(new Ctor(x), dp + 1, rm);
	      str = toString(x, true, dp + 1);
	    }

	    return str;
	  };


	  /*
	   * Return a string representing the value of this Decimal in normal (fixed-point) notation to
	   * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
	   * omitted.
	   *
	   * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
	   *
	   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
	   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
	   * (-0).toFixed(3) is '0.000'.
	   * (-0.5).toFixed(0) is '-0'.
	   *
	   */
	  P.toFixed = function (dp, rm) {
	    var str, y,
	      x = this,
	      Ctor = x.constructor;

	    if (dp === void 0) return toString(x);

	    checkInt32(dp, 0, MAX_DIGITS);

	    if (rm === void 0) rm = Ctor.rounding;
	    else checkInt32(rm, 0, 8);

	    y = round(new Ctor(x), dp + getBase10Exponent(x) + 1, rm);
	    str = toString(y.abs(), false, dp + getBase10Exponent(y) + 1);

	    // To determine whether to add the minus sign look at the value before it was rounded,
	    // i.e. look at `x` rather than `y`.
	    return x.isneg() && !x.isZero() ? '-' + str : str;
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
	   * rounding mode `rounding`.
	   *
	   */
	  P.toInteger = P.toint = function () {
	    var x = this,
	      Ctor = x.constructor;
	    return round(new Ctor(x), getBase10Exponent(x) + 1, Ctor.rounding);
	  };


	  /*
	   * Return the value of this Decimal converted to a number primitive.
	   *
	   */
	  P.toNumber = function () {
	    return +this;
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal raised to the power `y`,
	   * truncated to `precision` significant digits.
	   *
	   * For non-integer or very large exponents pow(x, y) is calculated using
	   *
	   *   x^y = exp(y*ln(x))
	   *
	   * The maximum error is 1 ulp (unit in last place).
	   *
	   * y {number|string|Decimal} The power to which to raise this Decimal.
	   *
	   */
	  P.toPower = P.pow = function (y) {
	    var e, k, pr, r, sign, yIsInt,
	      x = this,
	      Ctor = x.constructor,
	      guard = 12,
	      yn = +(y = new Ctor(y));

	    // pow(x, 0) = 1
	    if (!y.s) return new Ctor(ONE);

	    x = new Ctor(x);

	    // pow(0, y > 0) = 0
	    // pow(0, y < 0) = Infinity
	    if (!x.s) {
	      if (y.s < 1) throw Error(decimalError + 'Infinity');
	      return x;
	    }

	    // pow(1, y) = 1
	    if (x.eq(ONE)) return x;

	    pr = Ctor.precision;

	    // pow(x, 1) = x
	    if (y.eq(ONE)) return round(x, pr);

	    e = y.e;
	    k = y.d.length - 1;
	    yIsInt = e >= k;
	    sign = x.s;

	    if (!yIsInt) {

	      // pow(x < 0, y non-integer) = NaN
	      if (sign < 0) throw Error(decimalError + 'NaN');

	    // If y is a small integer use the 'exponentiation by squaring' algorithm.
	    } else if ((k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
	      r = new Ctor(ONE);

	      // Max k of 9007199254740991 takes 53 loop iterations.
	      // Maximum digits array length; leaves [28, 34] guard digits.
	      e = Math.ceil(pr / LOG_BASE + 4);

	      external = false;

	      for (;;) {
	        if (k % 2) {
	          r = r.times(x);
	          truncate(r.d, e);
	        }

	        k = mathfloor(k / 2);
	        if (k === 0) break;

	        x = x.times(x);
	        truncate(x.d, e);
	      }

	      external = true;

	      return y.s < 0 ? new Ctor(ONE).div(r) : round(r, pr);
	    }

	    // Result is negative if x is negative and the last digit of integer y is odd.
	    sign = sign < 0 && y.d[Math.max(e, k)] & 1 ? -1 : 1;

	    x.s = 1;
	    external = false;
	    r = y.times(ln(x, pr + guard));
	    external = true;
	    r = exp(r);
	    r.s = sign;

	    return r;
	  };


	  /*
	   * Return a string representing the value of this Decimal rounded to `sd` significant digits
	   * using rounding mode `rounding`.
	   *
	   * Return exponential notation if `sd` is less than the number of digits necessary to represent
	   * the integer part of the value in normal notation.
	   *
	   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   */
	  P.toPrecision = function (sd, rm) {
	    var e, str,
	      x = this,
	      Ctor = x.constructor;

	    if (sd === void 0) {
	      e = getBase10Exponent(x);
	      str = toString(x, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
	    } else {
	      checkInt32(sd, 1, MAX_DIGITS);

	      if (rm === void 0) rm = Ctor.rounding;
	      else checkInt32(rm, 0, 8);

	      x = round(new Ctor(x), sd, rm);
	      e = getBase10Exponent(x);
	      str = toString(x, sd <= e || e <= Ctor.toExpNeg, sd);
	    }

	    return str;
	  };


	  /*
	   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
	   * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
	   * omitted.
	   *
	   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   */
	  P.toSignificantDigits = P.tosd = function (sd, rm) {
	    var x = this,
	      Ctor = x.constructor;

	    if (sd === void 0) {
	      sd = Ctor.precision;
	      rm = Ctor.rounding;
	    } else {
	      checkInt32(sd, 1, MAX_DIGITS);

	      if (rm === void 0) rm = Ctor.rounding;
	      else checkInt32(rm, 0, 8);
	    }

	    return round(new Ctor(x), sd, rm);
	  };


	  /*
	   * Return a string representing the value of this Decimal.
	   *
	   * Return exponential notation if this Decimal has a positive exponent equal to or greater than
	   * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
	   *
	   */
	  P.toString = P.valueOf = P.val = P.toJSON = function () {
	    var x = this,
	      e = getBase10Exponent(x),
	      Ctor = x.constructor;

	    return toString(x, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
	  };


	  // Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.


	  /*
	   *  add                 P.minus, P.plus
	   *  checkInt32          P.todp, P.toExponential, P.toFixed, P.toPrecision, P.tosd
	   *  digitsToString      P.log, P.sqrt, P.pow, toString, exp, ln
	   *  divide              P.div, P.idiv, P.log, P.mod, P.sqrt, exp, ln
	   *  exp                 P.exp, P.pow
	   *  getBase10Exponent   P.exponent, P.sd, P.toint, P.sqrt, P.todp, P.toFixed, P.toPrecision,
	   *                      P.toString, divide, round, toString, exp, ln
	   *  getLn10             P.log, ln
	   *  getZeroString       digitsToString, toString
	   *  ln                  P.log, P.ln, P.pow, exp
	   *  parseDecimal        Decimal
	   *  round               P.abs, P.idiv, P.log, P.minus, P.mod, P.neg, P.plus, P.toint, P.sqrt,
	   *                      P.times, P.todp, P.toExponential, P.toFixed, P.pow, P.toPrecision, P.tosd,
	   *                      divide, getLn10, exp, ln
	   *  subtract            P.minus, P.plus
	   *  toString            P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf
	   *  truncate            P.pow
	   *
	   *  Throws:             P.log, P.mod, P.sd, P.sqrt, P.pow,  checkInt32, divide, round,
	   *                      getLn10, exp, ln, parseDecimal, Decimal, config
	   */


	  function add(x, y) {
	    var carry, d, e, i, k, len, xd, yd,
	      Ctor = x.constructor,
	      pr = Ctor.precision;

	    // If either is zero...
	    if (!x.s || !y.s) {

	      // Return x if y is zero.
	      // Return y if y is non-zero.
	      if (!y.s) y = new Ctor(x);
	      return external ? round(y, pr) : y;
	    }

	    xd = x.d;
	    yd = y.d;

	    // x and y are finite, non-zero numbers with the same sign.

	    k = x.e;
	    e = y.e;
	    xd = xd.slice();
	    i = k - e;

	    // If base 1e7 exponents differ...
	    if (i) {
	      if (i < 0) {
	        d = xd;
	        i = -i;
	        len = yd.length;
	      } else {
	        d = yd;
	        e = k;
	        len = xd.length;
	      }

	      // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
	      k = Math.ceil(pr / LOG_BASE);
	      len = k > len ? k + 1 : len + 1;

	      if (i > len) {
	        i = len;
	        d.length = 1;
	      }

	      // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
	      d.reverse();
	      for (; i--;) d.push(0);
	      d.reverse();
	    }

	    len = xd.length;
	    i = yd.length;

	    // If yd is longer than xd, swap xd and yd so xd points to the longer array.
	    if (len - i < 0) {
	      i = len;
	      d = yd;
	      yd = xd;
	      xd = d;
	    }

	    // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
	    for (carry = 0; i;) {
	      carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
	      xd[i] %= BASE;
	    }

	    if (carry) {
	      xd.unshift(carry);
	      ++e;
	    }

	    // Remove trailing zeros.
	    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
	    for (len = xd.length; xd[--len] == 0;) xd.pop();

	    y.d = xd;
	    y.e = e;

	    return external ? round(y, pr) : y;
	  }


	  function checkInt32(i, min, max) {
	    if (i !== ~~i || i < min || i > max) {
	      throw Error(invalidArgument + i);
	    }
	  }


	  function digitsToString(d) {
	    var i, k, ws,
	      indexOfLastWord = d.length - 1,
	      str = '',
	      w = d[0];

	    if (indexOfLastWord > 0) {
	      str += w;
	      for (i = 1; i < indexOfLastWord; i++) {
	        ws = d[i] + '';
	        k = LOG_BASE - ws.length;
	        if (k) str += getZeroString(k);
	        str += ws;
	      }

	      w = d[i];
	      ws = w + '';
	      k = LOG_BASE - ws.length;
	      if (k) str += getZeroString(k);
	    } else if (w === 0) {
	      return '0';
	    }

	    // Remove trailing zeros of last w.
	    for (; w % 10 === 0;) w /= 10;

	    return str + w;
	  }


	  var divide = (function () {

	    // Assumes non-zero x and k, and hence non-zero result.
	    function multiplyInteger(x, k) {
	      var temp,
	        carry = 0,
	        i = x.length;

	      for (x = x.slice(); i--;) {
	        temp = x[i] * k + carry;
	        x[i] = temp % BASE | 0;
	        carry = temp / BASE | 0;
	      }

	      if (carry) x.unshift(carry);

	      return x;
	    }

	    function compare(a, b, aL, bL) {
	      var i, r;

	      if (aL != bL) {
	        r = aL > bL ? 1 : -1;
	      } else {
	        for (i = r = 0; i < aL; i++) {
	          if (a[i] != b[i]) {
	            r = a[i] > b[i] ? 1 : -1;
	            break;
	          }
	        }
	      }

	      return r;
	    }

	    function subtract(a, b, aL) {
	      var i = 0;

	      // Subtract b from a.
	      for (; aL--;) {
	        a[aL] -= i;
	        i = a[aL] < b[aL] ? 1 : 0;
	        a[aL] = i * BASE + a[aL] - b[aL];
	      }

	      // Remove leading zeros.
	      for (; !a[0] && a.length > 1;) a.shift();
	    }

	    return function (x, y, pr, dp) {
	      var cmp, e, i, k, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz,
	        Ctor = x.constructor,
	        sign = x.s == y.s ? 1 : -1,
	        xd = x.d,
	        yd = y.d;

	      // Either 0?
	      if (!x.s) return new Ctor(x);
	      if (!y.s) throw Error(decimalError + 'Division by zero');

	      e = x.e - y.e;
	      yL = yd.length;
	      xL = xd.length;
	      q = new Ctor(sign);
	      qd = q.d = [];

	      // Result exponent may be one less than e.
	      for (i = 0; yd[i] == (xd[i] || 0); ) ++i;
	      if (yd[i] > (xd[i] || 0)) --e;

	      if (pr == null) {
	        sd = pr = Ctor.precision;
	      } else if (dp) {
	        sd = pr + (getBase10Exponent(x) - getBase10Exponent(y)) + 1;
	      } else {
	        sd = pr;
	      }

	      if (sd < 0) return new Ctor(0);

	      // Convert precision in number of base 10 digits to base 1e7 digits.
	      sd = sd / LOG_BASE + 2 | 0;
	      i = 0;

	      // divisor < 1e7
	      if (yL == 1) {
	        k = 0;
	        yd = yd[0];
	        sd++;

	        // k is the carry.
	        for (; (i < xL || k) && sd--; i++) {
	          t = k * BASE + (xd[i] || 0);
	          qd[i] = t / yd | 0;
	          k = t % yd | 0;
	        }

	      // divisor >= 1e7
	      } else {

	        // Normalise xd and yd so highest order digit of yd is >= BASE/2
	        k = BASE / (yd[0] + 1) | 0;

	        if (k > 1) {
	          yd = multiplyInteger(yd, k);
	          xd = multiplyInteger(xd, k);
	          yL = yd.length;
	          xL = xd.length;
	        }

	        xi = yL;
	        rem = xd.slice(0, yL);
	        remL = rem.length;

	        // Add zeros to make remainder as long as divisor.
	        for (; remL < yL;) rem[remL++] = 0;

	        yz = yd.slice();
	        yz.unshift(0);
	        yd0 = yd[0];

	        if (yd[1] >= BASE / 2) ++yd0;

	        do {
	          k = 0;

	          // Compare divisor and remainder.
	          cmp = compare(yd, rem, yL, remL);

	          // If divisor < remainder.
	          if (cmp < 0) {

	            // Calculate trial digit, k.
	            rem0 = rem[0];
	            if (yL != remL) rem0 = rem0 * BASE + (rem[1] || 0);

	            // k will be how many times the divisor goes into the current remainder.
	            k = rem0 / yd0 | 0;

	            //  Algorithm:
	            //  1. product = divisor * trial digit (k)
	            //  2. if product > remainder: product -= divisor, k--
	            //  3. remainder -= product
	            //  4. if product was < remainder at 2:
	            //    5. compare new remainder and divisor
	            //    6. If remainder > divisor: remainder -= divisor, k++

	            if (k > 1) {
	              if (k >= BASE) k = BASE - 1;

	              // product = divisor * trial digit.
	              prod = multiplyInteger(yd, k);
	              prodL = prod.length;
	              remL = rem.length;

	              // Compare product and remainder.
	              cmp = compare(prod, rem, prodL, remL);

	              // product > remainder.
	              if (cmp == 1) {
	                k--;

	                // Subtract divisor from product.
	                subtract(prod, yL < prodL ? yz : yd, prodL);
	              }
	            } else {

	              // cmp is -1.
	              // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
	              // to avoid it. If k is 1 there is a need to compare yd and rem again below.
	              if (k == 0) cmp = k = 1;
	              prod = yd.slice();
	            }

	            prodL = prod.length;
	            if (prodL < remL) prod.unshift(0);

	            // Subtract product from remainder.
	            subtract(rem, prod, remL);

	            // If product was < previous remainder.
	            if (cmp == -1) {
	              remL = rem.length;

	              // Compare divisor and new remainder.
	              cmp = compare(yd, rem, yL, remL);

	              // If divisor < new remainder, subtract divisor from remainder.
	              if (cmp < 1) {
	                k++;

	                // Subtract divisor from remainder.
	                subtract(rem, yL < remL ? yz : yd, remL);
	              }
	            }

	            remL = rem.length;
	          } else if (cmp === 0) {
	            k++;
	            rem = [0];
	          }    // if cmp === 1, k will be 0

	          // Add the next digit, k, to the result array.
	          qd[i++] = k;

	          // Update the remainder.
	          if (cmp && rem[0]) {
	            rem[remL++] = xd[xi] || 0;
	          } else {
	            rem = [xd[xi]];
	            remL = 1;
	          }

	        } while ((xi++ < xL || rem[0] !== void 0) && sd--);
	      }

	      // Leading zero?
	      if (!qd[0]) qd.shift();

	      q.e = e;

	      return round(q, dp ? pr + getBase10Exponent(q) + 1 : pr);
	    };
	  })();


	  /*
	   * Return a new Decimal whose value is the natural exponential of `x` truncated to `sd`
	   * significant digits.
	   *
	   * Taylor/Maclaurin series.
	   *
	   * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
	   *
	   * Argument reduction:
	   *   Repeat x = x / 32, k += 5, until |x| < 0.1
	   *   exp(x) = exp(x / 2^k)^(2^k)
	   *
	   * Previously, the argument was initially reduced by
	   * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
	   * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
	   * found to be slower than just dividing repeatedly by 32 as above.
	   *
	   * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
	   *
	   *  exp(x) is non-terminating for any finite, non-zero x.
	   *
	   */
	  function exp(x, sd) {
	    var denominator, guard, pow, sum, t, wpr,
	      i = 0,
	      k = 0,
	      Ctor = x.constructor,
	      pr = Ctor.precision;

	    if (getBase10Exponent(x) > 16) throw Error(exponentOutOfRange + getBase10Exponent(x));

	    // exp(0) = 1
	    if (!x.s) return new Ctor(ONE);

	    if (sd == null) {
	      external = false;
	      wpr = pr;
	    } else {
	      wpr = sd;
	    }

	    t = new Ctor(0.03125);

	    while (x.abs().gte(0.1)) {
	      x = x.times(t);    // x = x / 2^5
	      k += 5;
	    }

	    // Estimate the precision increase necessary to ensure the first 4 rounding digits are correct.
	    guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
	    wpr += guard;
	    denominator = pow = sum = new Ctor(ONE);
	    Ctor.precision = wpr;

	    for (;;) {
	      pow = round(pow.times(x), wpr);
	      denominator = denominator.times(++i);
	      t = sum.plus(divide(pow, denominator, wpr));

	      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
	        while (k--) sum = round(sum.times(sum), wpr);
	        Ctor.precision = pr;
	        return sd == null ? (external = true, round(sum, pr)) : sum;
	      }

	      sum = t;
	    }
	  }


	  // Calculate the base 10 exponent from the base 1e7 exponent.
	  function getBase10Exponent(x) {
	    var e = x.e * LOG_BASE,
	      w = x.d[0];

	    // Add the number of digits of the first word of the digits array.
	    for (; w >= 10; w /= 10) e++;
	    return e;
	  }


	  function getLn10(Ctor, sd, pr) {

	    if (sd > Ctor.LN10.sd()) {


	      // Reset global state in case the exception is caught.
	      external = true;
	      if (pr) Ctor.precision = pr;
	      throw Error(decimalError + 'LN10 precision limit exceeded');
	    }

	    return round(new Ctor(Ctor.LN10), sd);
	  }


	  function getZeroString(k) {
	    var zs = '';
	    for (; k--;) zs += '0';
	    return zs;
	  }


	  /*
	   * Return a new Decimal whose value is the natural logarithm of `x` truncated to `sd` significant
	   * digits.
	   *
	   *  ln(n) is non-terminating (n != 1)
	   *
	   */
	  function ln(y, sd) {
	    var c, c0, denominator, e, numerator, sum, t, wpr, x2,
	      n = 1,
	      guard = 10,
	      x = y,
	      xd = x.d,
	      Ctor = x.constructor,
	      pr = Ctor.precision;

	    // ln(-x) = NaN
	    // ln(0) = -Infinity
	    if (x.s < 1) throw Error(decimalError + (x.s ? 'NaN' : '-Infinity'));

	    // ln(1) = 0
	    if (x.eq(ONE)) return new Ctor(0);

	    if (sd == null) {
	      external = false;
	      wpr = pr;
	    } else {
	      wpr = sd;
	    }

	    if (x.eq(10)) {
	      if (sd == null) external = true;
	      return getLn10(Ctor, wpr);
	    }

	    wpr += guard;
	    Ctor.precision = wpr;
	    c = digitsToString(xd);
	    c0 = c.charAt(0);
	    e = getBase10Exponent(x);

	    if (Math.abs(e) < 1.5e15) {

	      // Argument reduction.
	      // The series converges faster the closer the argument is to 1, so using
	      // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
	      // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
	      // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
	      // later be divided by this number, then separate out the power of 10 using
	      // ln(a*10^b) = ln(a) + b*ln(10).

	      // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
	      //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
	      // max n is 6 (gives 0.7 - 1.3)
	      while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
	        x = x.times(y);
	        c = digitsToString(x.d);
	        c0 = c.charAt(0);
	        n++;
	      }

	      e = getBase10Exponent(x);

	      if (c0 > 1) {
	        x = new Ctor('0.' + c);
	        e++;
	      } else {
	        x = new Ctor(c0 + '.' + c.slice(1));
	      }
	    } else {

	      // The argument reduction method above may result in overflow if the argument y is a massive
	      // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
	      // function using ln(x*10^e) = ln(x) + e*ln(10).
	      t = getLn10(Ctor, wpr + 2, pr).times(e + '');
	      x = ln(new Ctor(c0 + '.' + c.slice(1)), wpr - guard).plus(t);

	      Ctor.precision = pr;
	      return sd == null ? (external = true, round(x, pr)) : x;
	    }

	    // x is reduced to a value near 1.

	    // Taylor series.
	    // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
	    // where x = (y - 1)/(y + 1)    (|x| < 1)
	    sum = numerator = x = divide(x.minus(ONE), x.plus(ONE), wpr);
	    x2 = round(x.times(x), wpr);
	    denominator = 3;

	    for (;;) {
	      numerator = round(numerator.times(x2), wpr);
	      t = sum.plus(divide(numerator, new Ctor(denominator), wpr));

	      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
	        sum = sum.times(2);

	        // Reverse the argument reduction.
	        if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
	        sum = divide(sum, new Ctor(n), wpr);

	        Ctor.precision = pr;
	        return sd == null ? (external = true, round(sum, pr)) : sum;
	      }

	      sum = t;
	      denominator += 2;
	    }
	  }


	  /*
	   * Parse the value of a new Decimal `x` from string `str`.
	   */
	  function parseDecimal(x, str) {
	    var e, i, len;

	    // Decimal point?
	    if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

	    // Exponential form?
	    if ((i = str.search(/e/i)) > 0) {

	      // Determine exponent.
	      if (e < 0) e = i;
	      e += +str.slice(i + 1);
	      str = str.substring(0, i);
	    } else if (e < 0) {

	      // Integer.
	      e = str.length;
	    }

	    // Determine leading zeros.
	    for (i = 0; str.charCodeAt(i) === 48;) ++i;

	    // Determine trailing zeros.
	    for (len = str.length; str.charCodeAt(len - 1) === 48;) --len;
	    str = str.slice(i, len);

	    if (str) {
	      len -= i;
	      e = e - i - 1;
	      x.e = mathfloor(e / LOG_BASE);
	      x.d = [];

	      // Transform base

	      // e is the base 10 exponent.
	      // i is where to slice str to get the first word of the digits array.
	      i = (e + 1) % LOG_BASE;
	      if (e < 0) i += LOG_BASE;

	      if (i < len) {
	        if (i) x.d.push(+str.slice(0, i));
	        for (len -= LOG_BASE; i < len;) x.d.push(+str.slice(i, i += LOG_BASE));
	        str = str.slice(i);
	        i = LOG_BASE - str.length;
	      } else {
	        i -= len;
	      }

	      for (; i--;) str += '0';
	      x.d.push(+str);

	      if (external && (x.e > MAX_E || x.e < -MAX_E)) throw Error(exponentOutOfRange + e);
	    } else {

	      // Zero.
	      x.s = 0;
	      x.e = 0;
	      x.d = [0];
	    }

	    return x;
	  }


	  /*
	   * Round `x` to `sd` significant digits, using rounding mode `rm` if present (truncate otherwise).
	   */
	   function round(x, sd, rm) {
	    var i, j, k, n, rd, doRound, w, xdi,
	      xd = x.d;

	    // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
	    // w: the word of xd which contains the rounding digit, a base 1e7 number.
	    // xdi: the index of w within xd.
	    // n: the number of digits of w.
	    // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
	    // they had leading zeros)
	    // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).

	    // Get the length of the first word of the digits array xd.
	    for (n = 1, k = xd[0]; k >= 10; k /= 10) n++;
	    i = sd - n;

	    // Is the rounding digit in the first word of xd?
	    if (i < 0) {
	      i += LOG_BASE;
	      j = sd;
	      w = xd[xdi = 0];
	    } else {
	      xdi = Math.ceil((i + 1) / LOG_BASE);
	      k = xd.length;
	      if (xdi >= k) return x;
	      w = k = xd[xdi];

	      // Get the number of digits of w.
	      for (n = 1; k >= 10; k /= 10) n++;

	      // Get the index of rd within w.
	      i %= LOG_BASE;

	      // Get the index of rd within w, adjusted for leading zeros.
	      // The number of leading zeros of w is given by LOG_BASE - n.
	      j = i - LOG_BASE + n;
	    }

	    if (rm !== void 0) {
	      k = mathpow(10, n - j - 1);

	      // Get the rounding digit at index j of w.
	      rd = w / k % 10 | 0;

	      // Are there any non-zero digits after the rounding digit?
	      doRound = sd < 0 || xd[xdi + 1] !== void 0 || w % k;

	      // The expression `w % mathpow(10, n - j - 1)` returns all the digits of w to the right of the
	      // digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression will give
	      // 714.

	      doRound = rm < 4
	        ? (rd || doRound) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
	        : rd > 5 || rd == 5 && (rm == 4 || doRound || rm == 6 &&

	          // Check whether the digit to the left of the rounding digit is odd.
	          ((i > 0 ? j > 0 ? w / mathpow(10, n - j) : 0 : xd[xdi - 1]) % 10) & 1 ||
	            rm == (x.s < 0 ? 8 : 7));
	    }

	    if (sd < 1 || !xd[0]) {
	      if (doRound) {
	        k = getBase10Exponent(x);
	        xd.length = 1;

	        // Convert sd to decimal places.
	        sd = sd - k - 1;

	        // 1, 0.1, 0.01, 0.001, 0.0001 etc.
	        xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
	        x.e = mathfloor(-sd / LOG_BASE) || 0;
	      } else {
	        xd.length = 1;

	        // Zero.
	        xd[0] = x.e = x.s = 0;
	      }

	      return x;
	    }

	    // Remove excess digits.
	    if (i == 0) {
	      xd.length = xdi;
	      k = 1;
	      xdi--;
	    } else {
	      xd.length = xdi + 1;
	      k = mathpow(10, LOG_BASE - i);

	      // E.g. 56700 becomes 56000 if 7 is the rounding digit.
	      // j > 0 means i > number of leading zeros of w.
	      xd[xdi] = j > 0 ? (w / mathpow(10, n - j) % mathpow(10, j) | 0) * k : 0;
	    }

	    if (doRound) {
	      for (;;) {

	        // Is the digit to be rounded up in the first word of xd?
	        if (xdi == 0) {
	          if ((xd[0] += k) == BASE) {
	            xd[0] = 1;
	            ++x.e;
	          }

	          break;
	        } else {
	          xd[xdi] += k;
	          if (xd[xdi] != BASE) break;
	          xd[xdi--] = 0;
	          k = 1;
	        }
	      }
	    }

	    // Remove trailing zeros.
	    for (i = xd.length; xd[--i] === 0;) xd.pop();

	    if (external && (x.e > MAX_E || x.e < -MAX_E)) {
	      throw Error(exponentOutOfRange + getBase10Exponent(x));
	    }

	    return x;
	  }


	  function subtract(x, y) {
	    var d, e, i, j, k, len, xd, xe, xLTy, yd,
	      Ctor = x.constructor,
	      pr = Ctor.precision;

	    // Return y negated if x is zero.
	    // Return x if y is zero and x is non-zero.
	    if (!x.s || !y.s) {
	      if (y.s) y.s = -y.s;
	      else y = new Ctor(x);
	      return external ? round(y, pr) : y;
	    }

	    xd = x.d;
	    yd = y.d;

	    // x and y are non-zero numbers with the same sign.

	    e = y.e;
	    xe = x.e;
	    xd = xd.slice();
	    k = xe - e;

	    // If exponents differ...
	    if (k) {
	      xLTy = k < 0;

	      if (xLTy) {
	        d = xd;
	        k = -k;
	        len = yd.length;
	      } else {
	        d = yd;
	        e = xe;
	        len = xd.length;
	      }

	      // Numbers with massively different exponents would result in a very high number of zeros
	      // needing to be prepended, but this can be avoided while still ensuring correct rounding by
	      // limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
	      i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;

	      if (k > i) {
	        k = i;
	        d.length = 1;
	      }

	      // Prepend zeros to equalise exponents.
	      d.reverse();
	      for (i = k; i--;) d.push(0);
	      d.reverse();

	    // Base 1e7 exponents equal.
	    } else {

	      // Check digits to determine which is the bigger number.

	      i = xd.length;
	      len = yd.length;
	      xLTy = i < len;
	      if (xLTy) len = i;

	      for (i = 0; i < len; i++) {
	        if (xd[i] != yd[i]) {
	          xLTy = xd[i] < yd[i];
	          break;
	        }
	      }

	      k = 0;
	    }

	    if (xLTy) {
	      d = xd;
	      xd = yd;
	      yd = d;
	      y.s = -y.s;
	    }

	    len = xd.length;

	    // Append zeros to xd if shorter.
	    // Don't add zeros to yd if shorter as subtraction only needs to start at yd length.
	    for (i = yd.length - len; i > 0; --i) xd[len++] = 0;

	    // Subtract yd from xd.
	    for (i = yd.length; i > k;) {
	      if (xd[--i] < yd[i]) {
	        for (j = i; j && xd[--j] === 0;) xd[j] = BASE - 1;
	        --xd[j];
	        xd[i] += BASE;
	      }

	      xd[i] -= yd[i];
	    }

	    // Remove trailing zeros.
	    for (; xd[--len] === 0;) xd.pop();

	    // Remove leading zeros and adjust exponent accordingly.
	    for (; xd[0] === 0; xd.shift()) --e;

	    // Zero?
	    if (!xd[0]) return new Ctor(0);

	    y.d = xd;
	    y.e = e;

	    //return external && xd.length >= pr / LOG_BASE ? round(y, pr) : y;
	    return external ? round(y, pr) : y;
	  }


	  function toString(x, isExp, sd) {
	    var k,
	      e = getBase10Exponent(x),
	      str = digitsToString(x.d),
	      len = str.length;

	    if (isExp) {
	      if (sd && (k = sd - len) > 0) {
	        str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
	      } else if (len > 1) {
	        str = str.charAt(0) + '.' + str.slice(1);
	      }

	      str = str + (e < 0 ? 'e' : 'e+') + e;
	    } else if (e < 0) {
	      str = '0.' + getZeroString(-e - 1) + str;
	      if (sd && (k = sd - len) > 0) str += getZeroString(k);
	    } else if (e >= len) {
	      str += getZeroString(e + 1 - len);
	      if (sd && (k = sd - e - 1) > 0) str = str + '.' + getZeroString(k);
	    } else {
	      if ((k = e + 1) < len) str = str.slice(0, k) + '.' + str.slice(k);
	      if (sd && (k = sd - len) > 0) {
	        if (e + 1 === len) str += '.';
	        str += getZeroString(k);
	      }
	    }

	    return x.s < 0 ? '-' + str : str;
	  }


	  // Does not strip trailing zeros.
	  function truncate(arr, len) {
	    if (arr.length > len) {
	      arr.length = len;
	      return true;
	    }
	  }


	  // Decimal methods


	  /*
	   *  clone
	   *  config/set
	   */


	  /*
	   * Create and return a Decimal constructor with the same configuration properties as this Decimal
	   * constructor.
	   *
	   */
	  function clone(obj) {
	    var i, p, ps;

	    /*
	     * The Decimal constructor and exported function.
	     * Return a new Decimal instance.
	     *
	     * value {number|string|Decimal} A numeric value.
	     *
	     */
	    function Decimal(value) {
	      var x = this;

	      // Decimal called without new.
	      if (!(x instanceof Decimal)) return new Decimal(value);

	      // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
	      // which points to Object.
	      x.constructor = Decimal;

	      // Duplicate.
	      if (value instanceof Decimal) {
	        x.s = value.s;
	        x.e = value.e;
	        x.d = (value = value.d) ? value.slice() : value;
	        return;
	      }

	      if (typeof value === 'number') {

	        // Reject Infinity/NaN.
	        if (value * 0 !== 0) {
	          throw Error(invalidArgument + value);
	        }

	        if (value > 0) {
	          x.s = 1;
	        } else if (value < 0) {
	          value = -value;
	          x.s = -1;
	        } else {
	          x.s = 0;
	          x.e = 0;
	          x.d = [0];
	          return;
	        }

	        // Fast path for small integers.
	        if (value === ~~value && value < 1e7) {
	          x.e = 0;
	          x.d = [value];
	          return;
	        }

	        return parseDecimal(x, value.toString());
	      } else if (typeof value !== 'string') {
	        throw Error(invalidArgument + value);
	      }

	      // Minus sign?
	      if (value.charCodeAt(0) === 45) {
	        value = value.slice(1);
	        x.s = -1;
	      } else {
	        x.s = 1;
	      }

	      if (isDecimal.test(value)) parseDecimal(x, value);
	      else throw Error(invalidArgument + value);
	    }

	    Decimal.prototype = P;

	    Decimal.ROUND_UP = 0;
	    Decimal.ROUND_DOWN = 1;
	    Decimal.ROUND_CEIL = 2;
	    Decimal.ROUND_FLOOR = 3;
	    Decimal.ROUND_HALF_UP = 4;
	    Decimal.ROUND_HALF_DOWN = 5;
	    Decimal.ROUND_HALF_EVEN = 6;
	    Decimal.ROUND_HALF_CEIL = 7;
	    Decimal.ROUND_HALF_FLOOR = 8;

	    Decimal.clone = clone;
	    Decimal.config = Decimal.set = config;

	    if (obj === void 0) obj = {};
	    if (obj) {
	      ps = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'LN10'];
	      for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
	    }

	    Decimal.config(obj);

	    return Decimal;
	  }


	  /*
	   * Configure global settings for a Decimal constructor.
	   *
	   * `obj` is an object with one or more of the following properties,
	   *
	   *   precision  {number}
	   *   rounding   {number}
	   *   toExpNeg   {number}
	   *   toExpPos   {number}
	   *
	   * E.g. Decimal.config({ precision: 20, rounding: 4 })
	   *
	   */
	  function config(obj) {
	    if (!obj || typeof obj !== 'object') {
	      throw Error(decimalError + 'Object expected');
	    }
	    var i, p, v,
	      ps = [
	        'precision', 1, MAX_DIGITS,
	        'rounding', 0, 8,
	        'toExpNeg', -1 / 0, 0,
	        'toExpPos', 0, 1 / 0
	      ];

	    for (i = 0; i < ps.length; i += 3) {
	      if ((v = obj[p = ps[i]]) !== void 0) {
	        if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
	        else throw Error(invalidArgument + p + ': ' + v);
	      }
	    }

	    if ((v = obj[p = 'LN10']) !== void 0) {
	        if (v == Math.LN10) this[p] = new this(v);
	        else throw Error(invalidArgument + p + ': ' + v);
	    }

	    return this;
	  }


	  // Create and configure initial Decimal constructor.
	  Decimal = clone(Decimal);

	  Decimal['default'] = Decimal.Decimal = Decimal;

	  // Internal constant.
	  ONE = new Decimal(1);


	  // Export.


	  // AMD.
	  if (module.exports) {
	    module.exports = Decimal;

	    // Browser.
	  } else {
	    if (!globalScope) {
	      globalScope = typeof self != 'undefined' && self && self.self == self
	        ? self : Function('return this')();
	    }

	    globalScope.Decimal = Decimal;
	  }
	})(commonjsGlobal);
} (decimal));

var _Decimal = decimal.exports;

var big = {exports: {}};

/*
 *  big.js v5.2.2
 *  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
 *  Copyright (c) 2018 Michael Mclaughlin <M8ch88l@gmail.com>
 *  https://github.com/MikeMcl/big.js/LICENCE
 */

(function (module) {
(function (GLOBAL) {
	  var Big,


	/************************************** EDITABLE DEFAULTS *****************************************/


	    // The default values below must be integers within the stated ranges.

	    /*
	     * The maximum number of decimal places (DP) of the results of operations involving division:
	     * div and sqrt, and pow with negative exponents.
	     */
	    DP = 20,          // 0 to MAX_DP

	    /*
	     * The rounding mode (RM) used when rounding to the above decimal places.
	     *
	     *  0  Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
	     *  1  To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
	     *  2  To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
	     *  3  Away from zero.                                  (ROUND_UP)
	     */
	    RM = 1,             // 0, 1, 2 or 3

	    // The maximum value of DP and Big.DP.
	    MAX_DP = 1E6,       // 0 to 1000000

	    // The maximum magnitude of the exponent argument to the pow method.
	    MAX_POWER = 1E6,    // 1 to 1000000

	    /*
	     * The negative exponent (NE) at and beneath which toString returns exponential notation.
	     * (JavaScript numbers: -7)
	     * -1000000 is the minimum recommended exponent value of a Big.
	     */
	    NE = -7,            // 0 to -1000000

	    /*
	     * The positive exponent (PE) at and above which toString returns exponential notation.
	     * (JavaScript numbers: 21)
	     * 1000000 is the maximum recommended exponent value of a Big.
	     * (This limit is not enforced or checked.)
	     */
	    PE = 21,            // 0 to 1000000


	/**************************************************************************************************/


	    // Error messages.
	    NAME = '[big.js] ',
	    INVALID = NAME + 'Invalid ',
	    INVALID_DP = INVALID + 'decimal places',
	    INVALID_RM = INVALID + 'rounding mode',
	    DIV_BY_ZERO = NAME + 'Division by zero',

	    // The shared prototype object.
	    P = {},
	    UNDEFINED = void 0,
	    NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;


	  /*
	   * Create and return a Big constructor.
	   *
	   */
	  function _Big_() {

	    /*
	     * The Big constructor and exported function.
	     * Create and return a new instance of a Big number object.
	     *
	     * n {number|string|Big} A numeric value.
	     */
	    function Big(n) {
	      var x = this;

	      // Enable constructor usage without new.
	      if (!(x instanceof Big)) return n === UNDEFINED ? _Big_() : new Big(n);

	      // Duplicate.
	      if (n instanceof Big) {
	        x.s = n.s;
	        x.e = n.e;
	        x.c = n.c.slice();
	      } else {
	        parse(x, n);
	      }

	      /*
	       * Retain a reference to this Big constructor, and shadow Big.prototype.constructor which
	       * points to Object.
	       */
	      x.constructor = Big;
	    }

	    Big.prototype = P;
	    Big.DP = DP;
	    Big.RM = RM;
	    Big.NE = NE;
	    Big.PE = PE;
	    Big.version = '5.2.2';

	    return Big;
	  }


	  /*
	   * Parse the number or string value passed to a Big constructor.
	   *
	   * x {Big} A Big number instance.
	   * n {number|string} A numeric value.
	   */
	  function parse(x, n) {
	    var e, i, nl;

	    // Minus zero?
	    if (n === 0 && 1 / n < 0) n = '-0';
	    else if (!NUMERIC.test(n += '')) throw Error(INVALID + 'number');

	    // Determine sign.
	    x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

	    // Decimal point?
	    if ((e = n.indexOf('.')) > -1) n = n.replace('.', '');

	    // Exponential form?
	    if ((i = n.search(/e/i)) > 0) {

	      // Determine exponent.
	      if (e < 0) e = i;
	      e += +n.slice(i + 1);
	      n = n.substring(0, i);
	    } else if (e < 0) {

	      // Integer.
	      e = n.length;
	    }

	    nl = n.length;

	    // Determine leading zeros.
	    for (i = 0; i < nl && n.charAt(i) == '0';) ++i;

	    if (i == nl) {

	      // Zero.
	      x.c = [x.e = 0];
	    } else {

	      // Determine trailing zeros.
	      for (; nl > 0 && n.charAt(--nl) == '0';);
	      x.e = e - i - 1;
	      x.c = [];

	      // Convert string to array of digits without leading/trailing zeros.
	      for (e = 0; i <= nl;) x.c[e++] = +n.charAt(i++);
	    }

	    return x;
	  }


	  /*
	   * Round Big x to a maximum of dp decimal places using rounding mode rm.
	   * Called by stringify, P.div, P.round and P.sqrt.
	   *
	   * x {Big} The Big to round.
	   * dp {number} Integer, 0 to MAX_DP inclusive.
	   * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
	   * [more] {boolean} Whether the result of division was truncated.
	   */
	  function round(x, dp, rm, more) {
	    var xc = x.c,
	      i = x.e + dp + 1;

	    if (i < xc.length) {
	      if (rm === 1) {

	        // xc[i] is the digit after the digit that may be rounded up.
	        more = xc[i] >= 5;
	      } else if (rm === 2) {
	        more = xc[i] > 5 || xc[i] == 5 &&
	          (more || i < 0 || xc[i + 1] !== UNDEFINED || xc[i - 1] & 1);
	      } else if (rm === 3) {
	        more = more || !!xc[0];
	      } else {
	        more = false;
	        if (rm !== 0) throw Error(INVALID_RM);
	      }

	      if (i < 1) {
	        xc.length = 1;

	        if (more) {

	          // 1, 0.1, 0.01, 0.001, 0.0001 etc.
	          x.e = -dp;
	          xc[0] = 1;
	        } else {

	          // Zero.
	          xc[0] = x.e = 0;
	        }
	      } else {

	        // Remove any digits after the required decimal places.
	        xc.length = i--;

	        // Round up?
	        if (more) {

	          // Rounding up may mean the previous digit has to be rounded up.
	          for (; ++xc[i] > 9;) {
	            xc[i] = 0;
	            if (!i--) {
	              ++x.e;
	              xc.unshift(1);
	            }
	          }
	        }

	        // Remove trailing zeros.
	        for (i = xc.length; !xc[--i];) xc.pop();
	      }
	    } else if (rm < 0 || rm > 3 || rm !== ~~rm) {
	      throw Error(INVALID_RM);
	    }

	    return x;
	  }


	  /*
	   * Return a string representing the value of Big x in normal or exponential notation.
	   * Handles P.toExponential, P.toFixed, P.toJSON, P.toPrecision, P.toString and P.valueOf.
	   *
	   * x {Big}
	   * id? {number} Caller id.
	   *         1 toExponential
	   *         2 toFixed
	   *         3 toPrecision
	   *         4 valueOf
	   * n? {number|undefined} Caller's argument.
	   * k? {number|undefined}
	   */
	  function stringify(x, id, n, k) {
	    var e, s,
	      Big = x.constructor,
	      z = !x.c[0];

	    if (n !== UNDEFINED) {
	      if (n !== ~~n || n < (id == 3) || n > MAX_DP) {
	        throw Error(id == 3 ? INVALID + 'precision' : INVALID_DP);
	      }

	      x = new Big(x);

	      // The index of the digit that may be rounded up.
	      n = k - x.e;

	      // Round?
	      if (x.c.length > ++k) round(x, n, Big.RM);

	      // toFixed: recalculate k as x.e may have changed if value rounded up.
	      if (id == 2) k = x.e + n + 1;

	      // Append zeros?
	      for (; x.c.length < k;) x.c.push(0);
	    }

	    e = x.e;
	    s = x.c.join('');
	    n = s.length;

	    // Exponential notation?
	    if (id != 2 && (id == 1 || id == 3 && k <= e || e <= Big.NE || e >= Big.PE)) {
	      s = s.charAt(0) + (n > 1 ? '.' + s.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;

	    // Normal notation.
	    } else if (e < 0) {
	      for (; ++e;) s = '0' + s;
	      s = '0.' + s;
	    } else if (e > 0) {
	      if (++e > n) for (e -= n; e--;) s += '0';
	      else if (e < n) s = s.slice(0, e) + '.' + s.slice(e);
	    } else if (n > 1) {
	      s = s.charAt(0) + '.' + s.slice(1);
	    }

	    return x.s < 0 && (!z || id == 4) ? '-' + s : s;
	  }


	  // Prototype/instance methods


	  /*
	   * Return a new Big whose value is the absolute value of this Big.
	   */
	  P.abs = function () {
	    var x = new this.constructor(this);
	    x.s = 1;
	    return x;
	  };


	  /*
	   * Return 1 if the value of this Big is greater than the value of Big y,
	   *       -1 if the value of this Big is less than the value of Big y, or
	   *        0 if they have the same value.
	  */
	  P.cmp = function (y) {
	    var isneg,
	      x = this,
	      xc = x.c,
	      yc = (y = new x.constructor(y)).c,
	      i = x.s,
	      j = y.s,
	      k = x.e,
	      l = y.e;

	    // Either zero?
	    if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -j : i;

	    // Signs differ?
	    if (i != j) return i;

	    isneg = i < 0;

	    // Compare exponents.
	    if (k != l) return k > l ^ isneg ? 1 : -1;

	    j = (k = xc.length) < (l = yc.length) ? k : l;

	    // Compare digit by digit.
	    for (i = -1; ++i < j;) {
	      if (xc[i] != yc[i]) return xc[i] > yc[i] ^ isneg ? 1 : -1;
	    }

	    // Compare lengths.
	    return k == l ? 0 : k > l ^ isneg ? 1 : -1;
	  };


	  /*
	   * Return a new Big whose value is the value of this Big divided by the value of Big y, rounded,
	   * if necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
	   */
	  P.div = function (y) {
	    var x = this,
	      Big = x.constructor,
	      a = x.c,                  // dividend
	      b = (y = new Big(y)).c,   // divisor
	      k = x.s == y.s ? 1 : -1,
	      dp = Big.DP;

	    if (dp !== ~~dp || dp < 0 || dp > MAX_DP) throw Error(INVALID_DP);

	    // Divisor is zero?
	    if (!b[0]) throw Error(DIV_BY_ZERO);

	    // Dividend is 0? Return +-0.
	    if (!a[0]) return new Big(k * 0);

	    var bl, bt, n, cmp, ri,
	      bz = b.slice(),
	      ai = bl = b.length,
	      al = a.length,
	      r = a.slice(0, bl),   // remainder
	      rl = r.length,
	      q = y,                // quotient
	      qc = q.c = [],
	      qi = 0,
	      d = dp + (q.e = x.e - y.e) + 1;    // number of digits of the result

	    q.s = k;
	    k = d < 0 ? 0 : d;

	    // Create version of divisor with leading zero.
	    bz.unshift(0);

	    // Add zeros to make remainder as long as divisor.
	    for (; rl++ < bl;) r.push(0);

	    do {

	      // n is how many times the divisor goes into current remainder.
	      for (n = 0; n < 10; n++) {

	        // Compare divisor and remainder.
	        if (bl != (rl = r.length)) {
	          cmp = bl > rl ? 1 : -1;
	        } else {
	          for (ri = -1, cmp = 0; ++ri < bl;) {
	            if (b[ri] != r[ri]) {
	              cmp = b[ri] > r[ri] ? 1 : -1;
	              break;
	            }
	          }
	        }

	        // If divisor < remainder, subtract divisor from remainder.
	        if (cmp < 0) {

	          // Remainder can't be more than 1 digit longer than divisor.
	          // Equalise lengths using divisor with extra leading zero?
	          for (bt = rl == bl ? b : bz; rl;) {
	            if (r[--rl] < bt[rl]) {
	              ri = rl;
	              for (; ri && !r[--ri];) r[ri] = 9;
	              --r[ri];
	              r[rl] += 10;
	            }
	            r[rl] -= bt[rl];
	          }

	          for (; !r[0];) r.shift();
	        } else {
	          break;
	        }
	      }

	      // Add the digit n to the result array.
	      qc[qi++] = cmp ? n : ++n;

	      // Update the remainder.
	      if (r[0] && cmp) r[rl] = a[ai] || 0;
	      else r = [a[ai]];

	    } while ((ai++ < al || r[0] !== UNDEFINED) && k--);

	    // Leading zero? Do not remove if result is simply zero (qi == 1).
	    if (!qc[0] && qi != 1) {

	      // There can't be more than one zero.
	      qc.shift();
	      q.e--;
	    }

	    // Round?
	    if (qi > d) round(q, dp, Big.RM, r[0] !== UNDEFINED);

	    return q;
	  };


	  /*
	   * Return true if the value of this Big is equal to the value of Big y, otherwise return false.
	   */
	  P.eq = function (y) {
	    return !this.cmp(y);
	  };


	  /*
	   * Return true if the value of this Big is greater than the value of Big y, otherwise return
	   * false.
	   */
	  P.gt = function (y) {
	    return this.cmp(y) > 0;
	  };


	  /*
	   * Return true if the value of this Big is greater than or equal to the value of Big y, otherwise
	   * return false.
	   */
	  P.gte = function (y) {
	    return this.cmp(y) > -1;
	  };


	  /*
	   * Return true if the value of this Big is less than the value of Big y, otherwise return false.
	   */
	  P.lt = function (y) {
	    return this.cmp(y) < 0;
	  };


	  /*
	   * Return true if the value of this Big is less than or equal to the value of Big y, otherwise
	   * return false.
	   */
	  P.lte = function (y) {
	    return this.cmp(y) < 1;
	  };


	  /*
	   * Return a new Big whose value is the value of this Big minus the value of Big y.
	   */
	  P.minus = P.sub = function (y) {
	    var i, j, t, xlty,
	      x = this,
	      Big = x.constructor,
	      a = x.s,
	      b = (y = new Big(y)).s;

	    // Signs differ?
	    if (a != b) {
	      y.s = -b;
	      return x.plus(y);
	    }

	    var xc = x.c.slice(),
	      xe = x.e,
	      yc = y.c,
	      ye = y.e;

	    // Either zero?
	    if (!xc[0] || !yc[0]) {

	      // y is non-zero? x is non-zero? Or both are zero.
	      return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
	    }

	    // Determine which is the bigger number. Prepend zeros to equalise exponents.
	    if (a = xe - ye) {

	      if (xlty = a < 0) {
	        a = -a;
	        t = xc;
	      } else {
	        ye = xe;
	        t = yc;
	      }

	      t.reverse();
	      for (b = a; b--;) t.push(0);
	      t.reverse();
	    } else {

	      // Exponents equal. Check digit by digit.
	      j = ((xlty = xc.length < yc.length) ? xc : yc).length;

	      for (a = b = 0; b < j; b++) {
	        if (xc[b] != yc[b]) {
	          xlty = xc[b] < yc[b];
	          break;
	        }
	      }
	    }

	    // x < y? Point xc to the array of the bigger number.
	    if (xlty) {
	      t = xc;
	      xc = yc;
	      yc = t;
	      y.s = -y.s;
	    }

	    /*
	     * Append zeros to xc if shorter. No need to add zeros to yc if shorter as subtraction only
	     * needs to start at yc.length.
	     */
	    if ((b = (j = yc.length) - (i = xc.length)) > 0) for (; b--;) xc[i++] = 0;

	    // Subtract yc from xc.
	    for (b = i; j > a;) {
	      if (xc[--j] < yc[j]) {
	        for (i = j; i && !xc[--i];) xc[i] = 9;
	        --xc[i];
	        xc[j] += 10;
	      }

	      xc[j] -= yc[j];
	    }

	    // Remove trailing zeros.
	    for (; xc[--b] === 0;) xc.pop();

	    // Remove leading zeros and adjust exponent accordingly.
	    for (; xc[0] === 0;) {
	      xc.shift();
	      --ye;
	    }

	    if (!xc[0]) {

	      // n - n = +0
	      y.s = 1;

	      // Result must be zero.
	      xc = [ye = 0];
	    }

	    y.c = xc;
	    y.e = ye;

	    return y;
	  };


	  /*
	   * Return a new Big whose value is the value of this Big modulo the value of Big y.
	   */
	  P.mod = function (y) {
	    var ygtx,
	      x = this,
	      Big = x.constructor,
	      a = x.s,
	      b = (y = new Big(y)).s;

	    if (!y.c[0]) throw Error(DIV_BY_ZERO);

	    x.s = y.s = 1;
	    ygtx = y.cmp(x) == 1;
	    x.s = a;
	    y.s = b;

	    if (ygtx) return new Big(x);

	    a = Big.DP;
	    b = Big.RM;
	    Big.DP = Big.RM = 0;
	    x = x.div(y);
	    Big.DP = a;
	    Big.RM = b;

	    return this.minus(x.times(y));
	  };


	  /*
	   * Return a new Big whose value is the value of this Big plus the value of Big y.
	   */
	  P.plus = P.add = function (y) {
	    var t,
	      x = this,
	      Big = x.constructor,
	      a = x.s,
	      b = (y = new Big(y)).s;

	    // Signs differ?
	    if (a != b) {
	      y.s = -b;
	      return x.minus(y);
	    }

	    var xe = x.e,
	      xc = x.c,
	      ye = y.e,
	      yc = y.c;

	    // Either zero? y is non-zero? x is non-zero? Or both are zero.
	    if (!xc[0] || !yc[0]) return yc[0] ? y : new Big(xc[0] ? x : a * 0);

	    xc = xc.slice();

	    // Prepend zeros to equalise exponents.
	    // Note: reverse faster than unshifts.
	    if (a = xe - ye) {
	      if (a > 0) {
	        ye = xe;
	        t = yc;
	      } else {
	        a = -a;
	        t = xc;
	      }

	      t.reverse();
	      for (; a--;) t.push(0);
	      t.reverse();
	    }

	    // Point xc to the longer array.
	    if (xc.length - yc.length < 0) {
	      t = yc;
	      yc = xc;
	      xc = t;
	    }

	    a = yc.length;

	    // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.
	    for (b = 0; a; xc[a] %= 10) b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;

	    // No need to check for zero, as +x + +y != 0 && -x + -y != 0

	    if (b) {
	      xc.unshift(b);
	      ++ye;
	    }

	    // Remove trailing zeros.
	    for (a = xc.length; xc[--a] === 0;) xc.pop();

	    y.c = xc;
	    y.e = ye;

	    return y;
	  };


	  /*
	   * Return a Big whose value is the value of this Big raised to the power n.
	   * If n is negative, round to a maximum of Big.DP decimal places using rounding
	   * mode Big.RM.
	   *
	   * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
	   */
	  P.pow = function (n) {
	    var x = this,
	      one = new x.constructor(1),
	      y = one,
	      isneg = n < 0;

	    if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) throw Error(INVALID + 'exponent');
	    if (isneg) n = -n;

	    for (;;) {
	      if (n & 1) y = y.times(x);
	      n >>= 1;
	      if (!n) break;
	      x = x.times(x);
	    }

	    return isneg ? one.div(y) : y;
	  };


	  /*
	   * Return a new Big whose value is the value of this Big rounded using rounding mode rm
	   * to a maximum of dp decimal places, or, if dp is negative, to an integer which is a
	   * multiple of 10**-dp.
	   * If dp is not specified, round to 0 decimal places.
	   * If rm is not specified, use Big.RM.
	   *
	   * dp? {number} Integer, -MAX_DP to MAX_DP inclusive.
	   * rm? 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
	   */
	  P.round = function (dp, rm) {
	    var Big = this.constructor;
	    if (dp === UNDEFINED) dp = 0;
	    else if (dp !== ~~dp || dp < -MAX_DP || dp > MAX_DP) throw Error(INVALID_DP);
	    return round(new Big(this), dp, rm === UNDEFINED ? Big.RM : rm);
	  };


	  /*
	   * Return a new Big whose value is the square root of the value of this Big, rounded, if
	   * necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
	   */
	  P.sqrt = function () {
	    var r, c, t,
	      x = this,
	      Big = x.constructor,
	      s = x.s,
	      e = x.e,
	      half = new Big(0.5);

	    // Zero?
	    if (!x.c[0]) return new Big(x);

	    // Negative?
	    if (s < 0) throw Error(NAME + 'No square root');

	    // Estimate.
	    s = Math.sqrt(x + '');

	    // Math.sqrt underflow/overflow?
	    // Re-estimate: pass x coefficient to Math.sqrt as integer, then adjust the result exponent.
	    if (s === 0 || s === 1 / 0) {
	      c = x.c.join('');
	      if (!(c.length + e & 1)) c += '0';
	      s = Math.sqrt(c);
	      e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
	      r = new Big((s == 1 / 0 ? '1e' : (s = s.toExponential()).slice(0, s.indexOf('e') + 1)) + e);
	    } else {
	      r = new Big(s);
	    }

	    e = r.e + (Big.DP += 4);

	    // Newton-Raphson iteration.
	    do {
	      t = r;
	      r = half.times(t.plus(x.div(t)));
	    } while (t.c.slice(0, e).join('') !== r.c.slice(0, e).join(''));

	    return round(r, Big.DP -= 4, Big.RM);
	  };


	  /*
	   * Return a new Big whose value is the value of this Big times the value of Big y.
	   */
	  P.times = P.mul = function (y) {
	    var c,
	      x = this,
	      Big = x.constructor,
	      xc = x.c,
	      yc = (y = new Big(y)).c,
	      a = xc.length,
	      b = yc.length,
	      i = x.e,
	      j = y.e;

	    // Determine sign of result.
	    y.s = x.s == y.s ? 1 : -1;

	    // Return signed 0 if either 0.
	    if (!xc[0] || !yc[0]) return new Big(y.s * 0);

	    // Initialise exponent of result as x.e + y.e.
	    y.e = i + j;

	    // If array xc has fewer digits than yc, swap xc and yc, and lengths.
	    if (a < b) {
	      c = xc;
	      xc = yc;
	      yc = c;
	      j = a;
	      a = b;
	      b = j;
	    }

	    // Initialise coefficient array of result with zeros.
	    for (c = new Array(j = a + b); j--;) c[j] = 0;

	    // Multiply.

	    // i is initially xc.length.
	    for (i = b; i--;) {
	      b = 0;

	      // a is yc.length.
	      for (j = a + i; j > i;) {

	        // Current sum of products at this digit position, plus carry.
	        b = c[j] + yc[i] * xc[j - i - 1] + b;
	        c[j--] = b % 10;

	        // carry
	        b = b / 10 | 0;
	      }

	      c[j] = (c[j] + b) % 10;
	    }

	    // Increment result exponent if there is a final carry, otherwise remove leading zero.
	    if (b) ++y.e;
	    else c.shift();

	    // Remove trailing zeros.
	    for (i = c.length; !c[--i];) c.pop();
	    y.c = c;

	    return y;
	  };


	  /*
	   * Return a string representing the value of this Big in exponential notation to dp fixed decimal
	   * places and rounded using Big.RM.
	   *
	   * dp? {number} Integer, 0 to MAX_DP inclusive.
	   */
	  P.toExponential = function (dp) {
	    return stringify(this, 1, dp, dp);
	  };


	  /*
	   * Return a string representing the value of this Big in normal notation to dp fixed decimal
	   * places and rounded using Big.RM.
	   *
	   * dp? {number} Integer, 0 to MAX_DP inclusive.
	   *
	   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
	   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
	   */
	  P.toFixed = function (dp) {
	    return stringify(this, 2, dp, this.e + dp);
	  };


	  /*
	   * Return a string representing the value of this Big rounded to sd significant digits using
	   * Big.RM. Use exponential notation if sd is less than the number of digits necessary to represent
	   * the integer part of the value in normal notation.
	   *
	   * sd {number} Integer, 1 to MAX_DP inclusive.
	   */
	  P.toPrecision = function (sd) {
	    return stringify(this, 3, sd, sd - 1);
	  };


	  /*
	   * Return a string representing the value of this Big.
	   * Return exponential notation if this Big has a positive exponent equal to or greater than
	   * Big.PE, or a negative exponent equal to or less than Big.NE.
	   * Omit the sign for negative zero.
	   */
	  P.toString = function () {
	    return stringify(this);
	  };


	  /*
	   * Return a string representing the value of this Big.
	   * Return exponential notation if this Big has a positive exponent equal to or greater than
	   * Big.PE, or a negative exponent equal to or less than Big.NE.
	   * Include the sign for negative zero.
	   */
	  P.valueOf = P.toJSON = function () {
	    return stringify(this, 4);
	  };


	  // Export


	  Big = _Big_();

	  Big['default'] = Big.Big = Big;

	  //AMD.
	  if (module.exports) {
	    module.exports = Big;

	  //Browser.
	  } else {
	    GLOBAL.Big = Big;
	  }
	})(commonjsGlobal);
} (big));

var _Big = big.exports;

var toFormat$1 = {exports: {}};

/*
 *  toFormat v2.0.0
 *  Adds a toFormat instance method to big.js or decimal.js
 *  Copyright (c) 2017 Michael Mclaughlin
 *  MIT Licence
 */

(function (module) {
	/*
	 * Adds a `toFormat` method to `Ctor.prototype` and a `format` object to `Ctor`, where `Ctor` is
	 * a big number constructor such as `Decimal` (decimal.js) or `Big` (big.js).
	 */
	function toFormat(Ctor) {

	  /*
	   *  Returns a string representing the value of this big number in fixed-point notation to `dp`
	   *  decimal places using rounding mode `rm`, and formatted according to the properties of the
	   * `fmt`, `this.format` and `this.constructor.format` objects, in that order of precedence.
	   *
	   *  Example:
	   *
	   *  x = new Decimal('123456789.987654321')
	   *
	   *  // Add a format object to the constructor...
	   *  Decimal.format = {
	   *    decimalSeparator: '.',
	   *    groupSeparator: ',',
	   *    groupSize: 3,
	   *    secondaryGroupSize: 0,
	   *    fractionGroupSeparator: '',     // '\xA0' non-breaking space
	   *    fractionGroupSize : 0
	   *  }
	   *
	   *  x.toFormat();                // 123,456,789.987654321
	   *  x.toFormat(2, 1);            // 123,456,789.98
	   *
	   *  // And/or add a format object to the big number itself...
	   *  x.format = {
	   *    decimalSeparator: ',',
	   *    groupSeparator: '',
	   *  }
	   *
	   *  x.toFormat();                // 123456789,987654321
	   *
	   *  format = {
	   *    decimalSeparator: '.',
	   *    groupSeparator: ' ',
	   *    groupSize: 3,
	   *    fractionGroupSeparator: ' ',     // '\xA0' non-breaking space
	   *    fractionGroupSize : 5
	   *  }

	   *  // And/or pass a format object to the method call.
	   *  x.toFormat(format);          // 123 456 789.98765 4321
	   *  x.toFormat(4, format);       // 123 456 789.9877
	   *  x.toFormat(2, 1, format);    // 123 456 789.98
	   *
	   *  [dp] {number} Decimal places. Integer.
	   *  [rm] {number} Rounding mode. Integer, 0 to 8. (Ignored if using big.js.)
	   *  [fmt] {Object} A format object.
	   *
	   */
	  Ctor.prototype.toFormat = function toFormat(dp, rm, fmt) {

	    if (!this.e && this.e !== 0) return this.toString();   // Infinity/NaN

	    var arr, g1, g2, i,
	      u,                             // undefined
	      nd,                            // number of integer digits
	      intd,                          // integer digits
	      intp,                          // integer part
	      fracp,                         // fraction part
	      dsep,                          // decimalSeparator
	      gsep,                          // groupSeparator
	      gsize,                         // groupSize
	      sgsize,                        // secondaryGroupSize
	      fgsep,                         // fractionGroupSeparator
	      fgsize,                        // fractionGroupSize
	      tfmt = this.format || {},
	      cfmt = this.constructor.format || {};

	    if (dp != u) {
	      if (typeof dp == 'object') {
	        fmt = dp;
	        dp = u;
	      } else if (rm != u) {
	        if (typeof rm == 'object') {
	          fmt = rm;
	          rm = u;
	        } else if (typeof fmt != 'object') {
	          fmt = {};
	        }
	      } else {
	        fmt = {};
	      }
	    } else {
	      fmt = {};
	    }

	    arr = this.toFixed(dp, rm).split('.');
	    intp = arr[0];
	    fracp = arr[1];
	    intd = this.s < 0 ? intp.slice(1) : intp;
	    nd = intd.length;

	    dsep = fmt.decimalSeparator;
	    if (dsep == u) {
	      dsep = tfmt.decimalSeparator;
	      if (dsep == u) {
	        dsep = cfmt.decimalSeparator;
	        if (dsep == u) dsep = '.';
	      }
	    }

	    gsep = fmt.groupSeparator;
	    if (gsep == u) {
	      gsep = tfmt.groupSeparator;
	      if (gsep == u) gsep = cfmt.groupSeparator;
	    }

	    if (gsep) {
	      gsize = fmt.groupSize;
	      if (gsize == u) {
	        gsize = tfmt.groupSize;
	        if (gsize == u) {
	          gsize = cfmt.groupSize;
	          if (gsize == u) gsize = 0;
	        }
	      }

	      sgsize = fmt.secondaryGroupSize;
	      if (sgsize == u) {
	        sgsize = tfmt.secondaryGroupSize;
	        if (sgsize == u) {
	          sgsize = cfmt.secondaryGroupSize;
	          if (sgsize == u) sgsize = 0;
	        }
	      }

	      if (sgsize) {
	        g1 = +sgsize;
	        g2 = +gsize;
	        nd -= g2;
	      } else {
	        g1 = +gsize;
	        g2 = +sgsize;
	      }

	      if (g1 > 0 && nd > 0) {
	        i = nd % g1 || g1;
	        intp = intd.substr(0, i);
	        for (; i < nd; i += g1) intp += gsep + intd.substr(i, g1);
	        if (g2 > 0) intp += gsep + intd.slice(i);
	        if (this.s < 0) intp = '-' + intp;
	      }
	    }

	    if (fracp) {
	      fgsep = fmt.fractionGroupSeparator;
	      if (fgsep == u) {
	        fgsep = tfmt.fractionGroupSeparator;
	        if (fgsep == u) fgsep = cfmt.fractionGroupSeparator;
	      }

	      if (fgsep) {
	        fgsize = fmt.fractionGroupSize;
	        if (fgsize == u) {
	          fgsize = tfmt.fractionGroupSize;
	          if (fgsize == u) {
	            fgsize = cfmt.fractionGroupSize;
	            if (fgsize == u) fgsize = 0;
	          }
	        }

	        fgsize = +fgsize;

	        if (fgsize) {
	          fracp = fracp.replace(new RegExp('\\d{' + fgsize + '}\\B', 'g'), '$&' + fgsep);
	        }
	      }

	      return intp + dsep + fracp;
	    } else {

	      return intp;
	    }
	  };

	  Ctor.format = {
	    decimalSeparator: '.',
	    groupSeparator: ',',
	    groupSize: 3,
	    secondaryGroupSize: 0,
	    fractionGroupSeparator: '',
	    fractionGroupSize: 0
	  };

	  return Ctor;
	}

	if (module.exports) module.exports = toFormat;
} (toFormat$1));

var toFormat = toFormat$1.exports;

const version$7 = "logger/5.6.0";

let _permanentCensorErrors = false;
let _censorErrors = false;
const LogLevels = { debug: 1, "default": 2, info: 2, warning: 3, error: 4, off: 5 };
let _logLevel = LogLevels["default"];
let _globalLogger = null;
function _checkNormalize() {
    try {
        const missing = [];
        // Make sure all forms of normalization are supported
        ["NFD", "NFC", "NFKD", "NFKC"].forEach((form) => {
            try {
                if ("test".normalize(form) !== "test") {
                    throw new Error("bad normalize");
                }
                ;
            }
            catch (error) {
                missing.push(form);
            }
        });
        if (missing.length) {
            throw new Error("missing " + missing.join(", "));
        }
        if (String.fromCharCode(0xe9).normalize("NFD") !== String.fromCharCode(0x65, 0x0301)) {
            throw new Error("broken implementation");
        }
    }
    catch (error) {
        return error.message;
    }
    return null;
}
const _normalizeError = _checkNormalize();
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARNING"] = "WARNING";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["OFF"] = "OFF";
})(LogLevel || (LogLevel = {}));
var ErrorCode;
(function (ErrorCode) {
    ///////////////////
    // Generic Errors
    // Unknown Error
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    // Not Implemented
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    // Unsupported Operation
    //   - operation
    ErrorCode["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION";
    // Network Error (i.e. Ethereum Network, such as an invalid chain ID)
    //   - event ("noNetwork" is not re-thrown in provider.ready; otherwise thrown)
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    // Some sort of bad response from the server
    ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
    // Timeout
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ///////////////////
    // Operational  Errors
    // Buffer Overrun
    ErrorCode["BUFFER_OVERRUN"] = "BUFFER_OVERRUN";
    // Numeric Fault
    //   - operation: the operation being executed
    //   - fault: the reason this faulted
    ErrorCode["NUMERIC_FAULT"] = "NUMERIC_FAULT";
    ///////////////////
    // Argument Errors
    // Missing new operator to an object
    //  - name: The name of the class
    ErrorCode["MISSING_NEW"] = "MISSING_NEW";
    // Invalid argument (e.g. value is incompatible with type) to a function:
    //   - argument: The argument name that was invalid
    //   - value: The value of the argument
    ErrorCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    // Missing argument to a function:
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    ErrorCode["MISSING_ARGUMENT"] = "MISSING_ARGUMENT";
    // Too many arguments
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    ErrorCode["UNEXPECTED_ARGUMENT"] = "UNEXPECTED_ARGUMENT";
    ///////////////////
    // Blockchain Errors
    // Call exception
    //  - transaction: the transaction
    //  - address?: the contract address
    //  - args?: The arguments passed into the function
    //  - method?: The Solidity method signature
    //  - errorSignature?: The EIP848 error signature
    //  - errorArgs?: The EIP848 error parameters
    //  - reason: The reason (only for EIP848 "Error(string)")
    ErrorCode["CALL_EXCEPTION"] = "CALL_EXCEPTION";
    // Insufficient funds (< value + gasLimit * gasPrice)
    //   - transaction: the transaction attempted
    ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    // Nonce has already been used
    //   - transaction: the transaction attempted
    ErrorCode["NONCE_EXPIRED"] = "NONCE_EXPIRED";
    // The replacement fee for the transaction is too low
    //   - transaction: the transaction attempted
    ErrorCode["REPLACEMENT_UNDERPRICED"] = "REPLACEMENT_UNDERPRICED";
    // The gas limit could not be estimated
    //   - transaction: the transaction passed to estimateGas
    ErrorCode["UNPREDICTABLE_GAS_LIMIT"] = "UNPREDICTABLE_GAS_LIMIT";
    // The transaction was replaced by one with a higher gas price
    //   - reason: "cancelled", "replaced" or "repriced"
    //   - cancelled: true if reason == "cancelled" or reason == "replaced")
    //   - hash: original transaction hash
    //   - replacement: the full TransactionsResponse for the replacement
    //   - receipt: the receipt of the replacement
    ErrorCode["TRANSACTION_REPLACED"] = "TRANSACTION_REPLACED";
})(ErrorCode || (ErrorCode = {}));
const HEX = "0123456789abcdef";
class Logger {
    constructor(version) {
        Object.defineProperty(this, "version", {
            enumerable: true,
            value: version,
            writable: false
        });
    }
    _log(logLevel, args) {
        const level = logLevel.toLowerCase();
        if (LogLevels[level] == null) {
            this.throwArgumentError("invalid log level name", "logLevel", logLevel);
        }
        if (_logLevel > LogLevels[level]) {
            return;
        }
        console.log.apply(console, args);
    }
    debug(...args) {
        this._log(Logger.levels.DEBUG, args);
    }
    info(...args) {
        this._log(Logger.levels.INFO, args);
    }
    warn(...args) {
        this._log(Logger.levels.WARNING, args);
    }
    makeError(message, code, params) {
        // Errors are being censored
        if (_censorErrors) {
            return this.makeError("censored error", code, {});
        }
        if (!code) {
            code = Logger.errors.UNKNOWN_ERROR;
        }
        if (!params) {
            params = {};
        }
        const messageDetails = [];
        Object.keys(params).forEach((key) => {
            const value = params[key];
            try {
                if (value instanceof Uint8Array) {
                    let hex = "";
                    for (let i = 0; i < value.length; i++) {
                        hex += HEX[value[i] >> 4];
                        hex += HEX[value[i] & 0x0f];
                    }
                    messageDetails.push(key + "=Uint8Array(0x" + hex + ")");
                }
                else {
                    messageDetails.push(key + "=" + JSON.stringify(value));
                }
            }
            catch (error) {
                messageDetails.push(key + "=" + JSON.stringify(params[key].toString()));
            }
        });
        messageDetails.push(`code=${code}`);
        messageDetails.push(`version=${this.version}`);
        const reason = message;
        let url = "";
        switch (code) {
            case ErrorCode.NUMERIC_FAULT: {
                url = "NUMERIC_FAULT";
                const fault = message;
                switch (fault) {
                    case "overflow":
                    case "underflow":
                    case "division-by-zero":
                        url += "-" + fault;
                        break;
                    case "negative-power":
                    case "negative-width":
                        url += "-unsupported";
                        break;
                    case "unbound-bitwise-result":
                        url += "-unbound-result";
                        break;
                }
                break;
            }
            case ErrorCode.CALL_EXCEPTION:
            case ErrorCode.INSUFFICIENT_FUNDS:
            case ErrorCode.MISSING_NEW:
            case ErrorCode.NONCE_EXPIRED:
            case ErrorCode.REPLACEMENT_UNDERPRICED:
            case ErrorCode.TRANSACTION_REPLACED:
            case ErrorCode.UNPREDICTABLE_GAS_LIMIT:
                url = code;
                break;
        }
        if (url) {
            message += " [ See: https:/\/links.ethers.org/v5-errors-" + url + " ]";
        }
        if (messageDetails.length) {
            message += " (" + messageDetails.join(", ") + ")";
        }
        // @TODO: Any??
        const error = new Error(message);
        error.reason = reason;
        error.code = code;
        Object.keys(params).forEach(function (key) {
            error[key] = params[key];
        });
        return error;
    }
    throwError(message, code, params) {
        throw this.makeError(message, code, params);
    }
    throwArgumentError(message, name, value) {
        return this.throwError(message, Logger.errors.INVALID_ARGUMENT, {
            argument: name,
            value: value
        });
    }
    assert(condition, message, code, params) {
        if (!!condition) {
            return;
        }
        this.throwError(message, code, params);
    }
    assertArgument(condition, message, name, value) {
        if (!!condition) {
            return;
        }
        this.throwArgumentError(message, name, value);
    }
    checkNormalize(message) {
        if (message == null) {
            message = "platform missing String.prototype.normalize";
        }
        if (_normalizeError) {
            this.throwError("platform missing String.prototype.normalize", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "String.prototype.normalize", form: _normalizeError
            });
        }
    }
    checkSafeUint53(value, message) {
        if (typeof (value) !== "number") {
            return;
        }
        if (message == null) {
            message = "value not safe";
        }
        if (value < 0 || value >= 0x1fffffffffffff) {
            this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "out-of-safe-range",
                value: value
            });
        }
        if (value % 1) {
            this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "non-integer",
                value: value
            });
        }
    }
    checkArgumentCount(count, expectedCount, message) {
        if (message) {
            message = ": " + message;
        }
        else {
            message = "";
        }
        if (count < expectedCount) {
            this.throwError("missing argument" + message, Logger.errors.MISSING_ARGUMENT, {
                count: count,
                expectedCount: expectedCount
            });
        }
        if (count > expectedCount) {
            this.throwError("too many arguments" + message, Logger.errors.UNEXPECTED_ARGUMENT, {
                count: count,
                expectedCount: expectedCount
            });
        }
    }
    checkNew(target, kind) {
        if (target === Object || target == null) {
            this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
        }
    }
    checkAbstract(target, kind) {
        if (target === kind) {
            this.throwError("cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class", Logger.errors.UNSUPPORTED_OPERATION, { name: target.name, operation: "new" });
        }
        else if (target === Object || target == null) {
            this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
        }
    }
    static globalLogger() {
        if (!_globalLogger) {
            _globalLogger = new Logger(version$7);
        }
        return _globalLogger;
    }
    static setCensorship(censorship, permanent) {
        if (!censorship && permanent) {
            this.globalLogger().throwError("cannot permanently disable censorship", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "setCensorship"
            });
        }
        if (_permanentCensorErrors) {
            if (!censorship) {
                return;
            }
            this.globalLogger().throwError("error censorship permanent", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "setCensorship"
            });
        }
        _censorErrors = !!censorship;
        _permanentCensorErrors = !!permanent;
    }
    static setLogLevel(logLevel) {
        const level = LogLevels[logLevel.toLowerCase()];
        if (level == null) {
            Logger.globalLogger().warn("invalid log level - " + logLevel);
            return;
        }
        _logLevel = level;
    }
    static from(version) {
        return new Logger(version);
    }
}
Logger.errors = ErrorCode;
Logger.levels = LogLevel;

const version$6 = "bytes/5.6.1";

const logger$7 = new Logger(version$6);
///////////////////////////////
function isHexable(value) {
    return !!(value.toHexString);
}
function addSlice(array) {
    if (array.slice) {
        return array;
    }
    array.slice = function () {
        const args = Array.prototype.slice.call(arguments);
        return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
    };
    return array;
}
function isBytesLike(value) {
    return ((isHexString(value) && !(value.length % 2)) || isBytes(value));
}
function isInteger(value) {
    return (typeof (value) === "number" && value == value && (value % 1) === 0);
}
function isBytes(value) {
    if (value == null) {
        return false;
    }
    if (value.constructor === Uint8Array) {
        return true;
    }
    if (typeof (value) === "string") {
        return false;
    }
    if (!isInteger(value.length) || value.length < 0) {
        return false;
    }
    for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (!isInteger(v) || v < 0 || v >= 256) {
            return false;
        }
    }
    return true;
}
function arrayify(value, options) {
    if (!options) {
        options = {};
    }
    if (typeof (value) === "number") {
        logger$7.checkSafeUint53(value, "invalid arrayify value");
        const result = [];
        while (value) {
            result.unshift(value & 0xff);
            value = parseInt(String(value / 256));
        }
        if (result.length === 0) {
            result.push(0);
        }
        return addSlice(new Uint8Array(result));
    }
    if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    if (isHexable(value)) {
        value = value.toHexString();
    }
    if (isHexString(value)) {
        let hex = value.substring(2);
        if (hex.length % 2) {
            if (options.hexPad === "left") {
                hex = "0" + hex;
            }
            else if (options.hexPad === "right") {
                hex += "0";
            }
            else {
                logger$7.throwArgumentError("hex data is odd-length", "value", value);
            }
        }
        const result = [];
        for (let i = 0; i < hex.length; i += 2) {
            result.push(parseInt(hex.substring(i, i + 2), 16));
        }
        return addSlice(new Uint8Array(result));
    }
    if (isBytes(value)) {
        return addSlice(new Uint8Array(value));
    }
    return logger$7.throwArgumentError("invalid arrayify value", "value", value);
}
function concat(items) {
    const objects = items.map(item => arrayify(item));
    const length = objects.reduce((accum, item) => (accum + item.length), 0);
    const result = new Uint8Array(length);
    objects.reduce((offset, object) => {
        result.set(object, offset);
        return offset + object.length;
    }, 0);
    return addSlice(result);
}
function stripZeros(value) {
    let result = arrayify(value);
    if (result.length === 0) {
        return result;
    }
    // Find the first non-zero entry
    let start = 0;
    while (start < result.length && result[start] === 0) {
        start++;
    }
    // If we started with zeros, strip them
    if (start) {
        result = result.slice(start);
    }
    return result;
}
function zeroPad(value, length) {
    value = arrayify(value);
    if (value.length > length) {
        logger$7.throwArgumentError("value out of range", "value", arguments[0]);
    }
    const result = new Uint8Array(length);
    result.set(value, length - value.length);
    return addSlice(result);
}
function isHexString(value, length) {
    if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (length && value.length !== 2 + 2 * length) {
        return false;
    }
    return true;
}
const HexCharacters = "0123456789abcdef";
function hexlify(value, options) {
    if (!options) {
        options = {};
    }
    if (typeof (value) === "number") {
        logger$7.checkSafeUint53(value, "invalid hexlify value");
        let hex = "";
        while (value) {
            hex = HexCharacters[value & 0xf] + hex;
            value = Math.floor(value / 16);
        }
        if (hex.length) {
            if (hex.length % 2) {
                hex = "0" + hex;
            }
            return "0x" + hex;
        }
        return "0x00";
    }
    if (typeof (value) === "bigint") {
        value = value.toString(16);
        if (value.length % 2) {
            return ("0x0" + value);
        }
        return "0x" + value;
    }
    if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    if (isHexable(value)) {
        return value.toHexString();
    }
    if (isHexString(value)) {
        if (value.length % 2) {
            if (options.hexPad === "left") {
                value = "0x0" + value.substring(2);
            }
            else if (options.hexPad === "right") {
                value += "0";
            }
            else {
                logger$7.throwArgumentError("hex data is odd-length", "value", value);
            }
        }
        return value.toLowerCase();
    }
    if (isBytes(value)) {
        let result = "0x";
        for (let i = 0; i < value.length; i++) {
            let v = value[i];
            result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
        }
        return result;
    }
    return logger$7.throwArgumentError("invalid hexlify value", "value", value);
}
/*
function unoddify(value: BytesLike | Hexable | number): BytesLike | Hexable | number {
    if (typeof(value) === "string" && value.length % 2 && value.substring(0, 2) === "0x") {
        return "0x0" + value.substring(2);
    }
    return value;
}
*/
function hexDataLength(data) {
    if (typeof (data) !== "string") {
        data = hexlify(data);
    }
    else if (!isHexString(data) || (data.length % 2)) {
        return null;
    }
    return (data.length - 2) / 2;
}
function hexDataSlice(data, offset, endOffset) {
    if (typeof (data) !== "string") {
        data = hexlify(data);
    }
    else if (!isHexString(data) || (data.length % 2)) {
        logger$7.throwArgumentError("invalid hexData", "value", data);
    }
    offset = 2 + 2 * offset;
    if (endOffset != null) {
        return "0x" + data.substring(offset, 2 + 2 * endOffset);
    }
    return "0x" + data.substring(offset);
}
function hexConcat(items) {
    let result = "0x";
    items.forEach((item) => {
        result += hexlify(item).substring(2);
    });
    return result;
}
function hexValue(value) {
    const trimmed = hexStripZeros(hexlify(value, { hexPad: "left" }));
    if (trimmed === "0x") {
        return "0x0";
    }
    return trimmed;
}
function hexStripZeros(value) {
    if (typeof (value) !== "string") {
        value = hexlify(value);
    }
    if (!isHexString(value)) {
        logger$7.throwArgumentError("invalid hex string", "value", value);
    }
    value = value.substring(2);
    let offset = 0;
    while (offset < value.length && value[offset] === "0") {
        offset++;
    }
    return "0x" + value.substring(offset);
}
function hexZeroPad(value, length) {
    if (typeof (value) !== "string") {
        value = hexlify(value);
    }
    else if (!isHexString(value)) {
        logger$7.throwArgumentError("invalid hex string", "value", value);
    }
    if (value.length > 2 * length + 2) {
        logger$7.throwArgumentError("value out of range", "value", arguments[1]);
    }
    while (value.length < 2 * length + 2) {
        value = "0x0" + value.substring(2);
    }
    return value;
}
function splitSignature(signature) {
    const result = {
        r: "0x",
        s: "0x",
        _vs: "0x",
        recoveryParam: 0,
        v: 0,
        yParityAndS: "0x",
        compact: "0x"
    };
    if (isBytesLike(signature)) {
        let bytes = arrayify(signature);
        // Get the r, s and v
        if (bytes.length === 64) {
            // EIP-2098; pull the v from the top bit of s and clear it
            result.v = 27 + (bytes[32] >> 7);
            bytes[32] &= 0x7f;
            result.r = hexlify(bytes.slice(0, 32));
            result.s = hexlify(bytes.slice(32, 64));
        }
        else if (bytes.length === 65) {
            result.r = hexlify(bytes.slice(0, 32));
            result.s = hexlify(bytes.slice(32, 64));
            result.v = bytes[64];
        }
        else {
            logger$7.throwArgumentError("invalid signature string", "signature", signature);
        }
        // Allow a recid to be used as the v
        if (result.v < 27) {
            if (result.v === 0 || result.v === 1) {
                result.v += 27;
            }
            else {
                logger$7.throwArgumentError("signature invalid v byte", "signature", signature);
            }
        }
        // Compute recoveryParam from v
        result.recoveryParam = 1 - (result.v % 2);
        // Compute _vs from recoveryParam and s
        if (result.recoveryParam) {
            bytes[32] |= 0x80;
        }
        result._vs = hexlify(bytes.slice(32, 64));
    }
    else {
        result.r = signature.r;
        result.s = signature.s;
        result.v = signature.v;
        result.recoveryParam = signature.recoveryParam;
        result._vs = signature._vs;
        // If the _vs is available, use it to populate missing s, v and recoveryParam
        // and verify non-missing s, v and recoveryParam
        if (result._vs != null) {
            const vs = zeroPad(arrayify(result._vs), 32);
            result._vs = hexlify(vs);
            // Set or check the recid
            const recoveryParam = ((vs[0] >= 128) ? 1 : 0);
            if (result.recoveryParam == null) {
                result.recoveryParam = recoveryParam;
            }
            else if (result.recoveryParam !== recoveryParam) {
                logger$7.throwArgumentError("signature recoveryParam mismatch _vs", "signature", signature);
            }
            // Set or check the s
            vs[0] &= 0x7f;
            const s = hexlify(vs);
            if (result.s == null) {
                result.s = s;
            }
            else if (result.s !== s) {
                logger$7.throwArgumentError("signature v mismatch _vs", "signature", signature);
            }
        }
        // Use recid and v to populate each other
        if (result.recoveryParam == null) {
            if (result.v == null) {
                logger$7.throwArgumentError("signature missing v and recoveryParam", "signature", signature);
            }
            else if (result.v === 0 || result.v === 1) {
                result.recoveryParam = result.v;
            }
            else {
                result.recoveryParam = 1 - (result.v % 2);
            }
        }
        else {
            if (result.v == null) {
                result.v = 27 + result.recoveryParam;
            }
            else {
                const recId = (result.v === 0 || result.v === 1) ? result.v : (1 - (result.v % 2));
                if (result.recoveryParam !== recId) {
                    logger$7.throwArgumentError("signature recoveryParam mismatch v", "signature", signature);
                }
            }
        }
        if (result.r == null || !isHexString(result.r)) {
            logger$7.throwArgumentError("signature missing or invalid r", "signature", signature);
        }
        else {
            result.r = hexZeroPad(result.r, 32);
        }
        if (result.s == null || !isHexString(result.s)) {
            logger$7.throwArgumentError("signature missing or invalid s", "signature", signature);
        }
        else {
            result.s = hexZeroPad(result.s, 32);
        }
        const vs = arrayify(result.s);
        if (vs[0] >= 128) {
            logger$7.throwArgumentError("signature s out of range", "signature", signature);
        }
        if (result.recoveryParam) {
            vs[0] |= 0x80;
        }
        const _vs = hexlify(vs);
        if (result._vs) {
            if (!isHexString(result._vs)) {
                logger$7.throwArgumentError("signature invalid _vs", "signature", signature);
            }
            result._vs = hexZeroPad(result._vs, 32);
        }
        // Set or check the _vs
        if (result._vs == null) {
            result._vs = _vs;
        }
        else if (result._vs !== _vs) {
            logger$7.throwArgumentError("signature _vs mismatch v and s", "signature", signature);
        }
    }
    result.yParityAndS = result._vs;
    result.compact = result.r + result.yParityAndS.substring(2);
    return result;
}
function joinSignature(signature) {
    signature = splitSignature(signature);
    return hexlify(concat([
        signature.r,
        signature.s,
        (signature.recoveryParam ? "0x1c" : "0x1b")
    ]));
}

var bn = {exports: {}};

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _nodeResolve_empty
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

(function (module) {
	(function (module, exports) {

	  // Utils
	  function assert (val, msg) {
	    if (!val) throw new Error(msg || 'Assertion failed');
	  }

	  // Could use `inherits` module, but don't want to move from single file
	  // architecture yet.
	  function inherits (ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function () {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  }

	  // BN

	  function BN (number, base, endian) {
	    if (BN.isBN(number)) {
	      return number;
	    }

	    this.negative = 0;
	    this.words = null;
	    this.length = 0;

	    // Reduction context
	    this.red = null;

	    if (number !== null) {
	      if (base === 'le' || base === 'be') {
	        endian = base;
	        base = 10;
	      }

	      this._init(number || 0, base || 10, endian || 'be');
	    }
	  }
	  if (typeof module === 'object') {
	    module.exports = BN;
	  } else {
	    exports.BN = BN;
	  }

	  BN.BN = BN;
	  BN.wordSize = 26;

	  var Buffer;
	  try {
	    if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
	      Buffer = window.Buffer;
	    } else {
	      Buffer = require$$0.Buffer;
	    }
	  } catch (e) {
	  }

	  BN.isBN = function isBN (num) {
	    if (num instanceof BN) {
	      return true;
	    }

	    return num !== null && typeof num === 'object' &&
	      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
	  };

	  BN.max = function max (left, right) {
	    if (left.cmp(right) > 0) return left;
	    return right;
	  };

	  BN.min = function min (left, right) {
	    if (left.cmp(right) < 0) return left;
	    return right;
	  };

	  BN.prototype._init = function init (number, base, endian) {
	    if (typeof number === 'number') {
	      return this._initNumber(number, base, endian);
	    }

	    if (typeof number === 'object') {
	      return this._initArray(number, base, endian);
	    }

	    if (base === 'hex') {
	      base = 16;
	    }
	    assert(base === (base | 0) && base >= 2 && base <= 36);

	    number = number.toString().replace(/\s+/g, '');
	    var start = 0;
	    if (number[0] === '-') {
	      start++;
	      this.negative = 1;
	    }

	    if (start < number.length) {
	      if (base === 16) {
	        this._parseHex(number, start, endian);
	      } else {
	        this._parseBase(number, base, start);
	        if (endian === 'le') {
	          this._initArray(this.toArray(), base, endian);
	        }
	      }
	    }
	  };

	  BN.prototype._initNumber = function _initNumber (number, base, endian) {
	    if (number < 0) {
	      this.negative = 1;
	      number = -number;
	    }
	    if (number < 0x4000000) {
	      this.words = [number & 0x3ffffff];
	      this.length = 1;
	    } else if (number < 0x10000000000000) {
	      this.words = [
	        number & 0x3ffffff,
	        (number / 0x4000000) & 0x3ffffff
	      ];
	      this.length = 2;
	    } else {
	      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
	      this.words = [
	        number & 0x3ffffff,
	        (number / 0x4000000) & 0x3ffffff,
	        1
	      ];
	      this.length = 3;
	    }

	    if (endian !== 'le') return;

	    // Reverse the bytes
	    this._initArray(this.toArray(), base, endian);
	  };

	  BN.prototype._initArray = function _initArray (number, base, endian) {
	    // Perhaps a Uint8Array
	    assert(typeof number.length === 'number');
	    if (number.length <= 0) {
	      this.words = [0];
	      this.length = 1;
	      return this;
	    }

	    this.length = Math.ceil(number.length / 3);
	    this.words = new Array(this.length);
	    for (var i = 0; i < this.length; i++) {
	      this.words[i] = 0;
	    }

	    var j, w;
	    var off = 0;
	    if (endian === 'be') {
	      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
	        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
	        this.words[j] |= (w << off) & 0x3ffffff;
	        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
	        off += 24;
	        if (off >= 26) {
	          off -= 26;
	          j++;
	        }
	      }
	    } else if (endian === 'le') {
	      for (i = 0, j = 0; i < number.length; i += 3) {
	        w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
	        this.words[j] |= (w << off) & 0x3ffffff;
	        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
	        off += 24;
	        if (off >= 26) {
	          off -= 26;
	          j++;
	        }
	      }
	    }
	    return this._strip();
	  };

	  function parseHex4Bits (string, index) {
	    var c = string.charCodeAt(index);
	    // '0' - '9'
	    if (c >= 48 && c <= 57) {
	      return c - 48;
	    // 'A' - 'F'
	    } else if (c >= 65 && c <= 70) {
	      return c - 55;
	    // 'a' - 'f'
	    } else if (c >= 97 && c <= 102) {
	      return c - 87;
	    } else {
	      assert(false, 'Invalid character in ' + string);
	    }
	  }

	  function parseHexByte (string, lowerBound, index) {
	    var r = parseHex4Bits(string, index);
	    if (index - 1 >= lowerBound) {
	      r |= parseHex4Bits(string, index - 1) << 4;
	    }
	    return r;
	  }

	  BN.prototype._parseHex = function _parseHex (number, start, endian) {
	    // Create possibly bigger array to ensure that it fits the number
	    this.length = Math.ceil((number.length - start) / 6);
	    this.words = new Array(this.length);
	    for (var i = 0; i < this.length; i++) {
	      this.words[i] = 0;
	    }

	    // 24-bits chunks
	    var off = 0;
	    var j = 0;

	    var w;
	    if (endian === 'be') {
	      for (i = number.length - 1; i >= start; i -= 2) {
	        w = parseHexByte(number, start, i) << off;
	        this.words[j] |= w & 0x3ffffff;
	        if (off >= 18) {
	          off -= 18;
	          j += 1;
	          this.words[j] |= w >>> 26;
	        } else {
	          off += 8;
	        }
	      }
	    } else {
	      var parseLength = number.length - start;
	      for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
	        w = parseHexByte(number, start, i) << off;
	        this.words[j] |= w & 0x3ffffff;
	        if (off >= 18) {
	          off -= 18;
	          j += 1;
	          this.words[j] |= w >>> 26;
	        } else {
	          off += 8;
	        }
	      }
	    }

	    this._strip();
	  };

	  function parseBase (str, start, end, mul) {
	    var r = 0;
	    var b = 0;
	    var len = Math.min(str.length, end);
	    for (var i = start; i < len; i++) {
	      var c = str.charCodeAt(i) - 48;

	      r *= mul;

	      // 'a'
	      if (c >= 49) {
	        b = c - 49 + 0xa;

	      // 'A'
	      } else if (c >= 17) {
	        b = c - 17 + 0xa;

	      // '0' - '9'
	      } else {
	        b = c;
	      }
	      assert(c >= 0 && b < mul, 'Invalid character');
	      r += b;
	    }
	    return r;
	  }

	  BN.prototype._parseBase = function _parseBase (number, base, start) {
	    // Initialize as zero
	    this.words = [0];
	    this.length = 1;

	    // Find length of limb in base
	    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
	      limbLen++;
	    }
	    limbLen--;
	    limbPow = (limbPow / base) | 0;

	    var total = number.length - start;
	    var mod = total % limbLen;
	    var end = Math.min(total, total - mod) + start;

	    var word = 0;
	    for (var i = start; i < end; i += limbLen) {
	      word = parseBase(number, i, i + limbLen, base);

	      this.imuln(limbPow);
	      if (this.words[0] + word < 0x4000000) {
	        this.words[0] += word;
	      } else {
	        this._iaddn(word);
	      }
	    }

	    if (mod !== 0) {
	      var pow = 1;
	      word = parseBase(number, i, number.length, base);

	      for (i = 0; i < mod; i++) {
	        pow *= base;
	      }

	      this.imuln(pow);
	      if (this.words[0] + word < 0x4000000) {
	        this.words[0] += word;
	      } else {
	        this._iaddn(word);
	      }
	    }

	    this._strip();
	  };

	  BN.prototype.copy = function copy (dest) {
	    dest.words = new Array(this.length);
	    for (var i = 0; i < this.length; i++) {
	      dest.words[i] = this.words[i];
	    }
	    dest.length = this.length;
	    dest.negative = this.negative;
	    dest.red = this.red;
	  };

	  function move (dest, src) {
	    dest.words = src.words;
	    dest.length = src.length;
	    dest.negative = src.negative;
	    dest.red = src.red;
	  }

	  BN.prototype._move = function _move (dest) {
	    move(dest, this);
	  };

	  BN.prototype.clone = function clone () {
	    var r = new BN(null);
	    this.copy(r);
	    return r;
	  };

	  BN.prototype._expand = function _expand (size) {
	    while (this.length < size) {
	      this.words[this.length++] = 0;
	    }
	    return this;
	  };

	  // Remove leading `0` from `this`
	  BN.prototype._strip = function strip () {
	    while (this.length > 1 && this.words[this.length - 1] === 0) {
	      this.length--;
	    }
	    return this._normSign();
	  };

	  BN.prototype._normSign = function _normSign () {
	    // -0 = 0
	    if (this.length === 1 && this.words[0] === 0) {
	      this.negative = 0;
	    }
	    return this;
	  };

	  // Check Symbol.for because not everywhere where Symbol defined
	  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility
	  if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
	    try {
	      BN.prototype[Symbol.for('nodejs.util.inspect.custom')] = inspect;
	    } catch (e) {
	      BN.prototype.inspect = inspect;
	    }
	  } else {
	    BN.prototype.inspect = inspect;
	  }

	  function inspect () {
	    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
	  }

	  /*

	  var zeros = [];
	  var groupSizes = [];
	  var groupBases = [];

	  var s = '';
	  var i = -1;
	  while (++i < BN.wordSize) {
	    zeros[i] = s;
	    s += '0';
	  }
	  groupSizes[0] = 0;
	  groupSizes[1] = 0;
	  groupBases[0] = 0;
	  groupBases[1] = 0;
	  var base = 2 - 1;
	  while (++base < 36 + 1) {
	    var groupSize = 0;
	    var groupBase = 1;
	    while (groupBase < (1 << BN.wordSize) / base) {
	      groupBase *= base;
	      groupSize += 1;
	    }
	    groupSizes[base] = groupSize;
	    groupBases[base] = groupBase;
	  }

	  */

	  var zeros = [
	    '',
	    '0',
	    '00',
	    '000',
	    '0000',
	    '00000',
	    '000000',
	    '0000000',
	    '00000000',
	    '000000000',
	    '0000000000',
	    '00000000000',
	    '000000000000',
	    '0000000000000',
	    '00000000000000',
	    '000000000000000',
	    '0000000000000000',
	    '00000000000000000',
	    '000000000000000000',
	    '0000000000000000000',
	    '00000000000000000000',
	    '000000000000000000000',
	    '0000000000000000000000',
	    '00000000000000000000000',
	    '000000000000000000000000',
	    '0000000000000000000000000'
	  ];

	  var groupSizes = [
	    0, 0,
	    25, 16, 12, 11, 10, 9, 8,
	    8, 7, 7, 7, 7, 6, 6,
	    6, 6, 6, 6, 6, 5, 5,
	    5, 5, 5, 5, 5, 5, 5,
	    5, 5, 5, 5, 5, 5, 5
	  ];

	  var groupBases = [
	    0, 0,
	    33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
	    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
	    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
	    6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
	    24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
	  ];

	  BN.prototype.toString = function toString (base, padding) {
	    base = base || 10;
	    padding = padding | 0 || 1;

	    var out;
	    if (base === 16 || base === 'hex') {
	      out = '';
	      var off = 0;
	      var carry = 0;
	      for (var i = 0; i < this.length; i++) {
	        var w = this.words[i];
	        var word = (((w << off) | carry) & 0xffffff).toString(16);
	        carry = (w >>> (24 - off)) & 0xffffff;
	        off += 2;
	        if (off >= 26) {
	          off -= 26;
	          i--;
	        }
	        if (carry !== 0 || i !== this.length - 1) {
	          out = zeros[6 - word.length] + word + out;
	        } else {
	          out = word + out;
	        }
	      }
	      if (carry !== 0) {
	        out = carry.toString(16) + out;
	      }
	      while (out.length % padding !== 0) {
	        out = '0' + out;
	      }
	      if (this.negative !== 0) {
	        out = '-' + out;
	      }
	      return out;
	    }

	    if (base === (base | 0) && base >= 2 && base <= 36) {
	      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
	      var groupSize = groupSizes[base];
	      // var groupBase = Math.pow(base, groupSize);
	      var groupBase = groupBases[base];
	      out = '';
	      var c = this.clone();
	      c.negative = 0;
	      while (!c.isZero()) {
	        var r = c.modrn(groupBase).toString(base);
	        c = c.idivn(groupBase);

	        if (!c.isZero()) {
	          out = zeros[groupSize - r.length] + r + out;
	        } else {
	          out = r + out;
	        }
	      }
	      if (this.isZero()) {
	        out = '0' + out;
	      }
	      while (out.length % padding !== 0) {
	        out = '0' + out;
	      }
	      if (this.negative !== 0) {
	        out = '-' + out;
	      }
	      return out;
	    }

	    assert(false, 'Base should be between 2 and 36');
	  };

	  BN.prototype.toNumber = function toNumber () {
	    var ret = this.words[0];
	    if (this.length === 2) {
	      ret += this.words[1] * 0x4000000;
	    } else if (this.length === 3 && this.words[2] === 0x01) {
	      // NOTE: at this stage it is known that the top bit is set
	      ret += 0x10000000000000 + (this.words[1] * 0x4000000);
	    } else if (this.length > 2) {
	      assert(false, 'Number can only safely store up to 53 bits');
	    }
	    return (this.negative !== 0) ? -ret : ret;
	  };

	  BN.prototype.toJSON = function toJSON () {
	    return this.toString(16, 2);
	  };

	  if (Buffer) {
	    BN.prototype.toBuffer = function toBuffer (endian, length) {
	      return this.toArrayLike(Buffer, endian, length);
	    };
	  }

	  BN.prototype.toArray = function toArray (endian, length) {
	    return this.toArrayLike(Array, endian, length);
	  };

	  var allocate = function allocate (ArrayType, size) {
	    if (ArrayType.allocUnsafe) {
	      return ArrayType.allocUnsafe(size);
	    }
	    return new ArrayType(size);
	  };

	  BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
	    this._strip();

	    var byteLength = this.byteLength();
	    var reqLength = length || Math.max(1, byteLength);
	    assert(byteLength <= reqLength, 'byte array longer than desired length');
	    assert(reqLength > 0, 'Requested array length <= 0');

	    var res = allocate(ArrayType, reqLength);
	    var postfix = endian === 'le' ? 'LE' : 'BE';
	    this['_toArrayLike' + postfix](res, byteLength);
	    return res;
	  };

	  BN.prototype._toArrayLikeLE = function _toArrayLikeLE (res, byteLength) {
	    var position = 0;
	    var carry = 0;

	    for (var i = 0, shift = 0; i < this.length; i++) {
	      var word = (this.words[i] << shift) | carry;

	      res[position++] = word & 0xff;
	      if (position < res.length) {
	        res[position++] = (word >> 8) & 0xff;
	      }
	      if (position < res.length) {
	        res[position++] = (word >> 16) & 0xff;
	      }

	      if (shift === 6) {
	        if (position < res.length) {
	          res[position++] = (word >> 24) & 0xff;
	        }
	        carry = 0;
	        shift = 0;
	      } else {
	        carry = word >>> 24;
	        shift += 2;
	      }
	    }

	    if (position < res.length) {
	      res[position++] = carry;

	      while (position < res.length) {
	        res[position++] = 0;
	      }
	    }
	  };

	  BN.prototype._toArrayLikeBE = function _toArrayLikeBE (res, byteLength) {
	    var position = res.length - 1;
	    var carry = 0;

	    for (var i = 0, shift = 0; i < this.length; i++) {
	      var word = (this.words[i] << shift) | carry;

	      res[position--] = word & 0xff;
	      if (position >= 0) {
	        res[position--] = (word >> 8) & 0xff;
	      }
	      if (position >= 0) {
	        res[position--] = (word >> 16) & 0xff;
	      }

	      if (shift === 6) {
	        if (position >= 0) {
	          res[position--] = (word >> 24) & 0xff;
	        }
	        carry = 0;
	        shift = 0;
	      } else {
	        carry = word >>> 24;
	        shift += 2;
	      }
	    }

	    if (position >= 0) {
	      res[position--] = carry;

	      while (position >= 0) {
	        res[position--] = 0;
	      }
	    }
	  };

	  if (Math.clz32) {
	    BN.prototype._countBits = function _countBits (w) {
	      return 32 - Math.clz32(w);
	    };
	  } else {
	    BN.prototype._countBits = function _countBits (w) {
	      var t = w;
	      var r = 0;
	      if (t >= 0x1000) {
	        r += 13;
	        t >>>= 13;
	      }
	      if (t >= 0x40) {
	        r += 7;
	        t >>>= 7;
	      }
	      if (t >= 0x8) {
	        r += 4;
	        t >>>= 4;
	      }
	      if (t >= 0x02) {
	        r += 2;
	        t >>>= 2;
	      }
	      return r + t;
	    };
	  }

	  BN.prototype._zeroBits = function _zeroBits (w) {
	    // Short-cut
	    if (w === 0) return 26;

	    var t = w;
	    var r = 0;
	    if ((t & 0x1fff) === 0) {
	      r += 13;
	      t >>>= 13;
	    }
	    if ((t & 0x7f) === 0) {
	      r += 7;
	      t >>>= 7;
	    }
	    if ((t & 0xf) === 0) {
	      r += 4;
	      t >>>= 4;
	    }
	    if ((t & 0x3) === 0) {
	      r += 2;
	      t >>>= 2;
	    }
	    if ((t & 0x1) === 0) {
	      r++;
	    }
	    return r;
	  };

	  // Return number of used bits in a BN
	  BN.prototype.bitLength = function bitLength () {
	    var w = this.words[this.length - 1];
	    var hi = this._countBits(w);
	    return (this.length - 1) * 26 + hi;
	  };

	  function toBitArray (num) {
	    var w = new Array(num.bitLength());

	    for (var bit = 0; bit < w.length; bit++) {
	      var off = (bit / 26) | 0;
	      var wbit = bit % 26;

	      w[bit] = (num.words[off] >>> wbit) & 0x01;
	    }

	    return w;
	  }

	  // Number of trailing zero bits
	  BN.prototype.zeroBits = function zeroBits () {
	    if (this.isZero()) return 0;

	    var r = 0;
	    for (var i = 0; i < this.length; i++) {
	      var b = this._zeroBits(this.words[i]);
	      r += b;
	      if (b !== 26) break;
	    }
	    return r;
	  };

	  BN.prototype.byteLength = function byteLength () {
	    return Math.ceil(this.bitLength() / 8);
	  };

	  BN.prototype.toTwos = function toTwos (width) {
	    if (this.negative !== 0) {
	      return this.abs().inotn(width).iaddn(1);
	    }
	    return this.clone();
	  };

	  BN.prototype.fromTwos = function fromTwos (width) {
	    if (this.testn(width - 1)) {
	      return this.notn(width).iaddn(1).ineg();
	    }
	    return this.clone();
	  };

	  BN.prototype.isNeg = function isNeg () {
	    return this.negative !== 0;
	  };

	  // Return negative clone of `this`
	  BN.prototype.neg = function neg () {
	    return this.clone().ineg();
	  };

	  BN.prototype.ineg = function ineg () {
	    if (!this.isZero()) {
	      this.negative ^= 1;
	    }

	    return this;
	  };

	  // Or `num` with `this` in-place
	  BN.prototype.iuor = function iuor (num) {
	    while (this.length < num.length) {
	      this.words[this.length++] = 0;
	    }

	    for (var i = 0; i < num.length; i++) {
	      this.words[i] = this.words[i] | num.words[i];
	    }

	    return this._strip();
	  };

	  BN.prototype.ior = function ior (num) {
	    assert((this.negative | num.negative) === 0);
	    return this.iuor(num);
	  };

	  // Or `num` with `this`
	  BN.prototype.or = function or (num) {
	    if (this.length > num.length) return this.clone().ior(num);
	    return num.clone().ior(this);
	  };

	  BN.prototype.uor = function uor (num) {
	    if (this.length > num.length) return this.clone().iuor(num);
	    return num.clone().iuor(this);
	  };

	  // And `num` with `this` in-place
	  BN.prototype.iuand = function iuand (num) {
	    // b = min-length(num, this)
	    var b;
	    if (this.length > num.length) {
	      b = num;
	    } else {
	      b = this;
	    }

	    for (var i = 0; i < b.length; i++) {
	      this.words[i] = this.words[i] & num.words[i];
	    }

	    this.length = b.length;

	    return this._strip();
	  };

	  BN.prototype.iand = function iand (num) {
	    assert((this.negative | num.negative) === 0);
	    return this.iuand(num);
	  };

	  // And `num` with `this`
	  BN.prototype.and = function and (num) {
	    if (this.length > num.length) return this.clone().iand(num);
	    return num.clone().iand(this);
	  };

	  BN.prototype.uand = function uand (num) {
	    if (this.length > num.length) return this.clone().iuand(num);
	    return num.clone().iuand(this);
	  };

	  // Xor `num` with `this` in-place
	  BN.prototype.iuxor = function iuxor (num) {
	    // a.length > b.length
	    var a;
	    var b;
	    if (this.length > num.length) {
	      a = this;
	      b = num;
	    } else {
	      a = num;
	      b = this;
	    }

	    for (var i = 0; i < b.length; i++) {
	      this.words[i] = a.words[i] ^ b.words[i];
	    }

	    if (this !== a) {
	      for (; i < a.length; i++) {
	        this.words[i] = a.words[i];
	      }
	    }

	    this.length = a.length;

	    return this._strip();
	  };

	  BN.prototype.ixor = function ixor (num) {
	    assert((this.negative | num.negative) === 0);
	    return this.iuxor(num);
	  };

	  // Xor `num` with `this`
	  BN.prototype.xor = function xor (num) {
	    if (this.length > num.length) return this.clone().ixor(num);
	    return num.clone().ixor(this);
	  };

	  BN.prototype.uxor = function uxor (num) {
	    if (this.length > num.length) return this.clone().iuxor(num);
	    return num.clone().iuxor(this);
	  };

	  // Not ``this`` with ``width`` bitwidth
	  BN.prototype.inotn = function inotn (width) {
	    assert(typeof width === 'number' && width >= 0);

	    var bytesNeeded = Math.ceil(width / 26) | 0;
	    var bitsLeft = width % 26;

	    // Extend the buffer with leading zeroes
	    this._expand(bytesNeeded);

	    if (bitsLeft > 0) {
	      bytesNeeded--;
	    }

	    // Handle complete words
	    for (var i = 0; i < bytesNeeded; i++) {
	      this.words[i] = ~this.words[i] & 0x3ffffff;
	    }

	    // Handle the residue
	    if (bitsLeft > 0) {
	      this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
	    }

	    // And remove leading zeroes
	    return this._strip();
	  };

	  BN.prototype.notn = function notn (width) {
	    return this.clone().inotn(width);
	  };

	  // Set `bit` of `this`
	  BN.prototype.setn = function setn (bit, val) {
	    assert(typeof bit === 'number' && bit >= 0);

	    var off = (bit / 26) | 0;
	    var wbit = bit % 26;

	    this._expand(off + 1);

	    if (val) {
	      this.words[off] = this.words[off] | (1 << wbit);
	    } else {
	      this.words[off] = this.words[off] & ~(1 << wbit);
	    }

	    return this._strip();
	  };

	  // Add `num` to `this` in-place
	  BN.prototype.iadd = function iadd (num) {
	    var r;

	    // negative + positive
	    if (this.negative !== 0 && num.negative === 0) {
	      this.negative = 0;
	      r = this.isub(num);
	      this.negative ^= 1;
	      return this._normSign();

	    // positive + negative
	    } else if (this.negative === 0 && num.negative !== 0) {
	      num.negative = 0;
	      r = this.isub(num);
	      num.negative = 1;
	      return r._normSign();
	    }

	    // a.length > b.length
	    var a, b;
	    if (this.length > num.length) {
	      a = this;
	      b = num;
	    } else {
	      a = num;
	      b = this;
	    }

	    var carry = 0;
	    for (var i = 0; i < b.length; i++) {
	      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
	      this.words[i] = r & 0x3ffffff;
	      carry = r >>> 26;
	    }
	    for (; carry !== 0 && i < a.length; i++) {
	      r = (a.words[i] | 0) + carry;
	      this.words[i] = r & 0x3ffffff;
	      carry = r >>> 26;
	    }

	    this.length = a.length;
	    if (carry !== 0) {
	      this.words[this.length] = carry;
	      this.length++;
	    // Copy the rest of the words
	    } else if (a !== this) {
	      for (; i < a.length; i++) {
	        this.words[i] = a.words[i];
	      }
	    }

	    return this;
	  };

	  // Add `num` to `this`
	  BN.prototype.add = function add (num) {
	    var res;
	    if (num.negative !== 0 && this.negative === 0) {
	      num.negative = 0;
	      res = this.sub(num);
	      num.negative ^= 1;
	      return res;
	    } else if (num.negative === 0 && this.negative !== 0) {
	      this.negative = 0;
	      res = num.sub(this);
	      this.negative = 1;
	      return res;
	    }

	    if (this.length > num.length) return this.clone().iadd(num);

	    return num.clone().iadd(this);
	  };

	  // Subtract `num` from `this` in-place
	  BN.prototype.isub = function isub (num) {
	    // this - (-num) = this + num
	    if (num.negative !== 0) {
	      num.negative = 0;
	      var r = this.iadd(num);
	      num.negative = 1;
	      return r._normSign();

	    // -this - num = -(this + num)
	    } else if (this.negative !== 0) {
	      this.negative = 0;
	      this.iadd(num);
	      this.negative = 1;
	      return this._normSign();
	    }

	    // At this point both numbers are positive
	    var cmp = this.cmp(num);

	    // Optimization - zeroify
	    if (cmp === 0) {
	      this.negative = 0;
	      this.length = 1;
	      this.words[0] = 0;
	      return this;
	    }

	    // a > b
	    var a, b;
	    if (cmp > 0) {
	      a = this;
	      b = num;
	    } else {
	      a = num;
	      b = this;
	    }

	    var carry = 0;
	    for (var i = 0; i < b.length; i++) {
	      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
	      carry = r >> 26;
	      this.words[i] = r & 0x3ffffff;
	    }
	    for (; carry !== 0 && i < a.length; i++) {
	      r = (a.words[i] | 0) + carry;
	      carry = r >> 26;
	      this.words[i] = r & 0x3ffffff;
	    }

	    // Copy rest of the words
	    if (carry === 0 && i < a.length && a !== this) {
	      for (; i < a.length; i++) {
	        this.words[i] = a.words[i];
	      }
	    }

	    this.length = Math.max(this.length, i);

	    if (a !== this) {
	      this.negative = 1;
	    }

	    return this._strip();
	  };

	  // Subtract `num` from `this`
	  BN.prototype.sub = function sub (num) {
	    return this.clone().isub(num);
	  };

	  function smallMulTo (self, num, out) {
	    out.negative = num.negative ^ self.negative;
	    var len = (self.length + num.length) | 0;
	    out.length = len;
	    len = (len - 1) | 0;

	    // Peel one iteration (compiler can't do it, because of code complexity)
	    var a = self.words[0] | 0;
	    var b = num.words[0] | 0;
	    var r = a * b;

	    var lo = r & 0x3ffffff;
	    var carry = (r / 0x4000000) | 0;
	    out.words[0] = lo;

	    for (var k = 1; k < len; k++) {
	      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	      // note that ncarry could be >= 0x3ffffff
	      var ncarry = carry >>> 26;
	      var rword = carry & 0x3ffffff;
	      var maxJ = Math.min(k, num.length - 1);
	      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
	        var i = (k - j) | 0;
	        a = self.words[i] | 0;
	        b = num.words[j] | 0;
	        r = a * b + rword;
	        ncarry += (r / 0x4000000) | 0;
	        rword = r & 0x3ffffff;
	      }
	      out.words[k] = rword | 0;
	      carry = ncarry | 0;
	    }
	    if (carry !== 0) {
	      out.words[k] = carry | 0;
	    } else {
	      out.length--;
	    }

	    return out._strip();
	  }

	  // TODO(indutny): it may be reasonable to omit it for users who don't need
	  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
	  // multiplication (like elliptic secp256k1).
	  var comb10MulTo = function comb10MulTo (self, num, out) {
	    var a = self.words;
	    var b = num.words;
	    var o = out.words;
	    var c = 0;
	    var lo;
	    var mid;
	    var hi;
	    var a0 = a[0] | 0;
	    var al0 = a0 & 0x1fff;
	    var ah0 = a0 >>> 13;
	    var a1 = a[1] | 0;
	    var al1 = a1 & 0x1fff;
	    var ah1 = a1 >>> 13;
	    var a2 = a[2] | 0;
	    var al2 = a2 & 0x1fff;
	    var ah2 = a2 >>> 13;
	    var a3 = a[3] | 0;
	    var al3 = a3 & 0x1fff;
	    var ah3 = a3 >>> 13;
	    var a4 = a[4] | 0;
	    var al4 = a4 & 0x1fff;
	    var ah4 = a4 >>> 13;
	    var a5 = a[5] | 0;
	    var al5 = a5 & 0x1fff;
	    var ah5 = a5 >>> 13;
	    var a6 = a[6] | 0;
	    var al6 = a6 & 0x1fff;
	    var ah6 = a6 >>> 13;
	    var a7 = a[7] | 0;
	    var al7 = a7 & 0x1fff;
	    var ah7 = a7 >>> 13;
	    var a8 = a[8] | 0;
	    var al8 = a8 & 0x1fff;
	    var ah8 = a8 >>> 13;
	    var a9 = a[9] | 0;
	    var al9 = a9 & 0x1fff;
	    var ah9 = a9 >>> 13;
	    var b0 = b[0] | 0;
	    var bl0 = b0 & 0x1fff;
	    var bh0 = b0 >>> 13;
	    var b1 = b[1] | 0;
	    var bl1 = b1 & 0x1fff;
	    var bh1 = b1 >>> 13;
	    var b2 = b[2] | 0;
	    var bl2 = b2 & 0x1fff;
	    var bh2 = b2 >>> 13;
	    var b3 = b[3] | 0;
	    var bl3 = b3 & 0x1fff;
	    var bh3 = b3 >>> 13;
	    var b4 = b[4] | 0;
	    var bl4 = b4 & 0x1fff;
	    var bh4 = b4 >>> 13;
	    var b5 = b[5] | 0;
	    var bl5 = b5 & 0x1fff;
	    var bh5 = b5 >>> 13;
	    var b6 = b[6] | 0;
	    var bl6 = b6 & 0x1fff;
	    var bh6 = b6 >>> 13;
	    var b7 = b[7] | 0;
	    var bl7 = b7 & 0x1fff;
	    var bh7 = b7 >>> 13;
	    var b8 = b[8] | 0;
	    var bl8 = b8 & 0x1fff;
	    var bh8 = b8 >>> 13;
	    var b9 = b[9] | 0;
	    var bl9 = b9 & 0x1fff;
	    var bh9 = b9 >>> 13;

	    out.negative = self.negative ^ num.negative;
	    out.length = 19;
	    /* k = 0 */
	    lo = Math.imul(al0, bl0);
	    mid = Math.imul(al0, bh0);
	    mid = (mid + Math.imul(ah0, bl0)) | 0;
	    hi = Math.imul(ah0, bh0);
	    var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
	    w0 &= 0x3ffffff;
	    /* k = 1 */
	    lo = Math.imul(al1, bl0);
	    mid = Math.imul(al1, bh0);
	    mid = (mid + Math.imul(ah1, bl0)) | 0;
	    hi = Math.imul(ah1, bh0);
	    lo = (lo + Math.imul(al0, bl1)) | 0;
	    mid = (mid + Math.imul(al0, bh1)) | 0;
	    mid = (mid + Math.imul(ah0, bl1)) | 0;
	    hi = (hi + Math.imul(ah0, bh1)) | 0;
	    var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
	    w1 &= 0x3ffffff;
	    /* k = 2 */
	    lo = Math.imul(al2, bl0);
	    mid = Math.imul(al2, bh0);
	    mid = (mid + Math.imul(ah2, bl0)) | 0;
	    hi = Math.imul(ah2, bh0);
	    lo = (lo + Math.imul(al1, bl1)) | 0;
	    mid = (mid + Math.imul(al1, bh1)) | 0;
	    mid = (mid + Math.imul(ah1, bl1)) | 0;
	    hi = (hi + Math.imul(ah1, bh1)) | 0;
	    lo = (lo + Math.imul(al0, bl2)) | 0;
	    mid = (mid + Math.imul(al0, bh2)) | 0;
	    mid = (mid + Math.imul(ah0, bl2)) | 0;
	    hi = (hi + Math.imul(ah0, bh2)) | 0;
	    var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
	    w2 &= 0x3ffffff;
	    /* k = 3 */
	    lo = Math.imul(al3, bl0);
	    mid = Math.imul(al3, bh0);
	    mid = (mid + Math.imul(ah3, bl0)) | 0;
	    hi = Math.imul(ah3, bh0);
	    lo = (lo + Math.imul(al2, bl1)) | 0;
	    mid = (mid + Math.imul(al2, bh1)) | 0;
	    mid = (mid + Math.imul(ah2, bl1)) | 0;
	    hi = (hi + Math.imul(ah2, bh1)) | 0;
	    lo = (lo + Math.imul(al1, bl2)) | 0;
	    mid = (mid + Math.imul(al1, bh2)) | 0;
	    mid = (mid + Math.imul(ah1, bl2)) | 0;
	    hi = (hi + Math.imul(ah1, bh2)) | 0;
	    lo = (lo + Math.imul(al0, bl3)) | 0;
	    mid = (mid + Math.imul(al0, bh3)) | 0;
	    mid = (mid + Math.imul(ah0, bl3)) | 0;
	    hi = (hi + Math.imul(ah0, bh3)) | 0;
	    var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
	    w3 &= 0x3ffffff;
	    /* k = 4 */
	    lo = Math.imul(al4, bl0);
	    mid = Math.imul(al4, bh0);
	    mid = (mid + Math.imul(ah4, bl0)) | 0;
	    hi = Math.imul(ah4, bh0);
	    lo = (lo + Math.imul(al3, bl1)) | 0;
	    mid = (mid + Math.imul(al3, bh1)) | 0;
	    mid = (mid + Math.imul(ah3, bl1)) | 0;
	    hi = (hi + Math.imul(ah3, bh1)) | 0;
	    lo = (lo + Math.imul(al2, bl2)) | 0;
	    mid = (mid + Math.imul(al2, bh2)) | 0;
	    mid = (mid + Math.imul(ah2, bl2)) | 0;
	    hi = (hi + Math.imul(ah2, bh2)) | 0;
	    lo = (lo + Math.imul(al1, bl3)) | 0;
	    mid = (mid + Math.imul(al1, bh3)) | 0;
	    mid = (mid + Math.imul(ah1, bl3)) | 0;
	    hi = (hi + Math.imul(ah1, bh3)) | 0;
	    lo = (lo + Math.imul(al0, bl4)) | 0;
	    mid = (mid + Math.imul(al0, bh4)) | 0;
	    mid = (mid + Math.imul(ah0, bl4)) | 0;
	    hi = (hi + Math.imul(ah0, bh4)) | 0;
	    var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
	    w4 &= 0x3ffffff;
	    /* k = 5 */
	    lo = Math.imul(al5, bl0);
	    mid = Math.imul(al5, bh0);
	    mid = (mid + Math.imul(ah5, bl0)) | 0;
	    hi = Math.imul(ah5, bh0);
	    lo = (lo + Math.imul(al4, bl1)) | 0;
	    mid = (mid + Math.imul(al4, bh1)) | 0;
	    mid = (mid + Math.imul(ah4, bl1)) | 0;
	    hi = (hi + Math.imul(ah4, bh1)) | 0;
	    lo = (lo + Math.imul(al3, bl2)) | 0;
	    mid = (mid + Math.imul(al3, bh2)) | 0;
	    mid = (mid + Math.imul(ah3, bl2)) | 0;
	    hi = (hi + Math.imul(ah3, bh2)) | 0;
	    lo = (lo + Math.imul(al2, bl3)) | 0;
	    mid = (mid + Math.imul(al2, bh3)) | 0;
	    mid = (mid + Math.imul(ah2, bl3)) | 0;
	    hi = (hi + Math.imul(ah2, bh3)) | 0;
	    lo = (lo + Math.imul(al1, bl4)) | 0;
	    mid = (mid + Math.imul(al1, bh4)) | 0;
	    mid = (mid + Math.imul(ah1, bl4)) | 0;
	    hi = (hi + Math.imul(ah1, bh4)) | 0;
	    lo = (lo + Math.imul(al0, bl5)) | 0;
	    mid = (mid + Math.imul(al0, bh5)) | 0;
	    mid = (mid + Math.imul(ah0, bl5)) | 0;
	    hi = (hi + Math.imul(ah0, bh5)) | 0;
	    var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
	    w5 &= 0x3ffffff;
	    /* k = 6 */
	    lo = Math.imul(al6, bl0);
	    mid = Math.imul(al6, bh0);
	    mid = (mid + Math.imul(ah6, bl0)) | 0;
	    hi = Math.imul(ah6, bh0);
	    lo = (lo + Math.imul(al5, bl1)) | 0;
	    mid = (mid + Math.imul(al5, bh1)) | 0;
	    mid = (mid + Math.imul(ah5, bl1)) | 0;
	    hi = (hi + Math.imul(ah5, bh1)) | 0;
	    lo = (lo + Math.imul(al4, bl2)) | 0;
	    mid = (mid + Math.imul(al4, bh2)) | 0;
	    mid = (mid + Math.imul(ah4, bl2)) | 0;
	    hi = (hi + Math.imul(ah4, bh2)) | 0;
	    lo = (lo + Math.imul(al3, bl3)) | 0;
	    mid = (mid + Math.imul(al3, bh3)) | 0;
	    mid = (mid + Math.imul(ah3, bl3)) | 0;
	    hi = (hi + Math.imul(ah3, bh3)) | 0;
	    lo = (lo + Math.imul(al2, bl4)) | 0;
	    mid = (mid + Math.imul(al2, bh4)) | 0;
	    mid = (mid + Math.imul(ah2, bl4)) | 0;
	    hi = (hi + Math.imul(ah2, bh4)) | 0;
	    lo = (lo + Math.imul(al1, bl5)) | 0;
	    mid = (mid + Math.imul(al1, bh5)) | 0;
	    mid = (mid + Math.imul(ah1, bl5)) | 0;
	    hi = (hi + Math.imul(ah1, bh5)) | 0;
	    lo = (lo + Math.imul(al0, bl6)) | 0;
	    mid = (mid + Math.imul(al0, bh6)) | 0;
	    mid = (mid + Math.imul(ah0, bl6)) | 0;
	    hi = (hi + Math.imul(ah0, bh6)) | 0;
	    var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
	    w6 &= 0x3ffffff;
	    /* k = 7 */
	    lo = Math.imul(al7, bl0);
	    mid = Math.imul(al7, bh0);
	    mid = (mid + Math.imul(ah7, bl0)) | 0;
	    hi = Math.imul(ah7, bh0);
	    lo = (lo + Math.imul(al6, bl1)) | 0;
	    mid = (mid + Math.imul(al6, bh1)) | 0;
	    mid = (mid + Math.imul(ah6, bl1)) | 0;
	    hi = (hi + Math.imul(ah6, bh1)) | 0;
	    lo = (lo + Math.imul(al5, bl2)) | 0;
	    mid = (mid + Math.imul(al5, bh2)) | 0;
	    mid = (mid + Math.imul(ah5, bl2)) | 0;
	    hi = (hi + Math.imul(ah5, bh2)) | 0;
	    lo = (lo + Math.imul(al4, bl3)) | 0;
	    mid = (mid + Math.imul(al4, bh3)) | 0;
	    mid = (mid + Math.imul(ah4, bl3)) | 0;
	    hi = (hi + Math.imul(ah4, bh3)) | 0;
	    lo = (lo + Math.imul(al3, bl4)) | 0;
	    mid = (mid + Math.imul(al3, bh4)) | 0;
	    mid = (mid + Math.imul(ah3, bl4)) | 0;
	    hi = (hi + Math.imul(ah3, bh4)) | 0;
	    lo = (lo + Math.imul(al2, bl5)) | 0;
	    mid = (mid + Math.imul(al2, bh5)) | 0;
	    mid = (mid + Math.imul(ah2, bl5)) | 0;
	    hi = (hi + Math.imul(ah2, bh5)) | 0;
	    lo = (lo + Math.imul(al1, bl6)) | 0;
	    mid = (mid + Math.imul(al1, bh6)) | 0;
	    mid = (mid + Math.imul(ah1, bl6)) | 0;
	    hi = (hi + Math.imul(ah1, bh6)) | 0;
	    lo = (lo + Math.imul(al0, bl7)) | 0;
	    mid = (mid + Math.imul(al0, bh7)) | 0;
	    mid = (mid + Math.imul(ah0, bl7)) | 0;
	    hi = (hi + Math.imul(ah0, bh7)) | 0;
	    var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
	    w7 &= 0x3ffffff;
	    /* k = 8 */
	    lo = Math.imul(al8, bl0);
	    mid = Math.imul(al8, bh0);
	    mid = (mid + Math.imul(ah8, bl0)) | 0;
	    hi = Math.imul(ah8, bh0);
	    lo = (lo + Math.imul(al7, bl1)) | 0;
	    mid = (mid + Math.imul(al7, bh1)) | 0;
	    mid = (mid + Math.imul(ah7, bl1)) | 0;
	    hi = (hi + Math.imul(ah7, bh1)) | 0;
	    lo = (lo + Math.imul(al6, bl2)) | 0;
	    mid = (mid + Math.imul(al6, bh2)) | 0;
	    mid = (mid + Math.imul(ah6, bl2)) | 0;
	    hi = (hi + Math.imul(ah6, bh2)) | 0;
	    lo = (lo + Math.imul(al5, bl3)) | 0;
	    mid = (mid + Math.imul(al5, bh3)) | 0;
	    mid = (mid + Math.imul(ah5, bl3)) | 0;
	    hi = (hi + Math.imul(ah5, bh3)) | 0;
	    lo = (lo + Math.imul(al4, bl4)) | 0;
	    mid = (mid + Math.imul(al4, bh4)) | 0;
	    mid = (mid + Math.imul(ah4, bl4)) | 0;
	    hi = (hi + Math.imul(ah4, bh4)) | 0;
	    lo = (lo + Math.imul(al3, bl5)) | 0;
	    mid = (mid + Math.imul(al3, bh5)) | 0;
	    mid = (mid + Math.imul(ah3, bl5)) | 0;
	    hi = (hi + Math.imul(ah3, bh5)) | 0;
	    lo = (lo + Math.imul(al2, bl6)) | 0;
	    mid = (mid + Math.imul(al2, bh6)) | 0;
	    mid = (mid + Math.imul(ah2, bl6)) | 0;
	    hi = (hi + Math.imul(ah2, bh6)) | 0;
	    lo = (lo + Math.imul(al1, bl7)) | 0;
	    mid = (mid + Math.imul(al1, bh7)) | 0;
	    mid = (mid + Math.imul(ah1, bl7)) | 0;
	    hi = (hi + Math.imul(ah1, bh7)) | 0;
	    lo = (lo + Math.imul(al0, bl8)) | 0;
	    mid = (mid + Math.imul(al0, bh8)) | 0;
	    mid = (mid + Math.imul(ah0, bl8)) | 0;
	    hi = (hi + Math.imul(ah0, bh8)) | 0;
	    var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
	    w8 &= 0x3ffffff;
	    /* k = 9 */
	    lo = Math.imul(al9, bl0);
	    mid = Math.imul(al9, bh0);
	    mid = (mid + Math.imul(ah9, bl0)) | 0;
	    hi = Math.imul(ah9, bh0);
	    lo = (lo + Math.imul(al8, bl1)) | 0;
	    mid = (mid + Math.imul(al8, bh1)) | 0;
	    mid = (mid + Math.imul(ah8, bl1)) | 0;
	    hi = (hi + Math.imul(ah8, bh1)) | 0;
	    lo = (lo + Math.imul(al7, bl2)) | 0;
	    mid = (mid + Math.imul(al7, bh2)) | 0;
	    mid = (mid + Math.imul(ah7, bl2)) | 0;
	    hi = (hi + Math.imul(ah7, bh2)) | 0;
	    lo = (lo + Math.imul(al6, bl3)) | 0;
	    mid = (mid + Math.imul(al6, bh3)) | 0;
	    mid = (mid + Math.imul(ah6, bl3)) | 0;
	    hi = (hi + Math.imul(ah6, bh3)) | 0;
	    lo = (lo + Math.imul(al5, bl4)) | 0;
	    mid = (mid + Math.imul(al5, bh4)) | 0;
	    mid = (mid + Math.imul(ah5, bl4)) | 0;
	    hi = (hi + Math.imul(ah5, bh4)) | 0;
	    lo = (lo + Math.imul(al4, bl5)) | 0;
	    mid = (mid + Math.imul(al4, bh5)) | 0;
	    mid = (mid + Math.imul(ah4, bl5)) | 0;
	    hi = (hi + Math.imul(ah4, bh5)) | 0;
	    lo = (lo + Math.imul(al3, bl6)) | 0;
	    mid = (mid + Math.imul(al3, bh6)) | 0;
	    mid = (mid + Math.imul(ah3, bl6)) | 0;
	    hi = (hi + Math.imul(ah3, bh6)) | 0;
	    lo = (lo + Math.imul(al2, bl7)) | 0;
	    mid = (mid + Math.imul(al2, bh7)) | 0;
	    mid = (mid + Math.imul(ah2, bl7)) | 0;
	    hi = (hi + Math.imul(ah2, bh7)) | 0;
	    lo = (lo + Math.imul(al1, bl8)) | 0;
	    mid = (mid + Math.imul(al1, bh8)) | 0;
	    mid = (mid + Math.imul(ah1, bl8)) | 0;
	    hi = (hi + Math.imul(ah1, bh8)) | 0;
	    lo = (lo + Math.imul(al0, bl9)) | 0;
	    mid = (mid + Math.imul(al0, bh9)) | 0;
	    mid = (mid + Math.imul(ah0, bl9)) | 0;
	    hi = (hi + Math.imul(ah0, bh9)) | 0;
	    var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
	    w9 &= 0x3ffffff;
	    /* k = 10 */
	    lo = Math.imul(al9, bl1);
	    mid = Math.imul(al9, bh1);
	    mid = (mid + Math.imul(ah9, bl1)) | 0;
	    hi = Math.imul(ah9, bh1);
	    lo = (lo + Math.imul(al8, bl2)) | 0;
	    mid = (mid + Math.imul(al8, bh2)) | 0;
	    mid = (mid + Math.imul(ah8, bl2)) | 0;
	    hi = (hi + Math.imul(ah8, bh2)) | 0;
	    lo = (lo + Math.imul(al7, bl3)) | 0;
	    mid = (mid + Math.imul(al7, bh3)) | 0;
	    mid = (mid + Math.imul(ah7, bl3)) | 0;
	    hi = (hi + Math.imul(ah7, bh3)) | 0;
	    lo = (lo + Math.imul(al6, bl4)) | 0;
	    mid = (mid + Math.imul(al6, bh4)) | 0;
	    mid = (mid + Math.imul(ah6, bl4)) | 0;
	    hi = (hi + Math.imul(ah6, bh4)) | 0;
	    lo = (lo + Math.imul(al5, bl5)) | 0;
	    mid = (mid + Math.imul(al5, bh5)) | 0;
	    mid = (mid + Math.imul(ah5, bl5)) | 0;
	    hi = (hi + Math.imul(ah5, bh5)) | 0;
	    lo = (lo + Math.imul(al4, bl6)) | 0;
	    mid = (mid + Math.imul(al4, bh6)) | 0;
	    mid = (mid + Math.imul(ah4, bl6)) | 0;
	    hi = (hi + Math.imul(ah4, bh6)) | 0;
	    lo = (lo + Math.imul(al3, bl7)) | 0;
	    mid = (mid + Math.imul(al3, bh7)) | 0;
	    mid = (mid + Math.imul(ah3, bl7)) | 0;
	    hi = (hi + Math.imul(ah3, bh7)) | 0;
	    lo = (lo + Math.imul(al2, bl8)) | 0;
	    mid = (mid + Math.imul(al2, bh8)) | 0;
	    mid = (mid + Math.imul(ah2, bl8)) | 0;
	    hi = (hi + Math.imul(ah2, bh8)) | 0;
	    lo = (lo + Math.imul(al1, bl9)) | 0;
	    mid = (mid + Math.imul(al1, bh9)) | 0;
	    mid = (mid + Math.imul(ah1, bl9)) | 0;
	    hi = (hi + Math.imul(ah1, bh9)) | 0;
	    var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
	    w10 &= 0x3ffffff;
	    /* k = 11 */
	    lo = Math.imul(al9, bl2);
	    mid = Math.imul(al9, bh2);
	    mid = (mid + Math.imul(ah9, bl2)) | 0;
	    hi = Math.imul(ah9, bh2);
	    lo = (lo + Math.imul(al8, bl3)) | 0;
	    mid = (mid + Math.imul(al8, bh3)) | 0;
	    mid = (mid + Math.imul(ah8, bl3)) | 0;
	    hi = (hi + Math.imul(ah8, bh3)) | 0;
	    lo = (lo + Math.imul(al7, bl4)) | 0;
	    mid = (mid + Math.imul(al7, bh4)) | 0;
	    mid = (mid + Math.imul(ah7, bl4)) | 0;
	    hi = (hi + Math.imul(ah7, bh4)) | 0;
	    lo = (lo + Math.imul(al6, bl5)) | 0;
	    mid = (mid + Math.imul(al6, bh5)) | 0;
	    mid = (mid + Math.imul(ah6, bl5)) | 0;
	    hi = (hi + Math.imul(ah6, bh5)) | 0;
	    lo = (lo + Math.imul(al5, bl6)) | 0;
	    mid = (mid + Math.imul(al5, bh6)) | 0;
	    mid = (mid + Math.imul(ah5, bl6)) | 0;
	    hi = (hi + Math.imul(ah5, bh6)) | 0;
	    lo = (lo + Math.imul(al4, bl7)) | 0;
	    mid = (mid + Math.imul(al4, bh7)) | 0;
	    mid = (mid + Math.imul(ah4, bl7)) | 0;
	    hi = (hi + Math.imul(ah4, bh7)) | 0;
	    lo = (lo + Math.imul(al3, bl8)) | 0;
	    mid = (mid + Math.imul(al3, bh8)) | 0;
	    mid = (mid + Math.imul(ah3, bl8)) | 0;
	    hi = (hi + Math.imul(ah3, bh8)) | 0;
	    lo = (lo + Math.imul(al2, bl9)) | 0;
	    mid = (mid + Math.imul(al2, bh9)) | 0;
	    mid = (mid + Math.imul(ah2, bl9)) | 0;
	    hi = (hi + Math.imul(ah2, bh9)) | 0;
	    var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
	    w11 &= 0x3ffffff;
	    /* k = 12 */
	    lo = Math.imul(al9, bl3);
	    mid = Math.imul(al9, bh3);
	    mid = (mid + Math.imul(ah9, bl3)) | 0;
	    hi = Math.imul(ah9, bh3);
	    lo = (lo + Math.imul(al8, bl4)) | 0;
	    mid = (mid + Math.imul(al8, bh4)) | 0;
	    mid = (mid + Math.imul(ah8, bl4)) | 0;
	    hi = (hi + Math.imul(ah8, bh4)) | 0;
	    lo = (lo + Math.imul(al7, bl5)) | 0;
	    mid = (mid + Math.imul(al7, bh5)) | 0;
	    mid = (mid + Math.imul(ah7, bl5)) | 0;
	    hi = (hi + Math.imul(ah7, bh5)) | 0;
	    lo = (lo + Math.imul(al6, bl6)) | 0;
	    mid = (mid + Math.imul(al6, bh6)) | 0;
	    mid = (mid + Math.imul(ah6, bl6)) | 0;
	    hi = (hi + Math.imul(ah6, bh6)) | 0;
	    lo = (lo + Math.imul(al5, bl7)) | 0;
	    mid = (mid + Math.imul(al5, bh7)) | 0;
	    mid = (mid + Math.imul(ah5, bl7)) | 0;
	    hi = (hi + Math.imul(ah5, bh7)) | 0;
	    lo = (lo + Math.imul(al4, bl8)) | 0;
	    mid = (mid + Math.imul(al4, bh8)) | 0;
	    mid = (mid + Math.imul(ah4, bl8)) | 0;
	    hi = (hi + Math.imul(ah4, bh8)) | 0;
	    lo = (lo + Math.imul(al3, bl9)) | 0;
	    mid = (mid + Math.imul(al3, bh9)) | 0;
	    mid = (mid + Math.imul(ah3, bl9)) | 0;
	    hi = (hi + Math.imul(ah3, bh9)) | 0;
	    var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
	    w12 &= 0x3ffffff;
	    /* k = 13 */
	    lo = Math.imul(al9, bl4);
	    mid = Math.imul(al9, bh4);
	    mid = (mid + Math.imul(ah9, bl4)) | 0;
	    hi = Math.imul(ah9, bh4);
	    lo = (lo + Math.imul(al8, bl5)) | 0;
	    mid = (mid + Math.imul(al8, bh5)) | 0;
	    mid = (mid + Math.imul(ah8, bl5)) | 0;
	    hi = (hi + Math.imul(ah8, bh5)) | 0;
	    lo = (lo + Math.imul(al7, bl6)) | 0;
	    mid = (mid + Math.imul(al7, bh6)) | 0;
	    mid = (mid + Math.imul(ah7, bl6)) | 0;
	    hi = (hi + Math.imul(ah7, bh6)) | 0;
	    lo = (lo + Math.imul(al6, bl7)) | 0;
	    mid = (mid + Math.imul(al6, bh7)) | 0;
	    mid = (mid + Math.imul(ah6, bl7)) | 0;
	    hi = (hi + Math.imul(ah6, bh7)) | 0;
	    lo = (lo + Math.imul(al5, bl8)) | 0;
	    mid = (mid + Math.imul(al5, bh8)) | 0;
	    mid = (mid + Math.imul(ah5, bl8)) | 0;
	    hi = (hi + Math.imul(ah5, bh8)) | 0;
	    lo = (lo + Math.imul(al4, bl9)) | 0;
	    mid = (mid + Math.imul(al4, bh9)) | 0;
	    mid = (mid + Math.imul(ah4, bl9)) | 0;
	    hi = (hi + Math.imul(ah4, bh9)) | 0;
	    var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
	    w13 &= 0x3ffffff;
	    /* k = 14 */
	    lo = Math.imul(al9, bl5);
	    mid = Math.imul(al9, bh5);
	    mid = (mid + Math.imul(ah9, bl5)) | 0;
	    hi = Math.imul(ah9, bh5);
	    lo = (lo + Math.imul(al8, bl6)) | 0;
	    mid = (mid + Math.imul(al8, bh6)) | 0;
	    mid = (mid + Math.imul(ah8, bl6)) | 0;
	    hi = (hi + Math.imul(ah8, bh6)) | 0;
	    lo = (lo + Math.imul(al7, bl7)) | 0;
	    mid = (mid + Math.imul(al7, bh7)) | 0;
	    mid = (mid + Math.imul(ah7, bl7)) | 0;
	    hi = (hi + Math.imul(ah7, bh7)) | 0;
	    lo = (lo + Math.imul(al6, bl8)) | 0;
	    mid = (mid + Math.imul(al6, bh8)) | 0;
	    mid = (mid + Math.imul(ah6, bl8)) | 0;
	    hi = (hi + Math.imul(ah6, bh8)) | 0;
	    lo = (lo + Math.imul(al5, bl9)) | 0;
	    mid = (mid + Math.imul(al5, bh9)) | 0;
	    mid = (mid + Math.imul(ah5, bl9)) | 0;
	    hi = (hi + Math.imul(ah5, bh9)) | 0;
	    var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
	    w14 &= 0x3ffffff;
	    /* k = 15 */
	    lo = Math.imul(al9, bl6);
	    mid = Math.imul(al9, bh6);
	    mid = (mid + Math.imul(ah9, bl6)) | 0;
	    hi = Math.imul(ah9, bh6);
	    lo = (lo + Math.imul(al8, bl7)) | 0;
	    mid = (mid + Math.imul(al8, bh7)) | 0;
	    mid = (mid + Math.imul(ah8, bl7)) | 0;
	    hi = (hi + Math.imul(ah8, bh7)) | 0;
	    lo = (lo + Math.imul(al7, bl8)) | 0;
	    mid = (mid + Math.imul(al7, bh8)) | 0;
	    mid = (mid + Math.imul(ah7, bl8)) | 0;
	    hi = (hi + Math.imul(ah7, bh8)) | 0;
	    lo = (lo + Math.imul(al6, bl9)) | 0;
	    mid = (mid + Math.imul(al6, bh9)) | 0;
	    mid = (mid + Math.imul(ah6, bl9)) | 0;
	    hi = (hi + Math.imul(ah6, bh9)) | 0;
	    var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
	    w15 &= 0x3ffffff;
	    /* k = 16 */
	    lo = Math.imul(al9, bl7);
	    mid = Math.imul(al9, bh7);
	    mid = (mid + Math.imul(ah9, bl7)) | 0;
	    hi = Math.imul(ah9, bh7);
	    lo = (lo + Math.imul(al8, bl8)) | 0;
	    mid = (mid + Math.imul(al8, bh8)) | 0;
	    mid = (mid + Math.imul(ah8, bl8)) | 0;
	    hi = (hi + Math.imul(ah8, bh8)) | 0;
	    lo = (lo + Math.imul(al7, bl9)) | 0;
	    mid = (mid + Math.imul(al7, bh9)) | 0;
	    mid = (mid + Math.imul(ah7, bl9)) | 0;
	    hi = (hi + Math.imul(ah7, bh9)) | 0;
	    var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
	    w16 &= 0x3ffffff;
	    /* k = 17 */
	    lo = Math.imul(al9, bl8);
	    mid = Math.imul(al9, bh8);
	    mid = (mid + Math.imul(ah9, bl8)) | 0;
	    hi = Math.imul(ah9, bh8);
	    lo = (lo + Math.imul(al8, bl9)) | 0;
	    mid = (mid + Math.imul(al8, bh9)) | 0;
	    mid = (mid + Math.imul(ah8, bl9)) | 0;
	    hi = (hi + Math.imul(ah8, bh9)) | 0;
	    var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
	    w17 &= 0x3ffffff;
	    /* k = 18 */
	    lo = Math.imul(al9, bl9);
	    mid = Math.imul(al9, bh9);
	    mid = (mid + Math.imul(ah9, bl9)) | 0;
	    hi = Math.imul(ah9, bh9);
	    var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
	    w18 &= 0x3ffffff;
	    o[0] = w0;
	    o[1] = w1;
	    o[2] = w2;
	    o[3] = w3;
	    o[4] = w4;
	    o[5] = w5;
	    o[6] = w6;
	    o[7] = w7;
	    o[8] = w8;
	    o[9] = w9;
	    o[10] = w10;
	    o[11] = w11;
	    o[12] = w12;
	    o[13] = w13;
	    o[14] = w14;
	    o[15] = w15;
	    o[16] = w16;
	    o[17] = w17;
	    o[18] = w18;
	    if (c !== 0) {
	      o[19] = c;
	      out.length++;
	    }
	    return out;
	  };

	  // Polyfill comb
	  if (!Math.imul) {
	    comb10MulTo = smallMulTo;
	  }

	  function bigMulTo (self, num, out) {
	    out.negative = num.negative ^ self.negative;
	    out.length = self.length + num.length;

	    var carry = 0;
	    var hncarry = 0;
	    for (var k = 0; k < out.length - 1; k++) {
	      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	      // note that ncarry could be >= 0x3ffffff
	      var ncarry = hncarry;
	      hncarry = 0;
	      var rword = carry & 0x3ffffff;
	      var maxJ = Math.min(k, num.length - 1);
	      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
	        var i = k - j;
	        var a = self.words[i] | 0;
	        var b = num.words[j] | 0;
	        var r = a * b;

	        var lo = r & 0x3ffffff;
	        ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
	        lo = (lo + rword) | 0;
	        rword = lo & 0x3ffffff;
	        ncarry = (ncarry + (lo >>> 26)) | 0;

	        hncarry += ncarry >>> 26;
	        ncarry &= 0x3ffffff;
	      }
	      out.words[k] = rword;
	      carry = ncarry;
	      ncarry = hncarry;
	    }
	    if (carry !== 0) {
	      out.words[k] = carry;
	    } else {
	      out.length--;
	    }

	    return out._strip();
	  }

	  function jumboMulTo (self, num, out) {
	    // Temporary disable, see https://github.com/indutny/bn.js/issues/211
	    // var fftm = new FFTM();
	    // return fftm.mulp(self, num, out);
	    return bigMulTo(self, num, out);
	  }

	  BN.prototype.mulTo = function mulTo (num, out) {
	    var res;
	    var len = this.length + num.length;
	    if (this.length === 10 && num.length === 10) {
	      res = comb10MulTo(this, num, out);
	    } else if (len < 63) {
	      res = smallMulTo(this, num, out);
	    } else if (len < 1024) {
	      res = bigMulTo(this, num, out);
	    } else {
	      res = jumboMulTo(this, num, out);
	    }

	    return res;
	  };

	  // Multiply `this` by `num`
	  BN.prototype.mul = function mul (num) {
	    var out = new BN(null);
	    out.words = new Array(this.length + num.length);
	    return this.mulTo(num, out);
	  };

	  // Multiply employing FFT
	  BN.prototype.mulf = function mulf (num) {
	    var out = new BN(null);
	    out.words = new Array(this.length + num.length);
	    return jumboMulTo(this, num, out);
	  };

	  // In-place Multiplication
	  BN.prototype.imul = function imul (num) {
	    return this.clone().mulTo(num, this);
	  };

	  BN.prototype.imuln = function imuln (num) {
	    var isNegNum = num < 0;
	    if (isNegNum) num = -num;

	    assert(typeof num === 'number');
	    assert(num < 0x4000000);

	    // Carry
	    var carry = 0;
	    for (var i = 0; i < this.length; i++) {
	      var w = (this.words[i] | 0) * num;
	      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
	      carry >>= 26;
	      carry += (w / 0x4000000) | 0;
	      // NOTE: lo is 27bit maximum
	      carry += lo >>> 26;
	      this.words[i] = lo & 0x3ffffff;
	    }

	    if (carry !== 0) {
	      this.words[i] = carry;
	      this.length++;
	    }

	    return isNegNum ? this.ineg() : this;
	  };

	  BN.prototype.muln = function muln (num) {
	    return this.clone().imuln(num);
	  };

	  // `this` * `this`
	  BN.prototype.sqr = function sqr () {
	    return this.mul(this);
	  };

	  // `this` * `this` in-place
	  BN.prototype.isqr = function isqr () {
	    return this.imul(this.clone());
	  };

	  // Math.pow(`this`, `num`)
	  BN.prototype.pow = function pow (num) {
	    var w = toBitArray(num);
	    if (w.length === 0) return new BN(1);

	    // Skip leading zeroes
	    var res = this;
	    for (var i = 0; i < w.length; i++, res = res.sqr()) {
	      if (w[i] !== 0) break;
	    }

	    if (++i < w.length) {
	      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
	        if (w[i] === 0) continue;

	        res = res.mul(q);
	      }
	    }

	    return res;
	  };

	  // Shift-left in-place
	  BN.prototype.iushln = function iushln (bits) {
	    assert(typeof bits === 'number' && bits >= 0);
	    var r = bits % 26;
	    var s = (bits - r) / 26;
	    var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
	    var i;

	    if (r !== 0) {
	      var carry = 0;

	      for (i = 0; i < this.length; i++) {
	        var newCarry = this.words[i] & carryMask;
	        var c = ((this.words[i] | 0) - newCarry) << r;
	        this.words[i] = c | carry;
	        carry = newCarry >>> (26 - r);
	      }

	      if (carry) {
	        this.words[i] = carry;
	        this.length++;
	      }
	    }

	    if (s !== 0) {
	      for (i = this.length - 1; i >= 0; i--) {
	        this.words[i + s] = this.words[i];
	      }

	      for (i = 0; i < s; i++) {
	        this.words[i] = 0;
	      }

	      this.length += s;
	    }

	    return this._strip();
	  };

	  BN.prototype.ishln = function ishln (bits) {
	    // TODO(indutny): implement me
	    assert(this.negative === 0);
	    return this.iushln(bits);
	  };

	  // Shift-right in-place
	  // NOTE: `hint` is a lowest bit before trailing zeroes
	  // NOTE: if `extended` is present - it will be filled with destroyed bits
	  BN.prototype.iushrn = function iushrn (bits, hint, extended) {
	    assert(typeof bits === 'number' && bits >= 0);
	    var h;
	    if (hint) {
	      h = (hint - (hint % 26)) / 26;
	    } else {
	      h = 0;
	    }

	    var r = bits % 26;
	    var s = Math.min((bits - r) / 26, this.length);
	    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
	    var maskedWords = extended;

	    h -= s;
	    h = Math.max(0, h);

	    // Extended mode, copy masked part
	    if (maskedWords) {
	      for (var i = 0; i < s; i++) {
	        maskedWords.words[i] = this.words[i];
	      }
	      maskedWords.length = s;
	    }

	    if (s === 0) ; else if (this.length > s) {
	      this.length -= s;
	      for (i = 0; i < this.length; i++) {
	        this.words[i] = this.words[i + s];
	      }
	    } else {
	      this.words[0] = 0;
	      this.length = 1;
	    }

	    var carry = 0;
	    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
	      var word = this.words[i] | 0;
	      this.words[i] = (carry << (26 - r)) | (word >>> r);
	      carry = word & mask;
	    }

	    // Push carried bits as a mask
	    if (maskedWords && carry !== 0) {
	      maskedWords.words[maskedWords.length++] = carry;
	    }

	    if (this.length === 0) {
	      this.words[0] = 0;
	      this.length = 1;
	    }

	    return this._strip();
	  };

	  BN.prototype.ishrn = function ishrn (bits, hint, extended) {
	    // TODO(indutny): implement me
	    assert(this.negative === 0);
	    return this.iushrn(bits, hint, extended);
	  };

	  // Shift-left
	  BN.prototype.shln = function shln (bits) {
	    return this.clone().ishln(bits);
	  };

	  BN.prototype.ushln = function ushln (bits) {
	    return this.clone().iushln(bits);
	  };

	  // Shift-right
	  BN.prototype.shrn = function shrn (bits) {
	    return this.clone().ishrn(bits);
	  };

	  BN.prototype.ushrn = function ushrn (bits) {
	    return this.clone().iushrn(bits);
	  };

	  // Test if n bit is set
	  BN.prototype.testn = function testn (bit) {
	    assert(typeof bit === 'number' && bit >= 0);
	    var r = bit % 26;
	    var s = (bit - r) / 26;
	    var q = 1 << r;

	    // Fast case: bit is much higher than all existing words
	    if (this.length <= s) return false;

	    // Check bit and return
	    var w = this.words[s];

	    return !!(w & q);
	  };

	  // Return only lowers bits of number (in-place)
	  BN.prototype.imaskn = function imaskn (bits) {
	    assert(typeof bits === 'number' && bits >= 0);
	    var r = bits % 26;
	    var s = (bits - r) / 26;

	    assert(this.negative === 0, 'imaskn works only with positive numbers');

	    if (this.length <= s) {
	      return this;
	    }

	    if (r !== 0) {
	      s++;
	    }
	    this.length = Math.min(s, this.length);

	    if (r !== 0) {
	      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
	      this.words[this.length - 1] &= mask;
	    }

	    return this._strip();
	  };

	  // Return only lowers bits of number
	  BN.prototype.maskn = function maskn (bits) {
	    return this.clone().imaskn(bits);
	  };

	  // Add plain number `num` to `this`
	  BN.prototype.iaddn = function iaddn (num) {
	    assert(typeof num === 'number');
	    assert(num < 0x4000000);
	    if (num < 0) return this.isubn(-num);

	    // Possible sign change
	    if (this.negative !== 0) {
	      if (this.length === 1 && (this.words[0] | 0) <= num) {
	        this.words[0] = num - (this.words[0] | 0);
	        this.negative = 0;
	        return this;
	      }

	      this.negative = 0;
	      this.isubn(num);
	      this.negative = 1;
	      return this;
	    }

	    // Add without checks
	    return this._iaddn(num);
	  };

	  BN.prototype._iaddn = function _iaddn (num) {
	    this.words[0] += num;

	    // Carry
	    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
	      this.words[i] -= 0x4000000;
	      if (i === this.length - 1) {
	        this.words[i + 1] = 1;
	      } else {
	        this.words[i + 1]++;
	      }
	    }
	    this.length = Math.max(this.length, i + 1);

	    return this;
	  };

	  // Subtract plain number `num` from `this`
	  BN.prototype.isubn = function isubn (num) {
	    assert(typeof num === 'number');
	    assert(num < 0x4000000);
	    if (num < 0) return this.iaddn(-num);

	    if (this.negative !== 0) {
	      this.negative = 0;
	      this.iaddn(num);
	      this.negative = 1;
	      return this;
	    }

	    this.words[0] -= num;

	    if (this.length === 1 && this.words[0] < 0) {
	      this.words[0] = -this.words[0];
	      this.negative = 1;
	    } else {
	      // Carry
	      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
	        this.words[i] += 0x4000000;
	        this.words[i + 1] -= 1;
	      }
	    }

	    return this._strip();
	  };

	  BN.prototype.addn = function addn (num) {
	    return this.clone().iaddn(num);
	  };

	  BN.prototype.subn = function subn (num) {
	    return this.clone().isubn(num);
	  };

	  BN.prototype.iabs = function iabs () {
	    this.negative = 0;

	    return this;
	  };

	  BN.prototype.abs = function abs () {
	    return this.clone().iabs();
	  };

	  BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
	    var len = num.length + shift;
	    var i;

	    this._expand(len);

	    var w;
	    var carry = 0;
	    for (i = 0; i < num.length; i++) {
	      w = (this.words[i + shift] | 0) + carry;
	      var right = (num.words[i] | 0) * mul;
	      w -= right & 0x3ffffff;
	      carry = (w >> 26) - ((right / 0x4000000) | 0);
	      this.words[i + shift] = w & 0x3ffffff;
	    }
	    for (; i < this.length - shift; i++) {
	      w = (this.words[i + shift] | 0) + carry;
	      carry = w >> 26;
	      this.words[i + shift] = w & 0x3ffffff;
	    }

	    if (carry === 0) return this._strip();

	    // Subtraction overflow
	    assert(carry === -1);
	    carry = 0;
	    for (i = 0; i < this.length; i++) {
	      w = -(this.words[i] | 0) + carry;
	      carry = w >> 26;
	      this.words[i] = w & 0x3ffffff;
	    }
	    this.negative = 1;

	    return this._strip();
	  };

	  BN.prototype._wordDiv = function _wordDiv (num, mode) {
	    var shift = this.length - num.length;

	    var a = this.clone();
	    var b = num;

	    // Normalize
	    var bhi = b.words[b.length - 1] | 0;
	    var bhiBits = this._countBits(bhi);
	    shift = 26 - bhiBits;
	    if (shift !== 0) {
	      b = b.ushln(shift);
	      a.iushln(shift);
	      bhi = b.words[b.length - 1] | 0;
	    }

	    // Initialize quotient
	    var m = a.length - b.length;
	    var q;

	    if (mode !== 'mod') {
	      q = new BN(null);
	      q.length = m + 1;
	      q.words = new Array(q.length);
	      for (var i = 0; i < q.length; i++) {
	        q.words[i] = 0;
	      }
	    }

	    var diff = a.clone()._ishlnsubmul(b, 1, m);
	    if (diff.negative === 0) {
	      a = diff;
	      if (q) {
	        q.words[m] = 1;
	      }
	    }

	    for (var j = m - 1; j >= 0; j--) {
	      var qj = (a.words[b.length + j] | 0) * 0x4000000 +
	        (a.words[b.length + j - 1] | 0);

	      // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
	      // (0x7ffffff)
	      qj = Math.min((qj / bhi) | 0, 0x3ffffff);

	      a._ishlnsubmul(b, qj, j);
	      while (a.negative !== 0) {
	        qj--;
	        a.negative = 0;
	        a._ishlnsubmul(b, 1, j);
	        if (!a.isZero()) {
	          a.negative ^= 1;
	        }
	      }
	      if (q) {
	        q.words[j] = qj;
	      }
	    }
	    if (q) {
	      q._strip();
	    }
	    a._strip();

	    // Denormalize
	    if (mode !== 'div' && shift !== 0) {
	      a.iushrn(shift);
	    }

	    return {
	      div: q || null,
	      mod: a
	    };
	  };

	  // NOTE: 1) `mode` can be set to `mod` to request mod only,
	  //       to `div` to request div only, or be absent to
	  //       request both div & mod
	  //       2) `positive` is true if unsigned mod is requested
	  BN.prototype.divmod = function divmod (num, mode, positive) {
	    assert(!num.isZero());

	    if (this.isZero()) {
	      return {
	        div: new BN(0),
	        mod: new BN(0)
	      };
	    }

	    var div, mod, res;
	    if (this.negative !== 0 && num.negative === 0) {
	      res = this.neg().divmod(num, mode);

	      if (mode !== 'mod') {
	        div = res.div.neg();
	      }

	      if (mode !== 'div') {
	        mod = res.mod.neg();
	        if (positive && mod.negative !== 0) {
	          mod.iadd(num);
	        }
	      }

	      return {
	        div: div,
	        mod: mod
	      };
	    }

	    if (this.negative === 0 && num.negative !== 0) {
	      res = this.divmod(num.neg(), mode);

	      if (mode !== 'mod') {
	        div = res.div.neg();
	      }

	      return {
	        div: div,
	        mod: res.mod
	      };
	    }

	    if ((this.negative & num.negative) !== 0) {
	      res = this.neg().divmod(num.neg(), mode);

	      if (mode !== 'div') {
	        mod = res.mod.neg();
	        if (positive && mod.negative !== 0) {
	          mod.isub(num);
	        }
	      }

	      return {
	        div: res.div,
	        mod: mod
	      };
	    }

	    // Both numbers are positive at this point

	    // Strip both numbers to approximate shift value
	    if (num.length > this.length || this.cmp(num) < 0) {
	      return {
	        div: new BN(0),
	        mod: this
	      };
	    }

	    // Very short reduction
	    if (num.length === 1) {
	      if (mode === 'div') {
	        return {
	          div: this.divn(num.words[0]),
	          mod: null
	        };
	      }

	      if (mode === 'mod') {
	        return {
	          div: null,
	          mod: new BN(this.modrn(num.words[0]))
	        };
	      }

	      return {
	        div: this.divn(num.words[0]),
	        mod: new BN(this.modrn(num.words[0]))
	      };
	    }

	    return this._wordDiv(num, mode);
	  };

	  // Find `this` / `num`
	  BN.prototype.div = function div (num) {
	    return this.divmod(num, 'div', false).div;
	  };

	  // Find `this` % `num`
	  BN.prototype.mod = function mod (num) {
	    return this.divmod(num, 'mod', false).mod;
	  };

	  BN.prototype.umod = function umod (num) {
	    return this.divmod(num, 'mod', true).mod;
	  };

	  // Find Round(`this` / `num`)
	  BN.prototype.divRound = function divRound (num) {
	    var dm = this.divmod(num);

	    // Fast case - exact division
	    if (dm.mod.isZero()) return dm.div;

	    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

	    var half = num.ushrn(1);
	    var r2 = num.andln(1);
	    var cmp = mod.cmp(half);

	    // Round down
	    if (cmp < 0 || (r2 === 1 && cmp === 0)) return dm.div;

	    // Round up
	    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
	  };

	  BN.prototype.modrn = function modrn (num) {
	    var isNegNum = num < 0;
	    if (isNegNum) num = -num;

	    assert(num <= 0x3ffffff);
	    var p = (1 << 26) % num;

	    var acc = 0;
	    for (var i = this.length - 1; i >= 0; i--) {
	      acc = (p * acc + (this.words[i] | 0)) % num;
	    }

	    return isNegNum ? -acc : acc;
	  };

	  // WARNING: DEPRECATED
	  BN.prototype.modn = function modn (num) {
	    return this.modrn(num);
	  };

	  // In-place division by number
	  BN.prototype.idivn = function idivn (num) {
	    var isNegNum = num < 0;
	    if (isNegNum) num = -num;

	    assert(num <= 0x3ffffff);

	    var carry = 0;
	    for (var i = this.length - 1; i >= 0; i--) {
	      var w = (this.words[i] | 0) + carry * 0x4000000;
	      this.words[i] = (w / num) | 0;
	      carry = w % num;
	    }

	    this._strip();
	    return isNegNum ? this.ineg() : this;
	  };

	  BN.prototype.divn = function divn (num) {
	    return this.clone().idivn(num);
	  };

	  BN.prototype.egcd = function egcd (p) {
	    assert(p.negative === 0);
	    assert(!p.isZero());

	    var x = this;
	    var y = p.clone();

	    if (x.negative !== 0) {
	      x = x.umod(p);
	    } else {
	      x = x.clone();
	    }

	    // A * x + B * y = x
	    var A = new BN(1);
	    var B = new BN(0);

	    // C * x + D * y = y
	    var C = new BN(0);
	    var D = new BN(1);

	    var g = 0;

	    while (x.isEven() && y.isEven()) {
	      x.iushrn(1);
	      y.iushrn(1);
	      ++g;
	    }

	    var yp = y.clone();
	    var xp = x.clone();

	    while (!x.isZero()) {
	      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
	      if (i > 0) {
	        x.iushrn(i);
	        while (i-- > 0) {
	          if (A.isOdd() || B.isOdd()) {
	            A.iadd(yp);
	            B.isub(xp);
	          }

	          A.iushrn(1);
	          B.iushrn(1);
	        }
	      }

	      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
	      if (j > 0) {
	        y.iushrn(j);
	        while (j-- > 0) {
	          if (C.isOdd() || D.isOdd()) {
	            C.iadd(yp);
	            D.isub(xp);
	          }

	          C.iushrn(1);
	          D.iushrn(1);
	        }
	      }

	      if (x.cmp(y) >= 0) {
	        x.isub(y);
	        A.isub(C);
	        B.isub(D);
	      } else {
	        y.isub(x);
	        C.isub(A);
	        D.isub(B);
	      }
	    }

	    return {
	      a: C,
	      b: D,
	      gcd: y.iushln(g)
	    };
	  };

	  // This is reduced incarnation of the binary EEA
	  // above, designated to invert members of the
	  // _prime_ fields F(p) at a maximal speed
	  BN.prototype._invmp = function _invmp (p) {
	    assert(p.negative === 0);
	    assert(!p.isZero());

	    var a = this;
	    var b = p.clone();

	    if (a.negative !== 0) {
	      a = a.umod(p);
	    } else {
	      a = a.clone();
	    }

	    var x1 = new BN(1);
	    var x2 = new BN(0);

	    var delta = b.clone();

	    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
	      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
	      if (i > 0) {
	        a.iushrn(i);
	        while (i-- > 0) {
	          if (x1.isOdd()) {
	            x1.iadd(delta);
	          }

	          x1.iushrn(1);
	        }
	      }

	      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
	      if (j > 0) {
	        b.iushrn(j);
	        while (j-- > 0) {
	          if (x2.isOdd()) {
	            x2.iadd(delta);
	          }

	          x2.iushrn(1);
	        }
	      }

	      if (a.cmp(b) >= 0) {
	        a.isub(b);
	        x1.isub(x2);
	      } else {
	        b.isub(a);
	        x2.isub(x1);
	      }
	    }

	    var res;
	    if (a.cmpn(1) === 0) {
	      res = x1;
	    } else {
	      res = x2;
	    }

	    if (res.cmpn(0) < 0) {
	      res.iadd(p);
	    }

	    return res;
	  };

	  BN.prototype.gcd = function gcd (num) {
	    if (this.isZero()) return num.abs();
	    if (num.isZero()) return this.abs();

	    var a = this.clone();
	    var b = num.clone();
	    a.negative = 0;
	    b.negative = 0;

	    // Remove common factor of two
	    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
	      a.iushrn(1);
	      b.iushrn(1);
	    }

	    do {
	      while (a.isEven()) {
	        a.iushrn(1);
	      }
	      while (b.isEven()) {
	        b.iushrn(1);
	      }

	      var r = a.cmp(b);
	      if (r < 0) {
	        // Swap `a` and `b` to make `a` always bigger than `b`
	        var t = a;
	        a = b;
	        b = t;
	      } else if (r === 0 || b.cmpn(1) === 0) {
	        break;
	      }

	      a.isub(b);
	    } while (true);

	    return b.iushln(shift);
	  };

	  // Invert number in the field F(num)
	  BN.prototype.invm = function invm (num) {
	    return this.egcd(num).a.umod(num);
	  };

	  BN.prototype.isEven = function isEven () {
	    return (this.words[0] & 1) === 0;
	  };

	  BN.prototype.isOdd = function isOdd () {
	    return (this.words[0] & 1) === 1;
	  };

	  // And first word and num
	  BN.prototype.andln = function andln (num) {
	    return this.words[0] & num;
	  };

	  // Increment at the bit position in-line
	  BN.prototype.bincn = function bincn (bit) {
	    assert(typeof bit === 'number');
	    var r = bit % 26;
	    var s = (bit - r) / 26;
	    var q = 1 << r;

	    // Fast case: bit is much higher than all existing words
	    if (this.length <= s) {
	      this._expand(s + 1);
	      this.words[s] |= q;
	      return this;
	    }

	    // Add bit and propagate, if needed
	    var carry = q;
	    for (var i = s; carry !== 0 && i < this.length; i++) {
	      var w = this.words[i] | 0;
	      w += carry;
	      carry = w >>> 26;
	      w &= 0x3ffffff;
	      this.words[i] = w;
	    }
	    if (carry !== 0) {
	      this.words[i] = carry;
	      this.length++;
	    }
	    return this;
	  };

	  BN.prototype.isZero = function isZero () {
	    return this.length === 1 && this.words[0] === 0;
	  };

	  BN.prototype.cmpn = function cmpn (num) {
	    var negative = num < 0;

	    if (this.negative !== 0 && !negative) return -1;
	    if (this.negative === 0 && negative) return 1;

	    this._strip();

	    var res;
	    if (this.length > 1) {
	      res = 1;
	    } else {
	      if (negative) {
	        num = -num;
	      }

	      assert(num <= 0x3ffffff, 'Number is too big');

	      var w = this.words[0] | 0;
	      res = w === num ? 0 : w < num ? -1 : 1;
	    }
	    if (this.negative !== 0) return -res | 0;
	    return res;
	  };

	  // Compare two numbers and return:
	  // 1 - if `this` > `num`
	  // 0 - if `this` == `num`
	  // -1 - if `this` < `num`
	  BN.prototype.cmp = function cmp (num) {
	    if (this.negative !== 0 && num.negative === 0) return -1;
	    if (this.negative === 0 && num.negative !== 0) return 1;

	    var res = this.ucmp(num);
	    if (this.negative !== 0) return -res | 0;
	    return res;
	  };

	  // Unsigned comparison
	  BN.prototype.ucmp = function ucmp (num) {
	    // At this point both numbers have the same sign
	    if (this.length > num.length) return 1;
	    if (this.length < num.length) return -1;

	    var res = 0;
	    for (var i = this.length - 1; i >= 0; i--) {
	      var a = this.words[i] | 0;
	      var b = num.words[i] | 0;

	      if (a === b) continue;
	      if (a < b) {
	        res = -1;
	      } else if (a > b) {
	        res = 1;
	      }
	      break;
	    }
	    return res;
	  };

	  BN.prototype.gtn = function gtn (num) {
	    return this.cmpn(num) === 1;
	  };

	  BN.prototype.gt = function gt (num) {
	    return this.cmp(num) === 1;
	  };

	  BN.prototype.gten = function gten (num) {
	    return this.cmpn(num) >= 0;
	  };

	  BN.prototype.gte = function gte (num) {
	    return this.cmp(num) >= 0;
	  };

	  BN.prototype.ltn = function ltn (num) {
	    return this.cmpn(num) === -1;
	  };

	  BN.prototype.lt = function lt (num) {
	    return this.cmp(num) === -1;
	  };

	  BN.prototype.lten = function lten (num) {
	    return this.cmpn(num) <= 0;
	  };

	  BN.prototype.lte = function lte (num) {
	    return this.cmp(num) <= 0;
	  };

	  BN.prototype.eqn = function eqn (num) {
	    return this.cmpn(num) === 0;
	  };

	  BN.prototype.eq = function eq (num) {
	    return this.cmp(num) === 0;
	  };

	  //
	  // A reduce context, could be using montgomery or something better, depending
	  // on the `m` itself.
	  //
	  BN.red = function red (num) {
	    return new Red(num);
	  };

	  BN.prototype.toRed = function toRed (ctx) {
	    assert(!this.red, 'Already a number in reduction context');
	    assert(this.negative === 0, 'red works only with positives');
	    return ctx.convertTo(this)._forceRed(ctx);
	  };

	  BN.prototype.fromRed = function fromRed () {
	    assert(this.red, 'fromRed works only with numbers in reduction context');
	    return this.red.convertFrom(this);
	  };

	  BN.prototype._forceRed = function _forceRed (ctx) {
	    this.red = ctx;
	    return this;
	  };

	  BN.prototype.forceRed = function forceRed (ctx) {
	    assert(!this.red, 'Already a number in reduction context');
	    return this._forceRed(ctx);
	  };

	  BN.prototype.redAdd = function redAdd (num) {
	    assert(this.red, 'redAdd works only with red numbers');
	    return this.red.add(this, num);
	  };

	  BN.prototype.redIAdd = function redIAdd (num) {
	    assert(this.red, 'redIAdd works only with red numbers');
	    return this.red.iadd(this, num);
	  };

	  BN.prototype.redSub = function redSub (num) {
	    assert(this.red, 'redSub works only with red numbers');
	    return this.red.sub(this, num);
	  };

	  BN.prototype.redISub = function redISub (num) {
	    assert(this.red, 'redISub works only with red numbers');
	    return this.red.isub(this, num);
	  };

	  BN.prototype.redShl = function redShl (num) {
	    assert(this.red, 'redShl works only with red numbers');
	    return this.red.shl(this, num);
	  };

	  BN.prototype.redMul = function redMul (num) {
	    assert(this.red, 'redMul works only with red numbers');
	    this.red._verify2(this, num);
	    return this.red.mul(this, num);
	  };

	  BN.prototype.redIMul = function redIMul (num) {
	    assert(this.red, 'redMul works only with red numbers');
	    this.red._verify2(this, num);
	    return this.red.imul(this, num);
	  };

	  BN.prototype.redSqr = function redSqr () {
	    assert(this.red, 'redSqr works only with red numbers');
	    this.red._verify1(this);
	    return this.red.sqr(this);
	  };

	  BN.prototype.redISqr = function redISqr () {
	    assert(this.red, 'redISqr works only with red numbers');
	    this.red._verify1(this);
	    return this.red.isqr(this);
	  };

	  // Square root over p
	  BN.prototype.redSqrt = function redSqrt () {
	    assert(this.red, 'redSqrt works only with red numbers');
	    this.red._verify1(this);
	    return this.red.sqrt(this);
	  };

	  BN.prototype.redInvm = function redInvm () {
	    assert(this.red, 'redInvm works only with red numbers');
	    this.red._verify1(this);
	    return this.red.invm(this);
	  };

	  // Return negative clone of `this` % `red modulo`
	  BN.prototype.redNeg = function redNeg () {
	    assert(this.red, 'redNeg works only with red numbers');
	    this.red._verify1(this);
	    return this.red.neg(this);
	  };

	  BN.prototype.redPow = function redPow (num) {
	    assert(this.red && !num.red, 'redPow(normalNum)');
	    this.red._verify1(this);
	    return this.red.pow(this, num);
	  };

	  // Prime numbers with efficient reduction
	  var primes = {
	    k256: null,
	    p224: null,
	    p192: null,
	    p25519: null
	  };

	  // Pseudo-Mersenne prime
	  function MPrime (name, p) {
	    // P = 2 ^ N - K
	    this.name = name;
	    this.p = new BN(p, 16);
	    this.n = this.p.bitLength();
	    this.k = new BN(1).iushln(this.n).isub(this.p);

	    this.tmp = this._tmp();
	  }

	  MPrime.prototype._tmp = function _tmp () {
	    var tmp = new BN(null);
	    tmp.words = new Array(Math.ceil(this.n / 13));
	    return tmp;
	  };

	  MPrime.prototype.ireduce = function ireduce (num) {
	    // Assumes that `num` is less than `P^2`
	    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
	    var r = num;
	    var rlen;

	    do {
	      this.split(r, this.tmp);
	      r = this.imulK(r);
	      r = r.iadd(this.tmp);
	      rlen = r.bitLength();
	    } while (rlen > this.n);

	    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
	    if (cmp === 0) {
	      r.words[0] = 0;
	      r.length = 1;
	    } else if (cmp > 0) {
	      r.isub(this.p);
	    } else {
	      if (r.strip !== undefined) {
	        // r is a BN v4 instance
	        r.strip();
	      } else {
	        // r is a BN v5 instance
	        r._strip();
	      }
	    }

	    return r;
	  };

	  MPrime.prototype.split = function split (input, out) {
	    input.iushrn(this.n, 0, out);
	  };

	  MPrime.prototype.imulK = function imulK (num) {
	    return num.imul(this.k);
	  };

	  function K256 () {
	    MPrime.call(
	      this,
	      'k256',
	      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
	  }
	  inherits(K256, MPrime);

	  K256.prototype.split = function split (input, output) {
	    // 256 = 9 * 26 + 22
	    var mask = 0x3fffff;

	    var outLen = Math.min(input.length, 9);
	    for (var i = 0; i < outLen; i++) {
	      output.words[i] = input.words[i];
	    }
	    output.length = outLen;

	    if (input.length <= 9) {
	      input.words[0] = 0;
	      input.length = 1;
	      return;
	    }

	    // Shift by 9 limbs
	    var prev = input.words[9];
	    output.words[output.length++] = prev & mask;

	    for (i = 10; i < input.length; i++) {
	      var next = input.words[i] | 0;
	      input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
	      prev = next;
	    }
	    prev >>>= 22;
	    input.words[i - 10] = prev;
	    if (prev === 0 && input.length > 10) {
	      input.length -= 10;
	    } else {
	      input.length -= 9;
	    }
	  };

	  K256.prototype.imulK = function imulK (num) {
	    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
	    num.words[num.length] = 0;
	    num.words[num.length + 1] = 0;
	    num.length += 2;

	    // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
	    var lo = 0;
	    for (var i = 0; i < num.length; i++) {
	      var w = num.words[i] | 0;
	      lo += w * 0x3d1;
	      num.words[i] = lo & 0x3ffffff;
	      lo = w * 0x40 + ((lo / 0x4000000) | 0);
	    }

	    // Fast length reduction
	    if (num.words[num.length - 1] === 0) {
	      num.length--;
	      if (num.words[num.length - 1] === 0) {
	        num.length--;
	      }
	    }
	    return num;
	  };

	  function P224 () {
	    MPrime.call(
	      this,
	      'p224',
	      'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
	  }
	  inherits(P224, MPrime);

	  function P192 () {
	    MPrime.call(
	      this,
	      'p192',
	      'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
	  }
	  inherits(P192, MPrime);

	  function P25519 () {
	    // 2 ^ 255 - 19
	    MPrime.call(
	      this,
	      '25519',
	      '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
	  }
	  inherits(P25519, MPrime);

	  P25519.prototype.imulK = function imulK (num) {
	    // K = 0x13
	    var carry = 0;
	    for (var i = 0; i < num.length; i++) {
	      var hi = (num.words[i] | 0) * 0x13 + carry;
	      var lo = hi & 0x3ffffff;
	      hi >>>= 26;

	      num.words[i] = lo;
	      carry = hi;
	    }
	    if (carry !== 0) {
	      num.words[num.length++] = carry;
	    }
	    return num;
	  };

	  // Exported mostly for testing purposes, use plain name instead
	  BN._prime = function prime (name) {
	    // Cached version of prime
	    if (primes[name]) return primes[name];

	    var prime;
	    if (name === 'k256') {
	      prime = new K256();
	    } else if (name === 'p224') {
	      prime = new P224();
	    } else if (name === 'p192') {
	      prime = new P192();
	    } else if (name === 'p25519') {
	      prime = new P25519();
	    } else {
	      throw new Error('Unknown prime ' + name);
	    }
	    primes[name] = prime;

	    return prime;
	  };

	  //
	  // Base reduction engine
	  //
	  function Red (m) {
	    if (typeof m === 'string') {
	      var prime = BN._prime(m);
	      this.m = prime.p;
	      this.prime = prime;
	    } else {
	      assert(m.gtn(1), 'modulus must be greater than 1');
	      this.m = m;
	      this.prime = null;
	    }
	  }

	  Red.prototype._verify1 = function _verify1 (a) {
	    assert(a.negative === 0, 'red works only with positives');
	    assert(a.red, 'red works only with red numbers');
	  };

	  Red.prototype._verify2 = function _verify2 (a, b) {
	    assert((a.negative | b.negative) === 0, 'red works only with positives');
	    assert(a.red && a.red === b.red,
	      'red works only with red numbers');
	  };

	  Red.prototype.imod = function imod (a) {
	    if (this.prime) return this.prime.ireduce(a)._forceRed(this);

	    move(a, a.umod(this.m)._forceRed(this));
	    return a;
	  };

	  Red.prototype.neg = function neg (a) {
	    if (a.isZero()) {
	      return a.clone();
	    }

	    return this.m.sub(a)._forceRed(this);
	  };

	  Red.prototype.add = function add (a, b) {
	    this._verify2(a, b);

	    var res = a.add(b);
	    if (res.cmp(this.m) >= 0) {
	      res.isub(this.m);
	    }
	    return res._forceRed(this);
	  };

	  Red.prototype.iadd = function iadd (a, b) {
	    this._verify2(a, b);

	    var res = a.iadd(b);
	    if (res.cmp(this.m) >= 0) {
	      res.isub(this.m);
	    }
	    return res;
	  };

	  Red.prototype.sub = function sub (a, b) {
	    this._verify2(a, b);

	    var res = a.sub(b);
	    if (res.cmpn(0) < 0) {
	      res.iadd(this.m);
	    }
	    return res._forceRed(this);
	  };

	  Red.prototype.isub = function isub (a, b) {
	    this._verify2(a, b);

	    var res = a.isub(b);
	    if (res.cmpn(0) < 0) {
	      res.iadd(this.m);
	    }
	    return res;
	  };

	  Red.prototype.shl = function shl (a, num) {
	    this._verify1(a);
	    return this.imod(a.ushln(num));
	  };

	  Red.prototype.imul = function imul (a, b) {
	    this._verify2(a, b);
	    return this.imod(a.imul(b));
	  };

	  Red.prototype.mul = function mul (a, b) {
	    this._verify2(a, b);
	    return this.imod(a.mul(b));
	  };

	  Red.prototype.isqr = function isqr (a) {
	    return this.imul(a, a.clone());
	  };

	  Red.prototype.sqr = function sqr (a) {
	    return this.mul(a, a);
	  };

	  Red.prototype.sqrt = function sqrt (a) {
	    if (a.isZero()) return a.clone();

	    var mod3 = this.m.andln(3);
	    assert(mod3 % 2 === 1);

	    // Fast case
	    if (mod3 === 3) {
	      var pow = this.m.add(new BN(1)).iushrn(2);
	      return this.pow(a, pow);
	    }

	    // Tonelli-Shanks algorithm (Totally unoptimized and slow)
	    //
	    // Find Q and S, that Q * 2 ^ S = (P - 1)
	    var q = this.m.subn(1);
	    var s = 0;
	    while (!q.isZero() && q.andln(1) === 0) {
	      s++;
	      q.iushrn(1);
	    }
	    assert(!q.isZero());

	    var one = new BN(1).toRed(this);
	    var nOne = one.redNeg();

	    // Find quadratic non-residue
	    // NOTE: Max is such because of generalized Riemann hypothesis.
	    var lpow = this.m.subn(1).iushrn(1);
	    var z = this.m.bitLength();
	    z = new BN(2 * z * z).toRed(this);

	    while (this.pow(z, lpow).cmp(nOne) !== 0) {
	      z.redIAdd(nOne);
	    }

	    var c = this.pow(z, q);
	    var r = this.pow(a, q.addn(1).iushrn(1));
	    var t = this.pow(a, q);
	    var m = s;
	    while (t.cmp(one) !== 0) {
	      var tmp = t;
	      for (var i = 0; tmp.cmp(one) !== 0; i++) {
	        tmp = tmp.redSqr();
	      }
	      assert(i < m);
	      var b = this.pow(c, new BN(1).iushln(m - i - 1));

	      r = r.redMul(b);
	      c = b.redSqr();
	      t = t.redMul(c);
	      m = i;
	    }

	    return r;
	  };

	  Red.prototype.invm = function invm (a) {
	    var inv = a._invmp(this.m);
	    if (inv.negative !== 0) {
	      inv.negative = 0;
	      return this.imod(inv).redNeg();
	    } else {
	      return this.imod(inv);
	    }
	  };

	  Red.prototype.pow = function pow (a, num) {
	    if (num.isZero()) return new BN(1).toRed(this);
	    if (num.cmpn(1) === 0) return a.clone();

	    var windowSize = 4;
	    var wnd = new Array(1 << windowSize);
	    wnd[0] = new BN(1).toRed(this);
	    wnd[1] = a;
	    for (var i = 2; i < wnd.length; i++) {
	      wnd[i] = this.mul(wnd[i - 1], a);
	    }

	    var res = wnd[0];
	    var current = 0;
	    var currentLen = 0;
	    var start = num.bitLength() % 26;
	    if (start === 0) {
	      start = 26;
	    }

	    for (i = num.length - 1; i >= 0; i--) {
	      var word = num.words[i];
	      for (var j = start - 1; j >= 0; j--) {
	        var bit = (word >> j) & 1;
	        if (res !== wnd[0]) {
	          res = this.sqr(res);
	        }

	        if (bit === 0 && current === 0) {
	          currentLen = 0;
	          continue;
	        }

	        current <<= 1;
	        current |= bit;
	        currentLen++;
	        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

	        res = this.mul(res, wnd[current]);
	        currentLen = 0;
	        current = 0;
	      }
	      start = 26;
	    }

	    return res;
	  };

	  Red.prototype.convertTo = function convertTo (num) {
	    var r = num.umod(this.m);

	    return r === num ? r.clone() : r;
	  };

	  Red.prototype.convertFrom = function convertFrom (num) {
	    var res = num.clone();
	    res.red = null;
	    return res;
	  };

	  //
	  // Montgomery method engine
	  //

	  BN.mont = function mont (num) {
	    return new Mont(num);
	  };

	  function Mont (m) {
	    Red.call(this, m);

	    this.shift = this.m.bitLength();
	    if (this.shift % 26 !== 0) {
	      this.shift += 26 - (this.shift % 26);
	    }

	    this.r = new BN(1).iushln(this.shift);
	    this.r2 = this.imod(this.r.sqr());
	    this.rinv = this.r._invmp(this.m);

	    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
	    this.minv = this.minv.umod(this.r);
	    this.minv = this.r.sub(this.minv);
	  }
	  inherits(Mont, Red);

	  Mont.prototype.convertTo = function convertTo (num) {
	    return this.imod(num.ushln(this.shift));
	  };

	  Mont.prototype.convertFrom = function convertFrom (num) {
	    var r = this.imod(num.mul(this.rinv));
	    r.red = null;
	    return r;
	  };

	  Mont.prototype.imul = function imul (a, b) {
	    if (a.isZero() || b.isZero()) {
	      a.words[0] = 0;
	      a.length = 1;
	      return a;
	    }

	    var t = a.imul(b);
	    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	    var u = t.isub(c).iushrn(this.shift);
	    var res = u;

	    if (u.cmp(this.m) >= 0) {
	      res = u.isub(this.m);
	    } else if (u.cmpn(0) < 0) {
	      res = u.iadd(this.m);
	    }

	    return res._forceRed(this);
	  };

	  Mont.prototype.mul = function mul (a, b) {
	    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

	    var t = a.mul(b);
	    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	    var u = t.isub(c).iushrn(this.shift);
	    var res = u;
	    if (u.cmp(this.m) >= 0) {
	      res = u.isub(this.m);
	    } else if (u.cmpn(0) < 0) {
	      res = u.iadd(this.m);
	    }

	    return res._forceRed(this);
	  };

	  Mont.prototype.invm = function invm (a) {
	    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
	    var res = this.imod(a._invmp(this.m).mul(this.r2));
	    return res._forceRed(this);
	  };
	})(module, commonjsGlobal);
} (bn));

var _BN = bn.exports;

const version$5 = "bignumber/5.6.2";

var BN = _BN.BN;
const logger$6 = new Logger(version$5);
const _constructorGuard$1 = {};
const MAX_SAFE = 0x1fffffffffffff;
function isBigNumberish(value) {
    return (value != null) && (BigNumber.isBigNumber(value) ||
        (typeof (value) === "number" && (value % 1) === 0) ||
        (typeof (value) === "string" && !!value.match(/^-?[0-9]+$/)) ||
        isHexString(value) ||
        (typeof (value) === "bigint") ||
        isBytes(value));
}
// Only warn about passing 10 into radix once
let _warnedToStringRadix = false;
class BigNumber {
    constructor(constructorGuard, hex) {
        if (constructorGuard !== _constructorGuard$1) {
            logger$6.throwError("cannot call constructor directly; use BigNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "new (BigNumber)"
            });
        }
        this._hex = hex;
        this._isBigNumber = true;
        Object.freeze(this);
    }
    fromTwos(value) {
        return toBigNumber(toBN(this).fromTwos(value));
    }
    toTwos(value) {
        return toBigNumber(toBN(this).toTwos(value));
    }
    abs() {
        if (this._hex[0] === "-") {
            return BigNumber.from(this._hex.substring(1));
        }
        return this;
    }
    add(other) {
        return toBigNumber(toBN(this).add(toBN(other)));
    }
    sub(other) {
        return toBigNumber(toBN(this).sub(toBN(other)));
    }
    div(other) {
        const o = BigNumber.from(other);
        if (o.isZero()) {
            throwFault$1("division-by-zero", "div");
        }
        return toBigNumber(toBN(this).div(toBN(other)));
    }
    mul(other) {
        return toBigNumber(toBN(this).mul(toBN(other)));
    }
    mod(other) {
        const value = toBN(other);
        if (value.isNeg()) {
            throwFault$1("division-by-zero", "mod");
        }
        return toBigNumber(toBN(this).umod(value));
    }
    pow(other) {
        const value = toBN(other);
        if (value.isNeg()) {
            throwFault$1("negative-power", "pow");
        }
        return toBigNumber(toBN(this).pow(value));
    }
    and(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault$1("unbound-bitwise-result", "and");
        }
        return toBigNumber(toBN(this).and(value));
    }
    or(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault$1("unbound-bitwise-result", "or");
        }
        return toBigNumber(toBN(this).or(value));
    }
    xor(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault$1("unbound-bitwise-result", "xor");
        }
        return toBigNumber(toBN(this).xor(value));
    }
    mask(value) {
        if (this.isNegative() || value < 0) {
            throwFault$1("negative-width", "mask");
        }
        return toBigNumber(toBN(this).maskn(value));
    }
    shl(value) {
        if (this.isNegative() || value < 0) {
            throwFault$1("negative-width", "shl");
        }
        return toBigNumber(toBN(this).shln(value));
    }
    shr(value) {
        if (this.isNegative() || value < 0) {
            throwFault$1("negative-width", "shr");
        }
        return toBigNumber(toBN(this).shrn(value));
    }
    eq(other) {
        return toBN(this).eq(toBN(other));
    }
    lt(other) {
        return toBN(this).lt(toBN(other));
    }
    lte(other) {
        return toBN(this).lte(toBN(other));
    }
    gt(other) {
        return toBN(this).gt(toBN(other));
    }
    gte(other) {
        return toBN(this).gte(toBN(other));
    }
    isNegative() {
        return (this._hex[0] === "-");
    }
    isZero() {
        return toBN(this).isZero();
    }
    toNumber() {
        try {
            return toBN(this).toNumber();
        }
        catch (error) {
            throwFault$1("overflow", "toNumber", this.toString());
        }
        return null;
    }
    toBigInt() {
        try {
            return BigInt(this.toString());
        }
        catch (e) { }
        return logger$6.throwError("this platform does not support BigInt", Logger.errors.UNSUPPORTED_OPERATION, {
            value: this.toString()
        });
    }
    toString() {
        // Lots of people expect this, which we do not support, so check (See: #889)
        if (arguments.length > 0) {
            if (arguments[0] === 10) {
                if (!_warnedToStringRadix) {
                    _warnedToStringRadix = true;
                    logger$6.warn("BigNumber.toString does not accept any parameters; base-10 is assumed");
                }
            }
            else if (arguments[0] === 16) {
                logger$6.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", Logger.errors.UNEXPECTED_ARGUMENT, {});
            }
            else {
                logger$6.throwError("BigNumber.toString does not accept parameters", Logger.errors.UNEXPECTED_ARGUMENT, {});
            }
        }
        return toBN(this).toString(10);
    }
    toHexString() {
        return this._hex;
    }
    toJSON(key) {
        return { type: "BigNumber", hex: this.toHexString() };
    }
    static from(value) {
        if (value instanceof BigNumber) {
            return value;
        }
        if (typeof (value) === "string") {
            if (value.match(/^-?0x[0-9a-f]+$/i)) {
                return new BigNumber(_constructorGuard$1, toHex$2(value));
            }
            if (value.match(/^-?[0-9]+$/)) {
                return new BigNumber(_constructorGuard$1, toHex$2(new BN(value)));
            }
            return logger$6.throwArgumentError("invalid BigNumber string", "value", value);
        }
        if (typeof (value) === "number") {
            if (value % 1) {
                throwFault$1("underflow", "BigNumber.from", value);
            }
            if (value >= MAX_SAFE || value <= -MAX_SAFE) {
                throwFault$1("overflow", "BigNumber.from", value);
            }
            return BigNumber.from(String(value));
        }
        const anyValue = value;
        if (typeof (anyValue) === "bigint") {
            return BigNumber.from(anyValue.toString());
        }
        if (isBytes(anyValue)) {
            return BigNumber.from(hexlify(anyValue));
        }
        if (anyValue) {
            // Hexable interface (takes priority)
            if (anyValue.toHexString) {
                const hex = anyValue.toHexString();
                if (typeof (hex) === "string") {
                    return BigNumber.from(hex);
                }
            }
            else {
                // For now, handle legacy JSON-ified values (goes away in v6)
                let hex = anyValue._hex;
                // New-form JSON
                if (hex == null && anyValue.type === "BigNumber") {
                    hex = anyValue.hex;
                }
                if (typeof (hex) === "string") {
                    if (isHexString(hex) || (hex[0] === "-" && isHexString(hex.substring(1)))) {
                        return BigNumber.from(hex);
                    }
                }
            }
        }
        return logger$6.throwArgumentError("invalid BigNumber value", "value", value);
    }
    static isBigNumber(value) {
        return !!(value && value._isBigNumber);
    }
}
// Normalize the hex string
function toHex$2(value) {
    // For BN, call on the hex string
    if (typeof (value) !== "string") {
        return toHex$2(value.toString(16));
    }
    // If negative, prepend the negative sign to the normalized positive value
    if (value[0] === "-") {
        // Strip off the negative sign
        value = value.substring(1);
        // Cannot have multiple negative signs (e.g. "--0x04")
        if (value[0] === "-") {
            logger$6.throwArgumentError("invalid hex", "value", value);
        }
        // Call toHex on the positive component
        value = toHex$2(value);
        // Do not allow "-0x00"
        if (value === "0x00") {
            return value;
        }
        // Negate the value
        return "-" + value;
    }
    // Add a "0x" prefix if missing
    if (value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    // Normalize zero
    if (value === "0x") {
        return "0x00";
    }
    // Make the string even length
    if (value.length % 2) {
        value = "0x0" + value.substring(2);
    }
    // Trim to smallest even-length string
    while (value.length > 4 && value.substring(0, 4) === "0x00") {
        value = "0x" + value.substring(4);
    }
    return value;
}
function toBigNumber(value) {
    return BigNumber.from(toHex$2(value));
}
function toBN(value) {
    const hex = BigNumber.from(value).toHexString();
    if (hex[0] === "-") {
        return (new BN("-" + hex.substring(3), 16));
    }
    return new BN(hex.substring(2), 16);
}
function throwFault$1(fault, operation, value) {
    const params = { fault: fault, operation: operation };
    if (value != null) {
        params.value = value;
    }
    return logger$6.throwError(fault, Logger.errors.NUMERIC_FAULT, params);
}
// value should have no prefix
function _base36To16(value) {
    return (new BN(value, 36)).toString(16);
}
// value should have no prefix
function _base16To36(value) {
    return (new BN(value, 16)).toString(36);
}

const logger$5 = new Logger(version$5);
const _constructorGuard = {};
const Zero = BigNumber.from(0);
const NegativeOne = BigNumber.from(-1);
function throwFault(message, fault, operation, value) {
    const params = { fault: fault, operation: operation };
    if (value !== undefined) {
        params.value = value;
    }
    return logger$5.throwError(message, Logger.errors.NUMERIC_FAULT, params);
}
// Constant to pull zeros from for multipliers
let zeros = "0";
while (zeros.length < 256) {
    zeros += zeros;
}
// Returns a string "1" followed by decimal "0"s
function getMultiplier(decimals) {
    if (typeof (decimals) !== "number") {
        try {
            decimals = BigNumber.from(decimals).toNumber();
        }
        catch (e) { }
    }
    if (typeof (decimals) === "number" && decimals >= 0 && decimals <= 256 && !(decimals % 1)) {
        return ("1" + zeros.substring(0, decimals));
    }
    return logger$5.throwArgumentError("invalid decimal size", "decimals", decimals);
}
function formatFixed(value, decimals) {
    if (decimals == null) {
        decimals = 0;
    }
    const multiplier = getMultiplier(decimals);
    // Make sure wei is a big number (convert as necessary)
    value = BigNumber.from(value);
    const negative = value.lt(Zero);
    if (negative) {
        value = value.mul(NegativeOne);
    }
    let fraction = value.mod(multiplier).toString();
    while (fraction.length < multiplier.length - 1) {
        fraction = "0" + fraction;
    }
    // Strip training 0
    fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    const whole = value.div(multiplier).toString();
    if (multiplier.length === 1) {
        value = whole;
    }
    else {
        value = whole + "." + fraction;
    }
    if (negative) {
        value = "-" + value;
    }
    return value;
}
function parseFixed(value, decimals) {
    if (decimals == null) {
        decimals = 0;
    }
    const multiplier = getMultiplier(decimals);
    if (typeof (value) !== "string" || !value.match(/^-?[0-9.]+$/)) {
        logger$5.throwArgumentError("invalid decimal value", "value", value);
    }
    // Is it negative?
    const negative = (value.substring(0, 1) === "-");
    if (negative) {
        value = value.substring(1);
    }
    if (value === ".") {
        logger$5.throwArgumentError("missing value", "value", value);
    }
    // Split it into a whole and fractional part
    const comps = value.split(".");
    if (comps.length > 2) {
        logger$5.throwArgumentError("too many decimal points", "value", value);
    }
    let whole = comps[0], fraction = comps[1];
    if (!whole) {
        whole = "0";
    }
    if (!fraction) {
        fraction = "0";
    }
    // Trim trailing zeros
    while (fraction[fraction.length - 1] === "0") {
        fraction = fraction.substring(0, fraction.length - 1);
    }
    // Check the fraction doesn't exceed our decimals size
    if (fraction.length > multiplier.length - 1) {
        throwFault("fractional component exceeds decimals", "underflow", "parseFixed");
    }
    // If decimals is 0, we have an empty string for fraction
    if (fraction === "") {
        fraction = "0";
    }
    // Fully pad the string with zeros to get to wei
    while (fraction.length < multiplier.length - 1) {
        fraction += "0";
    }
    const wholeValue = BigNumber.from(whole);
    const fractionValue = BigNumber.from(fraction);
    let wei = (wholeValue.mul(multiplier)).add(fractionValue);
    if (negative) {
        wei = wei.mul(NegativeOne);
    }
    return wei;
}
class FixedFormat {
    constructor(constructorGuard, signed, width, decimals) {
        if (constructorGuard !== _constructorGuard) {
            logger$5.throwError("cannot use FixedFormat constructor; use FixedFormat.from", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "new FixedFormat"
            });
        }
        this.signed = signed;
        this.width = width;
        this.decimals = decimals;
        this.name = (signed ? "" : "u") + "fixed" + String(width) + "x" + String(decimals);
        this._multiplier = getMultiplier(decimals);
        Object.freeze(this);
    }
    static from(value) {
        if (value instanceof FixedFormat) {
            return value;
        }
        if (typeof (value) === "number") {
            value = `fixed128x${value}`;
        }
        let signed = true;
        let width = 128;
        let decimals = 18;
        if (typeof (value) === "string") {
            if (value === "fixed") ;
            else if (value === "ufixed") {
                signed = false;
            }
            else {
                const match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
                if (!match) {
                    logger$5.throwArgumentError("invalid fixed format", "format", value);
                }
                signed = (match[1] !== "u");
                width = parseInt(match[2]);
                decimals = parseInt(match[3]);
            }
        }
        else if (value) {
            const check = (key, type, defaultValue) => {
                if (value[key] == null) {
                    return defaultValue;
                }
                if (typeof (value[key]) !== type) {
                    logger$5.throwArgumentError("invalid fixed format (" + key + " not " + type + ")", "format." + key, value[key]);
                }
                return value[key];
            };
            signed = check("signed", "boolean", signed);
            width = check("width", "number", width);
            decimals = check("decimals", "number", decimals);
        }
        if (width % 8) {
            logger$5.throwArgumentError("invalid fixed format width (not byte aligned)", "format.width", width);
        }
        if (decimals > 80) {
            logger$5.throwArgumentError("invalid fixed format (decimals too large)", "format.decimals", decimals);
        }
        return new FixedFormat(_constructorGuard, signed, width, decimals);
    }
}
class FixedNumber {
    constructor(constructorGuard, hex, value, format) {
        if (constructorGuard !== _constructorGuard) {
            logger$5.throwError("cannot use FixedNumber constructor; use FixedNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "new FixedFormat"
            });
        }
        this.format = format;
        this._hex = hex;
        this._value = value;
        this._isFixedNumber = true;
        Object.freeze(this);
    }
    _checkFormat(other) {
        if (this.format.name !== other.format.name) {
            logger$5.throwArgumentError("incompatible format; use fixedNumber.toFormat", "other", other);
        }
    }
    addUnsafe(other) {
        this._checkFormat(other);
        const a = parseFixed(this._value, this.format.decimals);
        const b = parseFixed(other._value, other.format.decimals);
        return FixedNumber.fromValue(a.add(b), this.format.decimals, this.format);
    }
    subUnsafe(other) {
        this._checkFormat(other);
        const a = parseFixed(this._value, this.format.decimals);
        const b = parseFixed(other._value, other.format.decimals);
        return FixedNumber.fromValue(a.sub(b), this.format.decimals, this.format);
    }
    mulUnsafe(other) {
        this._checkFormat(other);
        const a = parseFixed(this._value, this.format.decimals);
        const b = parseFixed(other._value, other.format.decimals);
        return FixedNumber.fromValue(a.mul(b).div(this.format._multiplier), this.format.decimals, this.format);
    }
    divUnsafe(other) {
        this._checkFormat(other);
        const a = parseFixed(this._value, this.format.decimals);
        const b = parseFixed(other._value, other.format.decimals);
        return FixedNumber.fromValue(a.mul(this.format._multiplier).div(b), this.format.decimals, this.format);
    }
    floor() {
        const comps = this.toString().split(".");
        if (comps.length === 1) {
            comps.push("0");
        }
        let result = FixedNumber.from(comps[0], this.format);
        const hasFraction = !comps[1].match(/^(0*)$/);
        if (this.isNegative() && hasFraction) {
            result = result.subUnsafe(ONE$2.toFormat(result.format));
        }
        return result;
    }
    ceiling() {
        const comps = this.toString().split(".");
        if (comps.length === 1) {
            comps.push("0");
        }
        let result = FixedNumber.from(comps[0], this.format);
        const hasFraction = !comps[1].match(/^(0*)$/);
        if (!this.isNegative() && hasFraction) {
            result = result.addUnsafe(ONE$2.toFormat(result.format));
        }
        return result;
    }
    // @TODO: Support other rounding algorithms
    round(decimals) {
        if (decimals == null) {
            decimals = 0;
        }
        // If we are already in range, we're done
        const comps = this.toString().split(".");
        if (comps.length === 1) {
            comps.push("0");
        }
        if (decimals < 0 || decimals > 80 || (decimals % 1)) {
            logger$5.throwArgumentError("invalid decimal count", "decimals", decimals);
        }
        if (comps[1].length <= decimals) {
            return this;
        }
        const factor = FixedNumber.from("1" + zeros.substring(0, decimals), this.format);
        const bump = BUMP.toFormat(this.format);
        return this.mulUnsafe(factor).addUnsafe(bump).floor().divUnsafe(factor);
    }
    isZero() {
        return (this._value === "0.0" || this._value === "0");
    }
    isNegative() {
        return (this._value[0] === "-");
    }
    toString() { return this._value; }
    toHexString(width) {
        if (width == null) {
            return this._hex;
        }
        if (width % 8) {
            logger$5.throwArgumentError("invalid byte width", "width", width);
        }
        const hex = BigNumber.from(this._hex).fromTwos(this.format.width).toTwos(width).toHexString();
        return hexZeroPad(hex, width / 8);
    }
    toUnsafeFloat() { return parseFloat(this.toString()); }
    toFormat(format) {
        return FixedNumber.fromString(this._value, format);
    }
    static fromValue(value, decimals, format) {
        // If decimals looks more like a format, and there is no format, shift the parameters
        if (format == null && decimals != null && !isBigNumberish(decimals)) {
            format = decimals;
            decimals = null;
        }
        if (decimals == null) {
            decimals = 0;
        }
        if (format == null) {
            format = "fixed";
        }
        return FixedNumber.fromString(formatFixed(value, decimals), FixedFormat.from(format));
    }
    static fromString(value, format) {
        if (format == null) {
            format = "fixed";
        }
        const fixedFormat = FixedFormat.from(format);
        const numeric = parseFixed(value, fixedFormat.decimals);
        if (!fixedFormat.signed && numeric.lt(Zero)) {
            throwFault("unsigned value cannot be negative", "overflow", "value", value);
        }
        let hex = null;
        if (fixedFormat.signed) {
            hex = numeric.toTwos(fixedFormat.width).toHexString();
        }
        else {
            hex = numeric.toHexString();
            hex = hexZeroPad(hex, fixedFormat.width / 8);
        }
        const decimal = formatFixed(numeric, fixedFormat.decimals);
        return new FixedNumber(_constructorGuard, hex, decimal, fixedFormat);
    }
    static fromBytes(value, format) {
        if (format == null) {
            format = "fixed";
        }
        const fixedFormat = FixedFormat.from(format);
        if (arrayify(value).length > fixedFormat.width / 8) {
            throw new Error("overflow");
        }
        let numeric = BigNumber.from(value);
        if (fixedFormat.signed) {
            numeric = numeric.fromTwos(fixedFormat.width);
        }
        const hex = numeric.toTwos((fixedFormat.signed ? 0 : 1) + fixedFormat.width).toHexString();
        const decimal = formatFixed(numeric, fixedFormat.decimals);
        return new FixedNumber(_constructorGuard, hex, decimal, fixedFormat);
    }
    static from(value, format) {
        if (typeof (value) === "string") {
            return FixedNumber.fromString(value, format);
        }
        if (isBytes(value)) {
            return FixedNumber.fromBytes(value, format);
        }
        try {
            return FixedNumber.fromValue(value, 0, format);
        }
        catch (error) {
            // Allow NUMERIC_FAULT to bubble up
            if (error.code !== Logger.errors.INVALID_ARGUMENT) {
                throw error;
            }
        }
        return logger$5.throwArgumentError("invalid FixedNumber value", "value", value);
    }
    static isFixedNumber(value) {
        return !!(value && value._isFixedNumber);
    }
}
const ONE$2 = FixedNumber.from(1);
const BUMP = FixedNumber.from("0.5");

var sha3$1 = {exports: {}};

/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2018
 * @license MIT
 */

(function (module) {
	/*jslint bitwise: true */
	(function () {

	  var INPUT_ERROR = 'input is invalid type';
	  var FINALIZE_ERROR = 'finalize already called';
	  var WINDOW = typeof window === 'object';
	  var root = WINDOW ? window : {};
	  if (root.JS_SHA3_NO_WINDOW) {
	    WINDOW = false;
	  }
	  var WEB_WORKER = !WINDOW && typeof self === 'object';
	  var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
	  if (NODE_JS) {
	    root = commonjsGlobal;
	  } else if (WEB_WORKER) {
	    root = self;
	  }
	  var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && 'object' === 'object' && module.exports;
	  var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
	  var HEX_CHARS = '0123456789abcdef'.split('');
	  var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
	  var CSHAKE_PADDING = [4, 1024, 262144, 67108864];
	  var KECCAK_PADDING = [1, 256, 65536, 16777216];
	  var PADDING = [6, 1536, 393216, 100663296];
	  var SHIFT = [0, 8, 16, 24];
	  var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649,
	    0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0,
	    2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771,
	    2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648,
	    2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
	  var BITS = [224, 256, 384, 512];
	  var SHAKE_BITS = [128, 256];
	  var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array', 'digest'];
	  var CSHAKE_BYTEPAD = {
	    '128': 168,
	    '256': 136
	  };

	  if (root.JS_SHA3_NO_NODE_JS || !Array.isArray) {
	    Array.isArray = function (obj) {
	      return Object.prototype.toString.call(obj) === '[object Array]';
	    };
	  }

	  if (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
	    ArrayBuffer.isView = function (obj) {
	      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
	    };
	  }

	  var createOutputMethod = function (bits, padding, outputType) {
	    return function (message) {
	      return new Keccak(bits, padding, bits).update(message)[outputType]();
	    };
	  };

	  var createShakeOutputMethod = function (bits, padding, outputType) {
	    return function (message, outputBits) {
	      return new Keccak(bits, padding, outputBits).update(message)[outputType]();
	    };
	  };

	  var createCshakeOutputMethod = function (bits, padding, outputType) {
	    return function (message, outputBits, n, s) {
	      return methods['cshake' + bits].update(message, outputBits, n, s)[outputType]();
	    };
	  };

	  var createKmacOutputMethod = function (bits, padding, outputType) {
	    return function (key, message, outputBits, s) {
	      return methods['kmac' + bits].update(key, message, outputBits, s)[outputType]();
	    };
	  };

	  var createOutputMethods = function (method, createMethod, bits, padding) {
	    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
	      var type = OUTPUT_TYPES[i];
	      method[type] = createMethod(bits, padding, type);
	    }
	    return method;
	  };

	  var createMethod = function (bits, padding) {
	    var method = createOutputMethod(bits, padding, 'hex');
	    method.create = function () {
	      return new Keccak(bits, padding, bits);
	    };
	    method.update = function (message) {
	      return method.create().update(message);
	    };
	    return createOutputMethods(method, createOutputMethod, bits, padding);
	  };

	  var createShakeMethod = function (bits, padding) {
	    var method = createShakeOutputMethod(bits, padding, 'hex');
	    method.create = function (outputBits) {
	      return new Keccak(bits, padding, outputBits);
	    };
	    method.update = function (message, outputBits) {
	      return method.create(outputBits).update(message);
	    };
	    return createOutputMethods(method, createShakeOutputMethod, bits, padding);
	  };

	  var createCshakeMethod = function (bits, padding) {
	    var w = CSHAKE_BYTEPAD[bits];
	    var method = createCshakeOutputMethod(bits, padding, 'hex');
	    method.create = function (outputBits, n, s) {
	      if (!n && !s) {
	        return methods['shake' + bits].create(outputBits);
	      } else {
	        return new Keccak(bits, padding, outputBits).bytepad([n, s], w);
	      }
	    };
	    method.update = function (message, outputBits, n, s) {
	      return method.create(outputBits, n, s).update(message);
	    };
	    return createOutputMethods(method, createCshakeOutputMethod, bits, padding);
	  };

	  var createKmacMethod = function (bits, padding) {
	    var w = CSHAKE_BYTEPAD[bits];
	    var method = createKmacOutputMethod(bits, padding, 'hex');
	    method.create = function (key, outputBits, s) {
	      return new Kmac(bits, padding, outputBits).bytepad(['KMAC', s], w).bytepad([key], w);
	    };
	    method.update = function (key, message, outputBits, s) {
	      return method.create(key, outputBits, s).update(message);
	    };
	    return createOutputMethods(method, createKmacOutputMethod, bits, padding);
	  };

	  var algorithms = [
	    { name: 'keccak', padding: KECCAK_PADDING, bits: BITS, createMethod: createMethod },
	    { name: 'sha3', padding: PADDING, bits: BITS, createMethod: createMethod },
	    { name: 'shake', padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod },
	    { name: 'cshake', padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createCshakeMethod },
	    { name: 'kmac', padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createKmacMethod }
	  ];

	  var methods = {}, methodNames = [];

	  for (var i = 0; i < algorithms.length; ++i) {
	    var algorithm = algorithms[i];
	    var bits = algorithm.bits;
	    for (var j = 0; j < bits.length; ++j) {
	      var methodName = algorithm.name + '_' + bits[j];
	      methodNames.push(methodName);
	      methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
	      if (algorithm.name !== 'sha3') {
	        var newMethodName = algorithm.name + bits[j];
	        methodNames.push(newMethodName);
	        methods[newMethodName] = methods[methodName];
	      }
	    }
	  }

	  function Keccak(bits, padding, outputBits) {
	    this.blocks = [];
	    this.s = [];
	    this.padding = padding;
	    this.outputBits = outputBits;
	    this.reset = true;
	    this.finalized = false;
	    this.block = 0;
	    this.start = 0;
	    this.blockCount = (1600 - (bits << 1)) >> 5;
	    this.byteCount = this.blockCount << 2;
	    this.outputBlocks = outputBits >> 5;
	    this.extraBytes = (outputBits & 31) >> 3;

	    for (var i = 0; i < 50; ++i) {
	      this.s[i] = 0;
	    }
	  }

	  Keccak.prototype.update = function (message) {
	    if (this.finalized) {
	      throw new Error(FINALIZE_ERROR);
	    }
	    var notString, type = typeof message;
	    if (type !== 'string') {
	      if (type === 'object') {
	        if (message === null) {
	          throw new Error(INPUT_ERROR);
	        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
	          message = new Uint8Array(message);
	        } else if (!Array.isArray(message)) {
	          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
	            throw new Error(INPUT_ERROR);
	          }
	        }
	      } else {
	        throw new Error(INPUT_ERROR);
	      }
	      notString = true;
	    }
	    var blocks = this.blocks, byteCount = this.byteCount, length = message.length,
	      blockCount = this.blockCount, index = 0, s = this.s, i, code;

	    while (index < length) {
	      if (this.reset) {
	        this.reset = false;
	        blocks[0] = this.block;
	        for (i = 1; i < blockCount + 1; ++i) {
	          blocks[i] = 0;
	        }
	      }
	      if (notString) {
	        for (i = this.start; index < length && i < byteCount; ++index) {
	          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
	        }
	      } else {
	        for (i = this.start; index < length && i < byteCount; ++index) {
	          code = message.charCodeAt(index);
	          if (code < 0x80) {
	            blocks[i >> 2] |= code << SHIFT[i++ & 3];
	          } else if (code < 0x800) {
	            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
	          } else if (code < 0xd800 || code >= 0xe000) {
	            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
	          } else {
	            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
	            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
	            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
	          }
	        }
	      }
	      this.lastByteIndex = i;
	      if (i >= byteCount) {
	        this.start = i - byteCount;
	        this.block = blocks[blockCount];
	        for (i = 0; i < blockCount; ++i) {
	          s[i] ^= blocks[i];
	        }
	        f(s);
	        this.reset = true;
	      } else {
	        this.start = i;
	      }
	    }
	    return this;
	  };

	  Keccak.prototype.encode = function (x, right) {
	    var o = x & 255, n = 1;
	    var bytes = [o];
	    x = x >> 8;
	    o = x & 255;
	    while (o > 0) {
	      bytes.unshift(o);
	      x = x >> 8;
	      o = x & 255;
	      ++n;
	    }
	    if (right) {
	      bytes.push(n);
	    } else {
	      bytes.unshift(n);
	    }
	    this.update(bytes);
	    return bytes.length;
	  };

	  Keccak.prototype.encodeString = function (str) {
	    var notString, type = typeof str;
	    if (type !== 'string') {
	      if (type === 'object') {
	        if (str === null) {
	          throw new Error(INPUT_ERROR);
	        } else if (ARRAY_BUFFER && str.constructor === ArrayBuffer) {
	          str = new Uint8Array(str);
	        } else if (!Array.isArray(str)) {
	          if (!ARRAY_BUFFER || !ArrayBuffer.isView(str)) {
	            throw new Error(INPUT_ERROR);
	          }
	        }
	      } else {
	        throw new Error(INPUT_ERROR);
	      }
	      notString = true;
	    }
	    var bytes = 0, length = str.length;
	    if (notString) {
	      bytes = length;
	    } else {
	      for (var i = 0; i < str.length; ++i) {
	        var code = str.charCodeAt(i);
	        if (code < 0x80) {
	          bytes += 1;
	        } else if (code < 0x800) {
	          bytes += 2;
	        } else if (code < 0xd800 || code >= 0xe000) {
	          bytes += 3;
	        } else {
	          code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(++i) & 0x3ff));
	          bytes += 4;
	        }
	      }
	    }
	    bytes += this.encode(bytes * 8);
	    this.update(str);
	    return bytes;
	  };

	  Keccak.prototype.bytepad = function (strs, w) {
	    var bytes = this.encode(w);
	    for (var i = 0; i < strs.length; ++i) {
	      bytes += this.encodeString(strs[i]);
	    }
	    var paddingBytes = w - bytes % w;
	    var zeros = [];
	    zeros.length = paddingBytes;
	    this.update(zeros);
	    return this;
	  };

	  Keccak.prototype.finalize = function () {
	    if (this.finalized) {
	      return;
	    }
	    this.finalized = true;
	    var blocks = this.blocks, i = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
	    blocks[i >> 2] |= this.padding[i & 3];
	    if (this.lastByteIndex === this.byteCount) {
	      blocks[0] = blocks[blockCount];
	      for (i = 1; i < blockCount + 1; ++i) {
	        blocks[i] = 0;
	      }
	    }
	    blocks[blockCount - 1] |= 0x80000000;
	    for (i = 0; i < blockCount; ++i) {
	      s[i] ^= blocks[i];
	    }
	    f(s);
	  };

	  Keccak.prototype.toString = Keccak.prototype.hex = function () {
	    this.finalize();

	    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
	      extraBytes = this.extraBytes, i = 0, j = 0;
	    var hex = '', block;
	    while (j < outputBlocks) {
	      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
	        block = s[i];
	        hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F] +
	          HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F] +
	          HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F] +
	          HEX_CHARS[(block >> 28) & 0x0F] + HEX_CHARS[(block >> 24) & 0x0F];
	      }
	      if (j % blockCount === 0) {
	        f(s);
	        i = 0;
	      }
	    }
	    if (extraBytes) {
	      block = s[i];
	      hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F];
	      if (extraBytes > 1) {
	        hex += HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F];
	      }
	      if (extraBytes > 2) {
	        hex += HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F];
	      }
	    }
	    return hex;
	  };

	  Keccak.prototype.arrayBuffer = function () {
	    this.finalize();

	    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
	      extraBytes = this.extraBytes, i = 0, j = 0;
	    var bytes = this.outputBits >> 3;
	    var buffer;
	    if (extraBytes) {
	      buffer = new ArrayBuffer((outputBlocks + 1) << 2);
	    } else {
	      buffer = new ArrayBuffer(bytes);
	    }
	    var array = new Uint32Array(buffer);
	    while (j < outputBlocks) {
	      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
	        array[j] = s[i];
	      }
	      if (j % blockCount === 0) {
	        f(s);
	      }
	    }
	    if (extraBytes) {
	      array[i] = s[i];
	      buffer = buffer.slice(0, bytes);
	    }
	    return buffer;
	  };

	  Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;

	  Keccak.prototype.digest = Keccak.prototype.array = function () {
	    this.finalize();

	    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
	      extraBytes = this.extraBytes, i = 0, j = 0;
	    var array = [], offset, block;
	    while (j < outputBlocks) {
	      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
	        offset = j << 2;
	        block = s[i];
	        array[offset] = block & 0xFF;
	        array[offset + 1] = (block >> 8) & 0xFF;
	        array[offset + 2] = (block >> 16) & 0xFF;
	        array[offset + 3] = (block >> 24) & 0xFF;
	      }
	      if (j % blockCount === 0) {
	        f(s);
	      }
	    }
	    if (extraBytes) {
	      offset = j << 2;
	      block = s[i];
	      array[offset] = block & 0xFF;
	      if (extraBytes > 1) {
	        array[offset + 1] = (block >> 8) & 0xFF;
	      }
	      if (extraBytes > 2) {
	        array[offset + 2] = (block >> 16) & 0xFF;
	      }
	    }
	    return array;
	  };

	  function Kmac(bits, padding, outputBits) {
	    Keccak.call(this, bits, padding, outputBits);
	  }

	  Kmac.prototype = new Keccak();

	  Kmac.prototype.finalize = function () {
	    this.encode(this.outputBits, true);
	    return Keccak.prototype.finalize.call(this);
	  };

	  var f = function (s) {
	    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9,
	      b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17,
	      b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33,
	      b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
	    for (n = 0; n < 48; n += 2) {
	      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
	      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
	      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
	      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
	      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
	      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
	      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
	      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
	      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
	      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

	      h = c8 ^ ((c2 << 1) | (c3 >>> 31));
	      l = c9 ^ ((c3 << 1) | (c2 >>> 31));
	      s[0] ^= h;
	      s[1] ^= l;
	      s[10] ^= h;
	      s[11] ^= l;
	      s[20] ^= h;
	      s[21] ^= l;
	      s[30] ^= h;
	      s[31] ^= l;
	      s[40] ^= h;
	      s[41] ^= l;
	      h = c0 ^ ((c4 << 1) | (c5 >>> 31));
	      l = c1 ^ ((c5 << 1) | (c4 >>> 31));
	      s[2] ^= h;
	      s[3] ^= l;
	      s[12] ^= h;
	      s[13] ^= l;
	      s[22] ^= h;
	      s[23] ^= l;
	      s[32] ^= h;
	      s[33] ^= l;
	      s[42] ^= h;
	      s[43] ^= l;
	      h = c2 ^ ((c6 << 1) | (c7 >>> 31));
	      l = c3 ^ ((c7 << 1) | (c6 >>> 31));
	      s[4] ^= h;
	      s[5] ^= l;
	      s[14] ^= h;
	      s[15] ^= l;
	      s[24] ^= h;
	      s[25] ^= l;
	      s[34] ^= h;
	      s[35] ^= l;
	      s[44] ^= h;
	      s[45] ^= l;
	      h = c4 ^ ((c8 << 1) | (c9 >>> 31));
	      l = c5 ^ ((c9 << 1) | (c8 >>> 31));
	      s[6] ^= h;
	      s[7] ^= l;
	      s[16] ^= h;
	      s[17] ^= l;
	      s[26] ^= h;
	      s[27] ^= l;
	      s[36] ^= h;
	      s[37] ^= l;
	      s[46] ^= h;
	      s[47] ^= l;
	      h = c6 ^ ((c0 << 1) | (c1 >>> 31));
	      l = c7 ^ ((c1 << 1) | (c0 >>> 31));
	      s[8] ^= h;
	      s[9] ^= l;
	      s[18] ^= h;
	      s[19] ^= l;
	      s[28] ^= h;
	      s[29] ^= l;
	      s[38] ^= h;
	      s[39] ^= l;
	      s[48] ^= h;
	      s[49] ^= l;

	      b0 = s[0];
	      b1 = s[1];
	      b32 = (s[11] << 4) | (s[10] >>> 28);
	      b33 = (s[10] << 4) | (s[11] >>> 28);
	      b14 = (s[20] << 3) | (s[21] >>> 29);
	      b15 = (s[21] << 3) | (s[20] >>> 29);
	      b46 = (s[31] << 9) | (s[30] >>> 23);
	      b47 = (s[30] << 9) | (s[31] >>> 23);
	      b28 = (s[40] << 18) | (s[41] >>> 14);
	      b29 = (s[41] << 18) | (s[40] >>> 14);
	      b20 = (s[2] << 1) | (s[3] >>> 31);
	      b21 = (s[3] << 1) | (s[2] >>> 31);
	      b2 = (s[13] << 12) | (s[12] >>> 20);
	      b3 = (s[12] << 12) | (s[13] >>> 20);
	      b34 = (s[22] << 10) | (s[23] >>> 22);
	      b35 = (s[23] << 10) | (s[22] >>> 22);
	      b16 = (s[33] << 13) | (s[32] >>> 19);
	      b17 = (s[32] << 13) | (s[33] >>> 19);
	      b48 = (s[42] << 2) | (s[43] >>> 30);
	      b49 = (s[43] << 2) | (s[42] >>> 30);
	      b40 = (s[5] << 30) | (s[4] >>> 2);
	      b41 = (s[4] << 30) | (s[5] >>> 2);
	      b22 = (s[14] << 6) | (s[15] >>> 26);
	      b23 = (s[15] << 6) | (s[14] >>> 26);
	      b4 = (s[25] << 11) | (s[24] >>> 21);
	      b5 = (s[24] << 11) | (s[25] >>> 21);
	      b36 = (s[34] << 15) | (s[35] >>> 17);
	      b37 = (s[35] << 15) | (s[34] >>> 17);
	      b18 = (s[45] << 29) | (s[44] >>> 3);
	      b19 = (s[44] << 29) | (s[45] >>> 3);
	      b10 = (s[6] << 28) | (s[7] >>> 4);
	      b11 = (s[7] << 28) | (s[6] >>> 4);
	      b42 = (s[17] << 23) | (s[16] >>> 9);
	      b43 = (s[16] << 23) | (s[17] >>> 9);
	      b24 = (s[26] << 25) | (s[27] >>> 7);
	      b25 = (s[27] << 25) | (s[26] >>> 7);
	      b6 = (s[36] << 21) | (s[37] >>> 11);
	      b7 = (s[37] << 21) | (s[36] >>> 11);
	      b38 = (s[47] << 24) | (s[46] >>> 8);
	      b39 = (s[46] << 24) | (s[47] >>> 8);
	      b30 = (s[8] << 27) | (s[9] >>> 5);
	      b31 = (s[9] << 27) | (s[8] >>> 5);
	      b12 = (s[18] << 20) | (s[19] >>> 12);
	      b13 = (s[19] << 20) | (s[18] >>> 12);
	      b44 = (s[29] << 7) | (s[28] >>> 25);
	      b45 = (s[28] << 7) | (s[29] >>> 25);
	      b26 = (s[38] << 8) | (s[39] >>> 24);
	      b27 = (s[39] << 8) | (s[38] >>> 24);
	      b8 = (s[48] << 14) | (s[49] >>> 18);
	      b9 = (s[49] << 14) | (s[48] >>> 18);

	      s[0] = b0 ^ (~b2 & b4);
	      s[1] = b1 ^ (~b3 & b5);
	      s[10] = b10 ^ (~b12 & b14);
	      s[11] = b11 ^ (~b13 & b15);
	      s[20] = b20 ^ (~b22 & b24);
	      s[21] = b21 ^ (~b23 & b25);
	      s[30] = b30 ^ (~b32 & b34);
	      s[31] = b31 ^ (~b33 & b35);
	      s[40] = b40 ^ (~b42 & b44);
	      s[41] = b41 ^ (~b43 & b45);
	      s[2] = b2 ^ (~b4 & b6);
	      s[3] = b3 ^ (~b5 & b7);
	      s[12] = b12 ^ (~b14 & b16);
	      s[13] = b13 ^ (~b15 & b17);
	      s[22] = b22 ^ (~b24 & b26);
	      s[23] = b23 ^ (~b25 & b27);
	      s[32] = b32 ^ (~b34 & b36);
	      s[33] = b33 ^ (~b35 & b37);
	      s[42] = b42 ^ (~b44 & b46);
	      s[43] = b43 ^ (~b45 & b47);
	      s[4] = b4 ^ (~b6 & b8);
	      s[5] = b5 ^ (~b7 & b9);
	      s[14] = b14 ^ (~b16 & b18);
	      s[15] = b15 ^ (~b17 & b19);
	      s[24] = b24 ^ (~b26 & b28);
	      s[25] = b25 ^ (~b27 & b29);
	      s[34] = b34 ^ (~b36 & b38);
	      s[35] = b35 ^ (~b37 & b39);
	      s[44] = b44 ^ (~b46 & b48);
	      s[45] = b45 ^ (~b47 & b49);
	      s[6] = b6 ^ (~b8 & b0);
	      s[7] = b7 ^ (~b9 & b1);
	      s[16] = b16 ^ (~b18 & b10);
	      s[17] = b17 ^ (~b19 & b11);
	      s[26] = b26 ^ (~b28 & b20);
	      s[27] = b27 ^ (~b29 & b21);
	      s[36] = b36 ^ (~b38 & b30);
	      s[37] = b37 ^ (~b39 & b31);
	      s[46] = b46 ^ (~b48 & b40);
	      s[47] = b47 ^ (~b49 & b41);
	      s[8] = b8 ^ (~b0 & b2);
	      s[9] = b9 ^ (~b1 & b3);
	      s[18] = b18 ^ (~b10 & b12);
	      s[19] = b19 ^ (~b11 & b13);
	      s[28] = b28 ^ (~b20 & b22);
	      s[29] = b29 ^ (~b21 & b23);
	      s[38] = b38 ^ (~b30 & b32);
	      s[39] = b39 ^ (~b31 & b33);
	      s[48] = b48 ^ (~b40 & b42);
	      s[49] = b49 ^ (~b41 & b43);

	      s[0] ^= RC[n];
	      s[1] ^= RC[n + 1];
	    }
	  };

	  if (COMMON_JS) {
	    module.exports = methods;
	  } else {
	    for (i = 0; i < methodNames.length; ++i) {
	      root[methodNames[i]] = methods[methodNames[i]];
	    }
	  }
	})();
} (sha3$1));

var sha3 = sha3$1.exports;

function keccak256$1(data) {
    return '0x' + sha3.keccak_256(arrayify(data));
}

const version$4 = "rlp/5.6.1";

const logger$4 = new Logger(version$4);
function arrayifyInteger(value) {
    const result = [];
    while (value) {
        result.unshift(value & 0xff);
        value >>= 8;
    }
    return result;
}
function unarrayifyInteger(data, offset, length) {
    let result = 0;
    for (let i = 0; i < length; i++) {
        result = (result * 256) + data[offset + i];
    }
    return result;
}
function _encode(object) {
    if (Array.isArray(object)) {
        let payload = [];
        object.forEach(function (child) {
            payload = payload.concat(_encode(child));
        });
        if (payload.length <= 55) {
            payload.unshift(0xc0 + payload.length);
            return payload;
        }
        const length = arrayifyInteger(payload.length);
        length.unshift(0xf7 + length.length);
        return length.concat(payload);
    }
    if (!isBytesLike(object)) {
        logger$4.throwArgumentError("RLP object must be BytesLike", "object", object);
    }
    const data = Array.prototype.slice.call(arrayify(object));
    if (data.length === 1 && data[0] <= 0x7f) {
        return data;
    }
    else if (data.length <= 55) {
        data.unshift(0x80 + data.length);
        return data;
    }
    const length = arrayifyInteger(data.length);
    length.unshift(0xb7 + length.length);
    return length.concat(data);
}
function encode(object) {
    return hexlify(_encode(object));
}
function _decodeChildren(data, offset, childOffset, length) {
    const result = [];
    while (childOffset < offset + 1 + length) {
        const decoded = _decode(data, childOffset);
        result.push(decoded.result);
        childOffset += decoded.consumed;
        if (childOffset > offset + 1 + length) {
            logger$4.throwError("child data too short", Logger.errors.BUFFER_OVERRUN, {});
        }
    }
    return { consumed: (1 + length), result: result };
}
// returns { consumed: number, result: Object }
function _decode(data, offset) {
    if (data.length === 0) {
        logger$4.throwError("data too short", Logger.errors.BUFFER_OVERRUN, {});
    }
    // Array with extra length prefix
    if (data[offset] >= 0xf8) {
        const lengthLength = data[offset] - 0xf7;
        if (offset + 1 + lengthLength > data.length) {
            logger$4.throwError("data short segment too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        const length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            logger$4.throwError("data long segment too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length);
    }
    else if (data[offset] >= 0xc0) {
        const length = data[offset] - 0xc0;
        if (offset + 1 + length > data.length) {
            logger$4.throwError("data array too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        return _decodeChildren(data, offset, offset + 1, length);
    }
    else if (data[offset] >= 0xb8) {
        const lengthLength = data[offset] - 0xb7;
        if (offset + 1 + lengthLength > data.length) {
            logger$4.throwError("data array too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        const length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            logger$4.throwError("data array too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        const result = hexlify(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length));
        return { consumed: (1 + lengthLength + length), result: result };
    }
    else if (data[offset] >= 0x80) {
        const length = data[offset] - 0x80;
        if (offset + 1 + length > data.length) {
            logger$4.throwError("data too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        const result = hexlify(data.slice(offset + 1, offset + 1 + length));
        return { consumed: (1 + length), result: result };
    }
    return { consumed: 1, result: hexlify(data[offset]) };
}
function decode(data) {
    const bytes = arrayify(data);
    const decoded = _decode(bytes, 0);
    if (decoded.consumed !== bytes.length) {
        logger$4.throwArgumentError("invalid rlp data", "data", data);
    }
    return decoded.result;
}

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    encode: encode,
    decode: decode
});

const version$3 = "address/5.6.1";

const logger$3 = new Logger(version$3);
function getChecksumAddress(address) {
    if (!isHexString(address, 20)) {
        logger$3.throwArgumentError("invalid address", "address", address);
    }
    address = address.toLowerCase();
    const chars = address.substring(2).split("");
    const expanded = new Uint8Array(40);
    for (let i = 0; i < 40; i++) {
        expanded[i] = chars[i].charCodeAt(0);
    }
    const hashed = arrayify(keccak256$1(expanded));
    for (let i = 0; i < 40; i += 2) {
        if ((hashed[i >> 1] >> 4) >= 8) {
            chars[i] = chars[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase();
        }
    }
    return "0x" + chars.join("");
}
// Shims for environments that are missing some required constants and functions
const MAX_SAFE_INTEGER$1 = 0x1fffffffffffff;
function log10(x) {
    if (Math.log10) {
        return Math.log10(x);
    }
    return Math.log(x) / Math.LN10;
}
// See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
// Create lookup table
const ibanLookup = {};
for (let i = 0; i < 10; i++) {
    ibanLookup[String(i)] = String(i);
}
for (let i = 0; i < 26; i++) {
    ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
}
// How many decimal digits can we process? (for 64-bit float, this is 15)
const safeDigits = Math.floor(log10(MAX_SAFE_INTEGER$1));
function ibanChecksum(address) {
    address = address.toUpperCase();
    address = address.substring(4) + address.substring(0, 2) + "00";
    let expanded = address.split("").map((c) => { return ibanLookup[c]; }).join("");
    // Javascript can handle integers safely up to 15 (decimal) digits
    while (expanded.length >= safeDigits) {
        let block = expanded.substring(0, safeDigits);
        expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
    }
    let checksum = String(98 - (parseInt(expanded, 10) % 97));
    while (checksum.length < 2) {
        checksum = "0" + checksum;
    }
    return checksum;
}
function getAddress(address) {
    let result = null;
    if (typeof (address) !== "string") {
        logger$3.throwArgumentError("invalid address", "address", address);
    }
    if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
        // Missing the 0x prefix
        if (address.substring(0, 2) !== "0x") {
            address = "0x" + address;
        }
        result = getChecksumAddress(address);
        // It is a checksummed address with a bad checksum
        if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
            logger$3.throwArgumentError("bad address checksum", "address", address);
        }
        // Maybe ICAP? (we only support direct mode)
    }
    else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
        // It is an ICAP address with a bad checksum
        if (address.substring(2, 4) !== ibanChecksum(address)) {
            logger$3.throwArgumentError("bad icap checksum", "address", address);
        }
        result = _base36To16(address.substring(4));
        while (result.length < 40) {
            result = "0" + result;
        }
        result = getChecksumAddress("0x" + result);
    }
    else {
        logger$3.throwArgumentError("invalid address", "address", address);
    }
    return result;
}
function isAddress(address) {
    try {
        getAddress(address);
        return true;
    }
    catch (error) { }
    return false;
}
function getIcapAddress(address) {
    let base36 = _base16To36(getAddress(address).substring(2)).toUpperCase();
    while (base36.length < 30) {
        base36 = "0" + base36;
    }
    return "XE" + ibanChecksum("XE00" + base36) + base36;
}
// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
function getContractAddress(transaction) {
    let from = null;
    try {
        from = getAddress(transaction.from);
    }
    catch (error) {
        logger$3.throwArgumentError("missing from address", "transaction", transaction);
    }
    const nonce = stripZeros(arrayify(BigNumber.from(transaction.nonce).toHexString()));
    return getAddress(hexDataSlice(keccak256$1(encode([from, nonce])), 12));
}
function getCreate2Address(from, salt, initCodeHash) {
    if (hexDataLength(salt) !== 32) {
        logger$3.throwArgumentError("salt must be 32 bytes", "salt", salt);
    }
    if (hexDataLength(initCodeHash) !== 32) {
        logger$3.throwArgumentError("initCodeHash must be 32 bytes", "initCodeHash", initCodeHash);
    }
    return getAddress(hexDataSlice(keccak256$1(concat(["0xff", getAddress(from), salt, initCodeHash])), 12));
}

var TradeType;

(function (TradeType) {
  TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
})(TradeType || (TradeType = {}));

var Rounding;

(function (Rounding) {
  Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
})(Rounding || (Rounding = {}));

var MaxUint256 = /*#__PURE__*/JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

function _defineProperties$1(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass$1(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties$1(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose$1(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var _toSignificantRoundin, _toFixedRounding;
var Decimal = /*#__PURE__*/toFormat(_Decimal);
var Big = /*#__PURE__*/toFormat(_Big);
var toSignificantRounding = (_toSignificantRoundin = {}, _toSignificantRoundin[Rounding.ROUND_DOWN] = Decimal.ROUND_DOWN, _toSignificantRoundin[Rounding.ROUND_HALF_UP] = Decimal.ROUND_HALF_UP, _toSignificantRoundin[Rounding.ROUND_UP] = Decimal.ROUND_UP, _toSignificantRoundin);
var toFixedRounding = (_toFixedRounding = {}, _toFixedRounding[Rounding.ROUND_DOWN] = 0, _toFixedRounding[Rounding.ROUND_HALF_UP] = 1, _toFixedRounding[Rounding.ROUND_UP] = 3, _toFixedRounding);
var Fraction = /*#__PURE__*/function () {
  function Fraction(numerator, denominator) {
    if (denominator === void 0) {
      denominator = JSBI.BigInt(1);
    }

    this.numerator = JSBI.BigInt(numerator);
    this.denominator = JSBI.BigInt(denominator);
  }

  Fraction.tryParseFraction = function tryParseFraction(fractionish) {
    if (fractionish instanceof JSBI || typeof fractionish === 'number' || typeof fractionish === 'string') return new Fraction(fractionish);
    if ('numerator' in fractionish && 'denominator' in fractionish) return fractionish;
    throw new Error('Could not parse fraction');
  } // performs floor division
  ;

  var _proto = Fraction.prototype;

  _proto.invert = function invert() {
    return new Fraction(this.denominator, this.numerator);
  };

  _proto.add = function add(other) {
    var otherParsed = Fraction.tryParseFraction(other);

    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.add(this.numerator, otherParsed.numerator), this.denominator);
    }

    return new Fraction(JSBI.add(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };

  _proto.subtract = function subtract(other) {
    var otherParsed = Fraction.tryParseFraction(other);

    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }

    return new Fraction(JSBI.subtract(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };

  _proto.lessThan = function lessThan(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return JSBI.lessThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };

  _proto.equalTo = function equalTo(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return JSBI.equal(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };

  _proto.greaterThan = function greaterThan(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return JSBI.greaterThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };

  _proto.multiply = function multiply(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.numerator), JSBI.multiply(this.denominator, otherParsed.denominator));
  };

  _proto.divide = function divide(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(this.denominator, otherParsed.numerator));
  };

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }

    if (rounding === void 0) {
      rounding = Rounding.ROUND_HALF_UP;
    }

    !Number.isInteger(significantDigits) ? process.env.NODE_ENV !== "production" ? invariant(false, significantDigits + " is not an integer.") : invariant(false) : void 0;
    !(significantDigits > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, significantDigits + " is not positive.") : invariant(false) : void 0;
    Decimal.set({
      precision: significantDigits + 1,
      rounding: toSignificantRounding[rounding]
    });
    var quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
    return quotient.toFormat(quotient.decimalPlaces(), format);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }

    if (rounding === void 0) {
      rounding = Rounding.ROUND_HALF_UP;
    }

    !Number.isInteger(decimalPlaces) ? process.env.NODE_ENV !== "production" ? invariant(false, decimalPlaces + " is not an integer.") : invariant(false) : void 0;
    !(decimalPlaces >= 0) ? process.env.NODE_ENV !== "production" ? invariant(false, decimalPlaces + " is negative.") : invariant(false) : void 0;
    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding];
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
  }
  /**
   * Helper method for converting any super class back to a fraction
   */
  ;

  _createClass$1(Fraction, [{
    key: "quotient",
    get: function get() {
      return JSBI.divide(this.numerator, this.denominator);
    } // remainder after floor division

  }, {
    key: "remainder",
    get: function get() {
      return new Fraction(JSBI.remainder(this.numerator, this.denominator), this.denominator);
    }
  }, {
    key: "asFraction",
    get: function get() {
      return new Fraction(this.numerator, this.denominator);
    }
  }]);

  return Fraction;
}();

var Big$1 = /*#__PURE__*/toFormat(_Big);
var CurrencyAmount = /*#__PURE__*/function (_Fraction) {
  _inheritsLoose$1(CurrencyAmount, _Fraction);

  function CurrencyAmount(currency, numerator, denominator) {
    var _this;

    _this = _Fraction.call(this, numerator, denominator) || this;
    !JSBI.lessThanOrEqual(_this.quotient, MaxUint256) ? process.env.NODE_ENV !== "production" ? invariant(false, 'AMOUNT') : invariant(false) : void 0;
    _this.currency = currency;
    _this.decimalScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currency.decimals));
    return _this;
  }
  /**
   * Returns a new currency amount instance from the unitless amount of token, i.e. the raw amount
   * @param currency the currency in the amount
   * @param rawAmount the raw token or ether amount
   */


  CurrencyAmount.fromRawAmount = function fromRawAmount(currency, rawAmount) {
    return new CurrencyAmount(currency, rawAmount);
  }
  /**
   * Construct a currency amount with a denominator that is not equal to 1
   * @param currency the currency
   * @param numerator the numerator of the fractional token amount
   * @param denominator the denominator of the fractional token amount
   */
  ;

  CurrencyAmount.fromFractionalAmount = function fromFractionalAmount(currency, numerator, denominator) {
    return new CurrencyAmount(currency, numerator, denominator);
  };

  var _proto = CurrencyAmount.prototype;

  _proto.add = function add(other) {
    !this.currency.equals(other.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CURRENCY') : invariant(false) : void 0;

    var added = _Fraction.prototype.add.call(this, other);

    return CurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator);
  };

  _proto.subtract = function subtract(other) {
    !this.currency.equals(other.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CURRENCY') : invariant(false) : void 0;

    var subtracted = _Fraction.prototype.subtract.call(this, other);

    return CurrencyAmount.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator);
  };

  _proto.multiply = function multiply(other) {
    var multiplied = _Fraction.prototype.multiply.call(this, other);

    return CurrencyAmount.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator);
  };

  _proto.divide = function divide(other) {
    var divided = _Fraction.prototype.divide.call(this, other);

    return CurrencyAmount.fromFractionalAmount(this.currency, divided.numerator, divided.denominator);
  };

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }

    if (rounding === void 0) {
      rounding = Rounding.ROUND_DOWN;
    }

    return _Fraction.prototype.divide.call(this, this.decimalScale).toSignificant(significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = this.currency.decimals;
    }

    if (rounding === void 0) {
      rounding = Rounding.ROUND_DOWN;
    }

    !(decimalPlaces <= this.currency.decimals) ? process.env.NODE_ENV !== "production" ? invariant(false, 'DECIMALS') : invariant(false) : void 0;
    return _Fraction.prototype.divide.call(this, this.decimalScale).toFixed(decimalPlaces, format, rounding);
  };

  _proto.toExact = function toExact(format) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }

    Big$1.DP = this.currency.decimals;
    return new Big$1(this.quotient.toString()).div(this.decimalScale.toString()).toFormat(format);
  };

  _createClass$1(CurrencyAmount, [{
    key: "wrapped",
    get: function get() {
      if (this.currency.isToken) return this;
      return CurrencyAmount.fromFractionalAmount(this.currency.wrapped, this.numerator, this.denominator);
    }
  }]);

  return CurrencyAmount;
}(Fraction);

var ONE_HUNDRED = /*#__PURE__*/new Fraction( /*#__PURE__*/JSBI.BigInt(100));
/**
 * Converts a fraction to a percent
 * @param fraction the fraction to convert
 */

function toPercent(fraction) {
  return new Percent(fraction.numerator, fraction.denominator);
}

var Percent = /*#__PURE__*/function (_Fraction) {
  _inheritsLoose$1(Percent, _Fraction);

  function Percent() {
    var _this;

    _this = _Fraction.apply(this, arguments) || this;
    /**
     * This boolean prevents a fraction from being interpreted as a Percent
     */

    _this.isPercent = true;
    return _this;
  }

  var _proto = Percent.prototype;

  _proto.add = function add(other) {
    return toPercent(_Fraction.prototype.add.call(this, other));
  };

  _proto.subtract = function subtract(other) {
    return toPercent(_Fraction.prototype.subtract.call(this, other));
  };

  _proto.multiply = function multiply(other) {
    return toPercent(_Fraction.prototype.multiply.call(this, other));
  };

  _proto.divide = function divide(other) {
    return toPercent(_Fraction.prototype.divide.call(this, other));
  };

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 5;
    }

    return _Fraction.prototype.multiply.call(this, ONE_HUNDRED).toSignificant(significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 2;
    }

    return _Fraction.prototype.multiply.call(this, ONE_HUNDRED).toFixed(decimalPlaces, format, rounding);
  };

  return Percent;
}(Fraction);

var Price = /*#__PURE__*/function (_Fraction) {
  _inheritsLoose$1(Price, _Fraction);

  /**
   * Construct a price, either with the base and quote currency amount, or the
   * @param args
   */
  function Price() {
    var _this;

    var baseCurrency, quoteCurrency, denominator, numerator;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 4) {
      baseCurrency = args[0];
      quoteCurrency = args[1];
      denominator = args[2];
      numerator = args[3];
    } else {
      var result = args[0].quoteAmount.divide(args[0].baseAmount);
      var _ref = [args[0].baseAmount.currency, args[0].quoteAmount.currency, result.denominator, result.numerator];
      baseCurrency = _ref[0];
      quoteCurrency = _ref[1];
      denominator = _ref[2];
      numerator = _ref[3];
    }

    _this = _Fraction.call(this, numerator, denominator) || this;
    _this.baseCurrency = baseCurrency;
    _this.quoteCurrency = quoteCurrency;
    _this.scalar = new Fraction(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(baseCurrency.decimals)), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(quoteCurrency.decimals)));
    return _this;
  }
  /**
   * Flip the price, switching the base and quote currency
   */


  var _proto = Price.prototype;

  _proto.invert = function invert() {
    return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
  }
  /**
   * Multiply the price by another price, returning a new price. The other price must have the same base currency as this price's quote currency
   * @param other the other price
   */
  ;

  _proto.multiply = function multiply(other) {
    !this.quoteCurrency.equals(other.baseCurrency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;

    var fraction = _Fraction.prototype.multiply.call(this, other);

    return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
  }
  /**
   * Return the amount of quote currency corresponding to a given amount of the base currency
   * @param currencyAmount the amount of base currency to quote against the price
   */
  ;

  _proto.quote = function quote(currencyAmount) {
    !currencyAmount.currency.equals(this.baseCurrency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;

    var result = _Fraction.prototype.multiply.call(this, currencyAmount);

    return CurrencyAmount.fromFractionalAmount(this.quoteCurrency, result.numerator, result.denominator);
  }
  /**
   * Get the value scaled by decimals for formatting
   * @private
   */
  ;

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }

    return this.adjustedForDecimals.toSignificant(significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 4;
    }

    return this.adjustedForDecimals.toFixed(decimalPlaces, format, rounding);
  };

  _createClass$1(Price, [{
    key: "adjustedForDecimals",
    get: function get() {
      return _Fraction.prototype.multiply.call(this, this.scalar);
    }
  }]);

  return Price;
}(Fraction);

/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */

var BaseCurrency =
/**
 * Constructs an instance of the base class `BaseCurrency`.
 * @param chainId the chain ID on which this currency resides
 * @param decimals decimals of the currency
 * @param symbol symbol of the currency
 * @param name of the currency
 */
function BaseCurrency(chainId, decimals, symbol, name) {
  !Number.isSafeInteger(chainId) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_ID') : invariant(false) : void 0;
  !(decimals >= 0 && decimals < 255 && Number.isInteger(decimals)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'DECIMALS') : invariant(false) : void 0;
  this.chainId = chainId;
  this.decimals = decimals;
  this.symbol = symbol;
  this.name = name;
};

/**
 * Represents the native currency of the chain on which it resides, e.g.
 */

var NativeCurrency = /*#__PURE__*/function (_BaseCurrency) {
  _inheritsLoose$1(NativeCurrency, _BaseCurrency);

  function NativeCurrency() {
    var _this;

    _this = _BaseCurrency.apply(this, arguments) || this;
    _this.isNative = true;
    _this.isToken = false;
    return _this;
  }

  return NativeCurrency;
}(BaseCurrency);

/**
 * Validates an address and returns the parsed (checksummed) version of that address
 * @param address the unchecksummed hex address
 */

function validateAndParseAddress(address) {
  try {
    return getAddress(address);
  } catch (error) {
    throw new Error(address + " is not a valid address.");
  }
}

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */

var Token = /*#__PURE__*/function (_BaseCurrency) {
  _inheritsLoose$1(Token, _BaseCurrency);

  function Token(chainId, address, decimals, symbol, name) {
    var _this;

    _this = _BaseCurrency.call(this, chainId, decimals, symbol, name) || this;
    _this.isNative = false;
    _this.isToken = true;
    _this.address = validateAndParseAddress(address);
    return _this;
  }
  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
   * @param other other token to compare
   */


  var _proto = Token.prototype;

  _proto.equals = function equals(other) {
    return other.isToken && this.chainId === other.chainId && this.address === other.address;
  }
  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  ;

  _proto.sortsBefore = function sortsBefore(other) {
    !(this.chainId === other.chainId) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_IDS') : invariant(false) : void 0;
    !(this.address !== other.address) ? process.env.NODE_ENV !== "production" ? invariant(false, 'ADDRESSES') : invariant(false) : void 0;
    return this.address.toLowerCase() < other.address.toLowerCase();
  }
  /**
   * Return this token, which does not need to be wrapped
   */
  ;

  _createClass$1(Token, [{
    key: "wrapped",
    get: function get() {
      return this;
    }
  }]);

  return Token;
}(BaseCurrency);

var _WETH;
/**
 * Known WETH9 implementation addresses, used in our implementation of Ether#wrapped
 */

var WETH9 = (_WETH = {}, _WETH[1] = /*#__PURE__*/new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'), _WETH[3] = /*#__PURE__*/new Token(3, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), _WETH[4] = /*#__PURE__*/new Token(4, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), _WETH[5] = /*#__PURE__*/new Token(5, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'), _WETH[42] = /*#__PURE__*/new Token(42, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether'), _WETH[10] = /*#__PURE__*/new Token(10, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'), _WETH[69] = /*#__PURE__*/new Token(69, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'), _WETH[42161] = /*#__PURE__*/new Token(42161, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH', 'Wrapped Ether'), _WETH[421611] = /*#__PURE__*/new Token(421611, '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681', 18, 'WETH', 'Wrapped Ether'), _WETH);

/**
 * Ether is the main usage of a 'native' currency, i.e. for Ethereum mainnet and all testnets
 */

var Ether = /*#__PURE__*/function (_NativeCurrency) {
  _inheritsLoose$1(Ether, _NativeCurrency);

  function Ether(chainId) {
    return _NativeCurrency.call(this, chainId, 18, 'ETH', 'Ether') || this;
  }

  Ether.onChain = function onChain(chainId) {
    var _this$_etherCache$cha;

    return (_this$_etherCache$cha = this._etherCache[chainId]) != null ? _this$_etherCache$cha : this._etherCache[chainId] = new Ether(chainId);
  };

  var _proto = Ether.prototype;

  _proto.equals = function equals(other) {
    return other.isNative && other.chainId === this.chainId;
  };

  _createClass$1(Ether, [{
    key: "wrapped",
    get: function get() {
      var weth9 = WETH9[this.chainId];
      !!!weth9 ? process.env.NODE_ENV !== "production" ? invariant(false, 'WRAPPED') : invariant(false) : void 0;
      return weth9;
    }
  }]);

  return Ether;
}(NativeCurrency);
Ether._etherCache = {};

/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */

function computePriceImpact(midPrice, inputAmount, outputAmount) {
  var quotedOutputAmount = midPrice.quote(inputAmount); // calculate price impact := (exactQuote - outputAmount) / exactQuote

  var priceImpact = quotedOutputAmount.subtract(outputAmount).divide(quotedOutputAmount);
  return new Percent(priceImpact.numerator, priceImpact.denominator);
}

// `maxSize` by removing the last item

function sortedInsert(items, add, maxSize, comparator) {
  !(maxSize > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MAX_SIZE_ZERO') : invariant(false) : void 0; // this is an invariant because the interface cannot return multiple removed items if items.length exceeds maxSize

  !(items.length <= maxSize) ? process.env.NODE_ENV !== "production" ? invariant(false, 'ITEMS_SIZE') : invariant(false) : void 0; // short circuit first item add

  if (items.length === 0) {
    items.push(add);
    return null;
  } else {
    var isFull = items.length === maxSize; // short circuit if full and the additional item does not come before the last item

    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add;
    }

    var lo = 0,
        hi = items.length;

    while (lo < hi) {
      var mid = lo + hi >>> 1;

      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    items.splice(lo, 0, add);
    return isFull ? items.pop() : null;
  }
}

var MAX_SAFE_INTEGER = /*#__PURE__*/JSBI.BigInt(Number.MAX_SAFE_INTEGER);
var ZERO$1 = /*#__PURE__*/JSBI.BigInt(0);
var ONE$1 = /*#__PURE__*/JSBI.BigInt(1);
var TWO = /*#__PURE__*/JSBI.BigInt(2);
/**
 * Computes floor(sqrt(value))
 * @param value the value for which to compute the square root, rounded down
 */

function sqrt(value) {
  !JSBI.greaterThanOrEqual(value, ZERO$1) ? process.env.NODE_ENV !== "production" ? invariant(false, 'NEGATIVE') : invariant(false) : void 0; // rely on built in sqrt if possible

  if (JSBI.lessThan(value, MAX_SAFE_INTEGER)) {
    return JSBI.BigInt(Math.floor(Math.sqrt(JSBI.toNumber(value))));
  }

  var z;
  var x;
  z = value;
  x = JSBI.add(JSBI.divide(value, TWO), ONE$1);

  while (JSBI.lessThan(x, z)) {
    z = x;
    x = JSBI.divide(JSBI.add(JSBI.divide(value, x), x), TWO);
  }

  return z;
}

var _a$1, _b$1, _c$1;
/* List of supported chains for this application. */
var SupportedChainId;
(function (SupportedChainId) {
    SupportedChainId[SupportedChainId["MAINNET"] = 1] = "MAINNET";
    SupportedChainId[SupportedChainId["KOVAN"] = 42] = "KOVAN";
    SupportedChainId[SupportedChainId["FUSE"] = 122] = "FUSE";
    SupportedChainId[SupportedChainId["ROPSTEN"] = 3] = "ROPSTEN";
})(SupportedChainId || (SupportedChainId = {}));
var DAO_NETWORK;
(function (DAO_NETWORK) {
    DAO_NETWORK["MAINNET"] = "mainnet";
    DAO_NETWORK["FUSE"] = "fuse";
})(DAO_NETWORK || (DAO_NETWORK = {}));
var ChainIdHexes;
(function (ChainIdHexes) {
    ChainIdHexes["MAINNET"] = "0x1";
    ChainIdHexes["FUSE"] = "0x7a";
})(ChainIdHexes || (ChainIdHexes = {}));
/* List of supported chain's names. */
var NETWORK_LABELS = (_a$1 = {},
    _a$1[SupportedChainId.MAINNET] = 'mainnet',
    _a$1[SupportedChainId.KOVAN] = 'kovan',
    _a$1[SupportedChainId.FUSE] = 'fuse',
    _a$1[SupportedChainId.ROPSTEN] = 'ropsten',
    _a$1);
(_b$1 = {},
    _b$1[ChainIdHexes.MAINNET] = 1,
    _b$1[ChainIdHexes.FUSE] = 122,
    _b$1);
(_c$1 = {},
    _c$1[SupportedChainId.MAINNET] = 'ETH',
    _c$1[SupportedChainId.FUSE] = 'FUSE',
    _c$1);
[
    SupportedChainId.KOVAN,
    SupportedChainId.MAINNET,
    SupportedChainId.ROPSTEN
];
var portfolioSupportedAt = [SupportedChainId.KOVAN];

const version$2 = "strings/5.6.1";

const logger$2 = new Logger(version$2);
///////////////////////////////
var UnicodeNormalizationForm;
(function (UnicodeNormalizationForm) {
    UnicodeNormalizationForm["current"] = "";
    UnicodeNormalizationForm["NFC"] = "NFC";
    UnicodeNormalizationForm["NFD"] = "NFD";
    UnicodeNormalizationForm["NFKC"] = "NFKC";
    UnicodeNormalizationForm["NFKD"] = "NFKD";
})(UnicodeNormalizationForm || (UnicodeNormalizationForm = {}));
var Utf8ErrorReason;
(function (Utf8ErrorReason) {
    // A continuation byte was present where there was nothing to continue
    // - offset = the index the codepoint began in
    Utf8ErrorReason["UNEXPECTED_CONTINUE"] = "unexpected continuation byte";
    // An invalid (non-continuation) byte to start a UTF-8 codepoint was found
    // - offset = the index the codepoint began in
    Utf8ErrorReason["BAD_PREFIX"] = "bad codepoint prefix";
    // The string is too short to process the expected codepoint
    // - offset = the index the codepoint began in
    Utf8ErrorReason["OVERRUN"] = "string overrun";
    // A missing continuation byte was expected but not found
    // - offset = the index the continuation byte was expected at
    Utf8ErrorReason["MISSING_CONTINUE"] = "missing continuation byte";
    // The computed code point is outside the range for UTF-8
    // - offset       = start of this codepoint
    // - badCodepoint = the computed codepoint; outside the UTF-8 range
    Utf8ErrorReason["OUT_OF_RANGE"] = "out of UTF-8 range";
    // UTF-8 strings may not contain UTF-16 surrogate pairs
    // - offset       = start of this codepoint
    // - badCodepoint = the computed codepoint; inside the UTF-16 surrogate range
    Utf8ErrorReason["UTF16_SURROGATE"] = "UTF-16 surrogate";
    // The string is an overlong representation
    // - offset       = start of this codepoint
    // - badCodepoint = the computed codepoint; already bounds checked
    Utf8ErrorReason["OVERLONG"] = "overlong representation";
})(Utf8ErrorReason || (Utf8ErrorReason = {}));
function errorFunc(reason, offset, bytes, output, badCodepoint) {
    return logger$2.throwArgumentError(`invalid codepoint at offset ${offset}; ${reason}`, "bytes", bytes);
}
function ignoreFunc(reason, offset, bytes, output, badCodepoint) {
    // If there is an invalid prefix (including stray continuation), skip any additional continuation bytes
    if (reason === Utf8ErrorReason.BAD_PREFIX || reason === Utf8ErrorReason.UNEXPECTED_CONTINUE) {
        let i = 0;
        for (let o = offset + 1; o < bytes.length; o++) {
            if (bytes[o] >> 6 !== 0x02) {
                break;
            }
            i++;
        }
        return i;
    }
    // This byte runs us past the end of the string, so just jump to the end
    // (but the first byte was read already read and therefore skipped)
    if (reason === Utf8ErrorReason.OVERRUN) {
        return bytes.length - offset - 1;
    }
    // Nothing to skip
    return 0;
}
function replaceFunc(reason, offset, bytes, output, badCodepoint) {
    // Overlong representations are otherwise "valid" code points; just non-deistingtished
    if (reason === Utf8ErrorReason.OVERLONG) {
        output.push(badCodepoint);
        return 0;
    }
    // Put the replacement character into the output
    output.push(0xfffd);
    // Otherwise, process as if ignoring errors
    return ignoreFunc(reason, offset, bytes, output, badCodepoint);
}
// Common error handing strategies
const Utf8ErrorFuncs = Object.freeze({
    error: errorFunc,
    ignore: ignoreFunc,
    replace: replaceFunc
});
// http://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript#13691499
function getUtf8CodePoints(bytes, onError) {
    if (onError == null) {
        onError = Utf8ErrorFuncs.error;
    }
    bytes = arrayify(bytes);
    const result = [];
    let i = 0;
    // Invalid bytes are ignored
    while (i < bytes.length) {
        const c = bytes[i++];
        // 0xxx xxxx
        if (c >> 7 === 0) {
            result.push(c);
            continue;
        }
        // Multibyte; how many bytes left for this character?
        let extraLength = null;
        let overlongMask = null;
        // 110x xxxx 10xx xxxx
        if ((c & 0xe0) === 0xc0) {
            extraLength = 1;
            overlongMask = 0x7f;
            // 1110 xxxx 10xx xxxx 10xx xxxx
        }
        else if ((c & 0xf0) === 0xe0) {
            extraLength = 2;
            overlongMask = 0x7ff;
            // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
        }
        else if ((c & 0xf8) === 0xf0) {
            extraLength = 3;
            overlongMask = 0xffff;
        }
        else {
            if ((c & 0xc0) === 0x80) {
                i += onError(Utf8ErrorReason.UNEXPECTED_CONTINUE, i - 1, bytes, result);
            }
            else {
                i += onError(Utf8ErrorReason.BAD_PREFIX, i - 1, bytes, result);
            }
            continue;
        }
        // Do we have enough bytes in our data?
        if (i - 1 + extraLength >= bytes.length) {
            i += onError(Utf8ErrorReason.OVERRUN, i - 1, bytes, result);
            continue;
        }
        // Remove the length prefix from the char
        let res = c & ((1 << (8 - extraLength - 1)) - 1);
        for (let j = 0; j < extraLength; j++) {
            let nextChar = bytes[i];
            // Invalid continuation byte
            if ((nextChar & 0xc0) != 0x80) {
                i += onError(Utf8ErrorReason.MISSING_CONTINUE, i, bytes, result);
                res = null;
                break;
            }
            res = (res << 6) | (nextChar & 0x3f);
            i++;
        }
        // See above loop for invalid continuation byte
        if (res === null) {
            continue;
        }
        // Maximum code point
        if (res > 0x10ffff) {
            i += onError(Utf8ErrorReason.OUT_OF_RANGE, i - 1 - extraLength, bytes, result, res);
            continue;
        }
        // Reserved for UTF-16 surrogate halves
        if (res >= 0xd800 && res <= 0xdfff) {
            i += onError(Utf8ErrorReason.UTF16_SURROGATE, i - 1 - extraLength, bytes, result, res);
            continue;
        }
        // Check for overlong sequences (more bytes than needed)
        if (res <= overlongMask) {
            i += onError(Utf8ErrorReason.OVERLONG, i - 1 - extraLength, bytes, result, res);
            continue;
        }
        result.push(res);
    }
    return result;
}
// http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
function toUtf8Bytes(str, form = UnicodeNormalizationForm.current) {
    if (form != UnicodeNormalizationForm.current) {
        logger$2.checkNormalize();
        str = str.normalize(form);
    }
    let result = [];
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        if (c < 0x80) {
            result.push(c);
        }
        else if (c < 0x800) {
            result.push((c >> 6) | 0xc0);
            result.push((c & 0x3f) | 0x80);
        }
        else if ((c & 0xfc00) == 0xd800) {
            i++;
            const c2 = str.charCodeAt(i);
            if (i >= str.length || (c2 & 0xfc00) !== 0xdc00) {
                throw new Error("invalid utf-8 string");
            }
            // Surrogate Pair
            const pair = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
            result.push((pair >> 18) | 0xf0);
            result.push(((pair >> 12) & 0x3f) | 0x80);
            result.push(((pair >> 6) & 0x3f) | 0x80);
            result.push((pair & 0x3f) | 0x80);
        }
        else {
            result.push((c >> 12) | 0xe0);
            result.push(((c >> 6) & 0x3f) | 0x80);
            result.push((c & 0x3f) | 0x80);
        }
    }
    return arrayify(result);
}
function escapeChar(value) {
    const hex = ("0000" + value.toString(16));
    return "\\u" + hex.substring(hex.length - 4);
}
function _toEscapedUtf8String(bytes, onError) {
    return '"' + getUtf8CodePoints(bytes, onError).map((codePoint) => {
        if (codePoint < 256) {
            switch (codePoint) {
                case 8: return "\\b";
                case 9: return "\\t";
                case 10: return "\\n";
                case 13: return "\\r";
                case 34: return "\\\"";
                case 92: return "\\\\";
            }
            if (codePoint >= 32 && codePoint < 127) {
                return String.fromCharCode(codePoint);
            }
        }
        if (codePoint <= 0xffff) {
            return escapeChar(codePoint);
        }
        codePoint -= 0x10000;
        return escapeChar(((codePoint >> 10) & 0x3ff) + 0xd800) + escapeChar((codePoint & 0x3ff) + 0xdc00);
    }).join("") + '"';
}
function _toUtf8String(codePoints) {
    return codePoints.map((codePoint) => {
        if (codePoint <= 0xffff) {
            return String.fromCharCode(codePoint);
        }
        codePoint -= 0x10000;
        return String.fromCharCode((((codePoint >> 10) & 0x3ff) + 0xd800), ((codePoint & 0x3ff) + 0xdc00));
    }).join("");
}
function toUtf8String(bytes, onError) {
    return _toUtf8String(getUtf8CodePoints(bytes, onError));
}
function toUtf8CodePoints(str, form = UnicodeNormalizationForm.current) {
    return getUtf8CodePoints(toUtf8Bytes(str, form));
}

function bytes2(data) {
    if ((data.length % 4) !== 0) {
        throw new Error("bad data");
    }
    let result = [];
    for (let i = 0; i < data.length; i += 4) {
        result.push(parseInt(data.substring(i, i + 4), 16));
    }
    return result;
}
function createTable(data, func) {
    if (!func) {
        func = function (value) { return [parseInt(value, 16)]; };
    }
    let lo = 0;
    let result = {};
    data.split(",").forEach((pair) => {
        let comps = pair.split(":");
        lo += parseInt(comps[0], 16);
        result[lo] = func(comps[1]);
    });
    return result;
}
function createRangeTable(data) {
    let hi = 0;
    return data.split(",").map((v) => {
        let comps = v.split("-");
        if (comps.length === 1) {
            comps[1] = "0";
        }
        else if (comps[1] === "") {
            comps[1] = "1";
        }
        let lo = hi + parseInt(comps[0], 16);
        hi = parseInt(comps[1], 16);
        return { l: lo, h: hi };
    });
}
function matchMap(value, ranges) {
    let lo = 0;
    for (let i = 0; i < ranges.length; i++) {
        let range = ranges[i];
        lo += range.l;
        if (value >= lo && value <= lo + range.h && ((value - lo) % (range.d || 1)) === 0) {
            if (range.e && range.e.indexOf(value - lo) !== -1) {
                continue;
            }
            return range;
        }
    }
    return null;
}
const Table_A_1_ranges = createRangeTable("221,13-1b,5f-,40-10,51-f,11-3,3-3,2-2,2-4,8,2,15,2d,28-8,88,48,27-,3-5,11-20,27-,8,28,3-5,12,18,b-a,1c-4,6-16,2-d,2-2,2,1b-4,17-9,8f-,10,f,1f-2,1c-34,33-14e,4,36-,13-,6-2,1a-f,4,9-,3-,17,8,2-2,5-,2,8-,3-,4-8,2-3,3,6-,16-6,2-,7-3,3-,17,8,3,3,3-,2,6-3,3-,4-a,5,2-6,10-b,4,8,2,4,17,8,3,6-,b,4,4-,2-e,2-4,b-10,4,9-,3-,17,8,3-,5-,9-2,3-,4-7,3-3,3,4-3,c-10,3,7-2,4,5-2,3,2,3-2,3-2,4-2,9,4-3,6-2,4,5-8,2-e,d-d,4,9,4,18,b,6-3,8,4,5-6,3-8,3-3,b-11,3,9,4,18,b,6-3,8,4,5-6,3-6,2,3-3,b-11,3,9,4,18,11-3,7-,4,5-8,2-7,3-3,b-11,3,13-2,19,a,2-,8-2,2-3,7,2,9-11,4-b,3b-3,1e-24,3,2-,3,2-,2-5,5,8,4,2,2-,3,e,4-,6,2,7-,b-,3-21,49,23-5,1c-3,9,25,10-,2-2f,23,6,3,8-2,5-5,1b-45,27-9,2a-,2-3,5b-4,45-4,53-5,8,40,2,5-,8,2,5-,28,2,5-,20,2,5-,8,2,5-,8,8,18,20,2,5-,8,28,14-5,1d-22,56-b,277-8,1e-2,52-e,e,8-a,18-8,15-b,e,4,3-b,5e-2,b-15,10,b-5,59-7,2b-555,9d-3,5b-5,17-,7-,27-,7-,9,2,2,2,20-,36,10,f-,7,14-,4,a,54-3,2-6,6-5,9-,1c-10,13-1d,1c-14,3c-,10-6,32-b,240-30,28-18,c-14,a0,115-,3,66-,b-76,5,5-,1d,24,2,5-2,2,8-,35-2,19,f-10,1d-3,311-37f,1b,5a-b,d7-19,d-3,41,57-,68-4,29-3,5f,29-37,2e-2,25-c,2c-2,4e-3,30,78-3,64-,20,19b7-49,51a7-59,48e-2,38-738,2ba5-5b,222f-,3c-94,8-b,6-4,1b,6,2,3,3,6d-20,16e-f,41-,37-7,2e-2,11-f,5-b,18-,b,14,5-3,6,88-,2,bf-2,7-,7-,7-,4-2,8,8-9,8-2ff,20,5-b,1c-b4,27-,27-cbb1,f7-9,28-2,b5-221,56,48,3-,2-,3-,5,d,2,5,3,42,5-,9,8,1d,5,6,2-2,8,153-3,123-3,33-27fd,a6da-5128,21f-5df,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3,2-1d,61-ff7d");
// @TODO: Make this relative...
const Table_B_1_flags = "ad,34f,1806,180b,180c,180d,200b,200c,200d,2060,feff".split(",").map((v) => parseInt(v, 16));
const Table_B_2_ranges = [
    { h: 25, s: 32, l: 65 },
    { h: 30, s: 32, e: [23], l: 127 },
    { h: 54, s: 1, e: [48], l: 64, d: 2 },
    { h: 14, s: 1, l: 57, d: 2 },
    { h: 44, s: 1, l: 17, d: 2 },
    { h: 10, s: 1, e: [2, 6, 8], l: 61, d: 2 },
    { h: 16, s: 1, l: 68, d: 2 },
    { h: 84, s: 1, e: [18, 24, 66], l: 19, d: 2 },
    { h: 26, s: 32, e: [17], l: 435 },
    { h: 22, s: 1, l: 71, d: 2 },
    { h: 15, s: 80, l: 40 },
    { h: 31, s: 32, l: 16 },
    { h: 32, s: 1, l: 80, d: 2 },
    { h: 52, s: 1, l: 42, d: 2 },
    { h: 12, s: 1, l: 55, d: 2 },
    { h: 40, s: 1, e: [38], l: 15, d: 2 },
    { h: 14, s: 1, l: 48, d: 2 },
    { h: 37, s: 48, l: 49 },
    { h: 148, s: 1, l: 6351, d: 2 },
    { h: 88, s: 1, l: 160, d: 2 },
    { h: 15, s: 16, l: 704 },
    { h: 25, s: 26, l: 854 },
    { h: 25, s: 32, l: 55915 },
    { h: 37, s: 40, l: 1247 },
    { h: 25, s: -119711, l: 53248 },
    { h: 25, s: -119763, l: 52 },
    { h: 25, s: -119815, l: 52 },
    { h: 25, s: -119867, e: [1, 4, 5, 7, 8, 11, 12, 17], l: 52 },
    { h: 25, s: -119919, l: 52 },
    { h: 24, s: -119971, e: [2, 7, 8, 17], l: 52 },
    { h: 24, s: -120023, e: [2, 7, 13, 15, 16, 17], l: 52 },
    { h: 25, s: -120075, l: 52 },
    { h: 25, s: -120127, l: 52 },
    { h: 25, s: -120179, l: 52 },
    { h: 25, s: -120231, l: 52 },
    { h: 25, s: -120283, l: 52 },
    { h: 25, s: -120335, l: 52 },
    { h: 24, s: -119543, e: [17], l: 56 },
    { h: 24, s: -119601, e: [17], l: 58 },
    { h: 24, s: -119659, e: [17], l: 58 },
    { h: 24, s: -119717, e: [17], l: 58 },
    { h: 24, s: -119775, e: [17], l: 58 }
];
const Table_B_2_lut_abs = createTable("b5:3bc,c3:ff,7:73,2:253,5:254,3:256,1:257,5:259,1:25b,3:260,1:263,2:269,1:268,5:26f,1:272,2:275,7:280,3:283,5:288,3:28a,1:28b,5:292,3f:195,1:1bf,29:19e,125:3b9,8b:3b2,1:3b8,1:3c5,3:3c6,1:3c0,1a:3ba,1:3c1,1:3c3,2:3b8,1:3b5,1bc9:3b9,1c:1f76,1:1f77,f:1f7a,1:1f7b,d:1f78,1:1f79,1:1f7c,1:1f7d,107:63,5:25b,4:68,1:68,1:68,3:69,1:69,1:6c,3:6e,4:70,1:71,1:72,1:72,1:72,7:7a,2:3c9,2:7a,2:6b,1:e5,1:62,1:63,3:65,1:66,2:6d,b:3b3,1:3c0,6:64,1b574:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3");
const Table_B_2_lut_rel = createTable("179:1,2:1,2:1,5:1,2:1,a:4f,a:1,8:1,2:1,2:1,3:1,5:1,3:1,4:1,2:1,3:1,4:1,8:2,1:1,2:2,1:1,2:2,27:2,195:26,2:25,1:25,1:25,2:40,2:3f,1:3f,33:1,11:-6,1:-9,1ac7:-3a,6d:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,b:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,c:-8,2:-8,2:-8,2:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,49:-8,1:-8,1:-4a,1:-4a,d:-56,1:-56,1:-56,1:-56,d:-8,1:-8,f:-8,1:-8,3:-7");
const Table_B_2_complex = createTable("df:00730073,51:00690307,19:02BC006E,a7:006A030C,18a:002003B9,16:03B903080301,20:03C503080301,1d7:05650582,190f:00680331,1:00740308,1:0077030A,1:0079030A,1:006102BE,b6:03C50313,2:03C503130300,2:03C503130301,2:03C503130342,2a:1F0003B9,1:1F0103B9,1:1F0203B9,1:1F0303B9,1:1F0403B9,1:1F0503B9,1:1F0603B9,1:1F0703B9,1:1F0003B9,1:1F0103B9,1:1F0203B9,1:1F0303B9,1:1F0403B9,1:1F0503B9,1:1F0603B9,1:1F0703B9,1:1F2003B9,1:1F2103B9,1:1F2203B9,1:1F2303B9,1:1F2403B9,1:1F2503B9,1:1F2603B9,1:1F2703B9,1:1F2003B9,1:1F2103B9,1:1F2203B9,1:1F2303B9,1:1F2403B9,1:1F2503B9,1:1F2603B9,1:1F2703B9,1:1F6003B9,1:1F6103B9,1:1F6203B9,1:1F6303B9,1:1F6403B9,1:1F6503B9,1:1F6603B9,1:1F6703B9,1:1F6003B9,1:1F6103B9,1:1F6203B9,1:1F6303B9,1:1F6403B9,1:1F6503B9,1:1F6603B9,1:1F6703B9,3:1F7003B9,1:03B103B9,1:03AC03B9,2:03B10342,1:03B1034203B9,5:03B103B9,6:1F7403B9,1:03B703B9,1:03AE03B9,2:03B70342,1:03B7034203B9,5:03B703B9,6:03B903080300,1:03B903080301,3:03B90342,1:03B903080342,b:03C503080300,1:03C503080301,1:03C10313,2:03C50342,1:03C503080342,b:1F7C03B9,1:03C903B9,1:03CE03B9,2:03C90342,1:03C9034203B9,5:03C903B9,ac:00720073,5b:00B00063,6:00B00066,d:006E006F,a:0073006D,1:00740065006C,1:0074006D,124f:006800700061,2:00610075,2:006F0076,b:00700061,1:006E0061,1:03BC0061,1:006D0061,1:006B0061,1:006B0062,1:006D0062,1:00670062,3:00700066,1:006E0066,1:03BC0066,4:0068007A,1:006B0068007A,1:006D0068007A,1:00670068007A,1:00740068007A,15:00700061,1:006B00700061,1:006D00700061,1:006700700061,8:00700076,1:006E0076,1:03BC0076,1:006D0076,1:006B0076,1:006D0076,1:00700077,1:006E0077,1:03BC0077,1:006D0077,1:006B0077,1:006D0077,1:006B03C9,1:006D03C9,2:00620071,3:00632215006B0067,1:0063006F002E,1:00640062,1:00670079,2:00680070,2:006B006B,1:006B006D,9:00700068,2:00700070006D,1:00700072,2:00730076,1:00770062,c723:00660066,1:00660069,1:0066006C,1:006600660069,1:00660066006C,1:00730074,1:00730074,d:05740576,1:05740565,1:0574056B,1:057E0576,1:0574056D", bytes2);
const Table_C_ranges = createRangeTable("80-20,2a0-,39c,32,f71,18e,7f2-f,19-7,30-4,7-5,f81-b,5,a800-20ff,4d1-1f,110,fa-6,d174-7,2e84-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,2,1f-5f,ff7f-20001");
function flatten(values) {
    return values.reduce((accum, value) => {
        value.forEach((value) => { accum.push(value); });
        return accum;
    }, []);
}
function _nameprepTableA1(codepoint) {
    return !!matchMap(codepoint, Table_A_1_ranges);
}
function _nameprepTableB2(codepoint) {
    let range = matchMap(codepoint, Table_B_2_ranges);
    if (range) {
        return [codepoint + range.s];
    }
    let codes = Table_B_2_lut_abs[codepoint];
    if (codes) {
        return codes;
    }
    let shift = Table_B_2_lut_rel[codepoint];
    if (shift) {
        return [codepoint + shift[0]];
    }
    let complex = Table_B_2_complex[codepoint];
    if (complex) {
        return complex;
    }
    return null;
}
function _nameprepTableC(codepoint) {
    return !!matchMap(codepoint, Table_C_ranges);
}
function nameprep(value) {
    // This allows platforms with incomplete normalize to bypass
    // it for very basic names which the built-in toLowerCase
    // will certainly handle correctly
    if (value.match(/^[a-z0-9-]*$/i) && value.length <= 59) {
        return value.toLowerCase();
    }
    // Get the code points (keeping the current normalization)
    let codes = toUtf8CodePoints(value);
    codes = flatten(codes.map((code) => {
        // Substitute Table B.1 (Maps to Nothing)
        if (Table_B_1_flags.indexOf(code) >= 0) {
            return [];
        }
        if (code >= 0xfe00 && code <= 0xfe0f) {
            return [];
        }
        // Substitute Table B.2 (Case Folding)
        let codesTableB2 = _nameprepTableB2(code);
        if (codesTableB2) {
            return codesTableB2;
        }
        // No Substitution
        return [code];
    }));
    // Normalize using form KC
    codes = toUtf8CodePoints(_toUtf8String(codes), UnicodeNormalizationForm.NFKC);
    // Prohibit Tables C.1.2, C.2.2, C.3, C.4, C.5, C.6, C.7, C.8, C.9
    codes.forEach((code) => {
        if (_nameprepTableC(code)) {
            throw new Error("STRINGPREP_CONTAINS_PROHIBITED");
        }
    });
    // Prohibit Unassigned Code Points (Table A.1)
    codes.forEach((code) => {
        if (_nameprepTableA1(code)) {
            throw new Error("STRINGPREP_CONTAINS_UNASSIGNED");
        }
    });
    // IDNA extras
    let name = _toUtf8String(codes);
    // IDNA: 4.2.3.1
    if (name.substring(0, 1) === "-" || name.substring(2, 4) === "--" || name.substring(name.length - 1) === "-") {
        throw new Error("invalid hyphen");
    }
    // IDNA: 4.2.4
    if (name.length > 63) {
        throw new Error("too long");
    }
    return name;
}

var hash = {};

var utils$9 = {};

var minimalisticAssert = assert$5;

function assert$5(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

assert$5.equal = function assertEqual(l, r, msg) {
  if (l != r)
    throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
};

var inherits_browser = {exports: {}};

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  inherits_browser.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
} else {
  // old school shim for old browsers
  inherits_browser.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }
  };
}

var assert$4 = minimalisticAssert;
var inherits = inherits_browser.exports;

utils$9.inherits = inherits;

function isSurrogatePair(msg, i) {
  if ((msg.charCodeAt(i) & 0xFC00) !== 0xD800) {
    return false;
  }
  if (i < 0 || i + 1 >= msg.length) {
    return false;
  }
  return (msg.charCodeAt(i + 1) & 0xFC00) === 0xDC00;
}

function toArray(msg, enc) {
  if (Array.isArray(msg))
    return msg.slice();
  if (!msg)
    return [];
  var res = [];
  if (typeof msg === 'string') {
    if (!enc) {
      // Inspired by stringToUtf8ByteArray() in closure-library by Google
      // https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js#L117-L143
      // Apache License 2.0
      // https://github.com/google/closure-library/blob/master/LICENSE
      var p = 0;
      for (var i = 0; i < msg.length; i++) {
        var c = msg.charCodeAt(i);
        if (c < 128) {
          res[p++] = c;
        } else if (c < 2048) {
          res[p++] = (c >> 6) | 192;
          res[p++] = (c & 63) | 128;
        } else if (isSurrogatePair(msg, i)) {
          c = 0x10000 + ((c & 0x03FF) << 10) + (msg.charCodeAt(++i) & 0x03FF);
          res[p++] = (c >> 18) | 240;
          res[p++] = ((c >> 12) & 63) | 128;
          res[p++] = ((c >> 6) & 63) | 128;
          res[p++] = (c & 63) | 128;
        } else {
          res[p++] = (c >> 12) | 224;
          res[p++] = ((c >> 6) & 63) | 128;
          res[p++] = (c & 63) | 128;
        }
      }
    } else if (enc === 'hex') {
      msg = msg.replace(/[^a-z0-9]+/ig, '');
      if (msg.length % 2 !== 0)
        msg = '0' + msg;
      for (i = 0; i < msg.length; i += 2)
        res.push(parseInt(msg[i] + msg[i + 1], 16));
    }
  } else {
    for (i = 0; i < msg.length; i++)
      res[i] = msg[i] | 0;
  }
  return res;
}
utils$9.toArray = toArray;

function toHex$1(msg) {
  var res = '';
  for (var i = 0; i < msg.length; i++)
    res += zero2(msg[i].toString(16));
  return res;
}
utils$9.toHex = toHex$1;

function htonl(w) {
  var res = (w >>> 24) |
            ((w >>> 8) & 0xff00) |
            ((w << 8) & 0xff0000) |
            ((w & 0xff) << 24);
  return res >>> 0;
}
utils$9.htonl = htonl;

function toHex32(msg, endian) {
  var res = '';
  for (var i = 0; i < msg.length; i++) {
    var w = msg[i];
    if (endian === 'little')
      w = htonl(w);
    res += zero8(w.toString(16));
  }
  return res;
}
utils$9.toHex32 = toHex32;

function zero2(word) {
  if (word.length === 1)
    return '0' + word;
  else
    return word;
}
utils$9.zero2 = zero2;

function zero8(word) {
  if (word.length === 7)
    return '0' + word;
  else if (word.length === 6)
    return '00' + word;
  else if (word.length === 5)
    return '000' + word;
  else if (word.length === 4)
    return '0000' + word;
  else if (word.length === 3)
    return '00000' + word;
  else if (word.length === 2)
    return '000000' + word;
  else if (word.length === 1)
    return '0000000' + word;
  else
    return word;
}
utils$9.zero8 = zero8;

function join32(msg, start, end, endian) {
  var len = end - start;
  assert$4(len % 4 === 0);
  var res = new Array(len / 4);
  for (var i = 0, k = start; i < res.length; i++, k += 4) {
    var w;
    if (endian === 'big')
      w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
    else
      w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
    res[i] = w >>> 0;
  }
  return res;
}
utils$9.join32 = join32;

function split32(msg, endian) {
  var res = new Array(msg.length * 4);
  for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
    var m = msg[i];
    if (endian === 'big') {
      res[k] = m >>> 24;
      res[k + 1] = (m >>> 16) & 0xff;
      res[k + 2] = (m >>> 8) & 0xff;
      res[k + 3] = m & 0xff;
    } else {
      res[k + 3] = m >>> 24;
      res[k + 2] = (m >>> 16) & 0xff;
      res[k + 1] = (m >>> 8) & 0xff;
      res[k] = m & 0xff;
    }
  }
  return res;
}
utils$9.split32 = split32;

function rotr32$1(w, b) {
  return (w >>> b) | (w << (32 - b));
}
utils$9.rotr32 = rotr32$1;

function rotl32$2(w, b) {
  return (w << b) | (w >>> (32 - b));
}
utils$9.rotl32 = rotl32$2;

function sum32$3(a, b) {
  return (a + b) >>> 0;
}
utils$9.sum32 = sum32$3;

function sum32_3$1(a, b, c) {
  return (a + b + c) >>> 0;
}
utils$9.sum32_3 = sum32_3$1;

function sum32_4$2(a, b, c, d) {
  return (a + b + c + d) >>> 0;
}
utils$9.sum32_4 = sum32_4$2;

function sum32_5$2(a, b, c, d, e) {
  return (a + b + c + d + e) >>> 0;
}
utils$9.sum32_5 = sum32_5$2;

function sum64$1(buf, pos, ah, al) {
  var bh = buf[pos];
  var bl = buf[pos + 1];

  var lo = (al + bl) >>> 0;
  var hi = (lo < al ? 1 : 0) + ah + bh;
  buf[pos] = hi >>> 0;
  buf[pos + 1] = lo;
}
utils$9.sum64 = sum64$1;

function sum64_hi$1(ah, al, bh, bl) {
  var lo = (al + bl) >>> 0;
  var hi = (lo < al ? 1 : 0) + ah + bh;
  return hi >>> 0;
}
utils$9.sum64_hi = sum64_hi$1;

function sum64_lo$1(ah, al, bh, bl) {
  var lo = al + bl;
  return lo >>> 0;
}
utils$9.sum64_lo = sum64_lo$1;

function sum64_4_hi$1(ah, al, bh, bl, ch, cl, dh, dl) {
  var carry = 0;
  var lo = al;
  lo = (lo + bl) >>> 0;
  carry += lo < al ? 1 : 0;
  lo = (lo + cl) >>> 0;
  carry += lo < cl ? 1 : 0;
  lo = (lo + dl) >>> 0;
  carry += lo < dl ? 1 : 0;

  var hi = ah + bh + ch + dh + carry;
  return hi >>> 0;
}
utils$9.sum64_4_hi = sum64_4_hi$1;

function sum64_4_lo$1(ah, al, bh, bl, ch, cl, dh, dl) {
  var lo = al + bl + cl + dl;
  return lo >>> 0;
}
utils$9.sum64_4_lo = sum64_4_lo$1;

function sum64_5_hi$1(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
  var carry = 0;
  var lo = al;
  lo = (lo + bl) >>> 0;
  carry += lo < al ? 1 : 0;
  lo = (lo + cl) >>> 0;
  carry += lo < cl ? 1 : 0;
  lo = (lo + dl) >>> 0;
  carry += lo < dl ? 1 : 0;
  lo = (lo + el) >>> 0;
  carry += lo < el ? 1 : 0;

  var hi = ah + bh + ch + dh + eh + carry;
  return hi >>> 0;
}
utils$9.sum64_5_hi = sum64_5_hi$1;

function sum64_5_lo$1(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
  var lo = al + bl + cl + dl + el;

  return lo >>> 0;
}
utils$9.sum64_5_lo = sum64_5_lo$1;

function rotr64_hi$1(ah, al, num) {
  var r = (al << (32 - num)) | (ah >>> num);
  return r >>> 0;
}
utils$9.rotr64_hi = rotr64_hi$1;

function rotr64_lo$1(ah, al, num) {
  var r = (ah << (32 - num)) | (al >>> num);
  return r >>> 0;
}
utils$9.rotr64_lo = rotr64_lo$1;

function shr64_hi$1(ah, al, num) {
  return ah >>> num;
}
utils$9.shr64_hi = shr64_hi$1;

function shr64_lo$1(ah, al, num) {
  var r = (ah << (32 - num)) | (al >>> num);
  return r >>> 0;
}
utils$9.shr64_lo = shr64_lo$1;

var common$5 = {};

var utils$8 = utils$9;
var assert$3 = minimalisticAssert;

function BlockHash$4() {
  this.pending = null;
  this.pendingTotal = 0;
  this.blockSize = this.constructor.blockSize;
  this.outSize = this.constructor.outSize;
  this.hmacStrength = this.constructor.hmacStrength;
  this.padLength = this.constructor.padLength / 8;
  this.endian = 'big';

  this._delta8 = this.blockSize / 8;
  this._delta32 = this.blockSize / 32;
}
common$5.BlockHash = BlockHash$4;

BlockHash$4.prototype.update = function update(msg, enc) {
  // Convert message to array, pad it, and join into 32bit blocks
  msg = utils$8.toArray(msg, enc);
  if (!this.pending)
    this.pending = msg;
  else
    this.pending = this.pending.concat(msg);
  this.pendingTotal += msg.length;

  // Enough data, try updating
  if (this.pending.length >= this._delta8) {
    msg = this.pending;

    // Process pending data in blocks
    var r = msg.length % this._delta8;
    this.pending = msg.slice(msg.length - r, msg.length);
    if (this.pending.length === 0)
      this.pending = null;

    msg = utils$8.join32(msg, 0, msg.length - r, this.endian);
    for (var i = 0; i < msg.length; i += this._delta32)
      this._update(msg, i, i + this._delta32);
  }

  return this;
};

BlockHash$4.prototype.digest = function digest(enc) {
  this.update(this._pad());
  assert$3(this.pending === null);

  return this._digest(enc);
};

BlockHash$4.prototype._pad = function pad() {
  var len = this.pendingTotal;
  var bytes = this._delta8;
  var k = bytes - ((len + this.padLength) % bytes);
  var res = new Array(k + this.padLength);
  res[0] = 0x80;
  for (var i = 1; i < k; i++)
    res[i] = 0;

  // Append length
  len <<= 3;
  if (this.endian === 'big') {
    for (var t = 8; t < this.padLength; t++)
      res[i++] = 0;

    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = (len >>> 24) & 0xff;
    res[i++] = (len >>> 16) & 0xff;
    res[i++] = (len >>> 8) & 0xff;
    res[i++] = len & 0xff;
  } else {
    res[i++] = len & 0xff;
    res[i++] = (len >>> 8) & 0xff;
    res[i++] = (len >>> 16) & 0xff;
    res[i++] = (len >>> 24) & 0xff;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;

    for (t = 8; t < this.padLength; t++)
      res[i++] = 0;
  }

  return res;
};

var sha = {};

var common$4 = {};

var utils$7 = utils$9;
var rotr32 = utils$7.rotr32;

function ft_1$1(s, x, y, z) {
  if (s === 0)
    return ch32$1(x, y, z);
  if (s === 1 || s === 3)
    return p32(x, y, z);
  if (s === 2)
    return maj32$1(x, y, z);
}
common$4.ft_1 = ft_1$1;

function ch32$1(x, y, z) {
  return (x & y) ^ ((~x) & z);
}
common$4.ch32 = ch32$1;

function maj32$1(x, y, z) {
  return (x & y) ^ (x & z) ^ (y & z);
}
common$4.maj32 = maj32$1;

function p32(x, y, z) {
  return x ^ y ^ z;
}
common$4.p32 = p32;

function s0_256$1(x) {
  return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
}
common$4.s0_256 = s0_256$1;

function s1_256$1(x) {
  return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
}
common$4.s1_256 = s1_256$1;

function g0_256$1(x) {
  return rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
}
common$4.g0_256 = g0_256$1;

function g1_256$1(x) {
  return rotr32(x, 17) ^ rotr32(x, 19) ^ (x >>> 10);
}
common$4.g1_256 = g1_256$1;

var utils$6 = utils$9;
var common$3 = common$5;
var shaCommon$1 = common$4;

var rotl32$1 = utils$6.rotl32;
var sum32$2 = utils$6.sum32;
var sum32_5$1 = utils$6.sum32_5;
var ft_1 = shaCommon$1.ft_1;
var BlockHash$3 = common$3.BlockHash;

var sha1_K = [
  0x5A827999, 0x6ED9EBA1,
  0x8F1BBCDC, 0xCA62C1D6
];

function SHA1() {
  if (!(this instanceof SHA1))
    return new SHA1();

  BlockHash$3.call(this);
  this.h = [
    0x67452301, 0xefcdab89, 0x98badcfe,
    0x10325476, 0xc3d2e1f0 ];
  this.W = new Array(80);
}

utils$6.inherits(SHA1, BlockHash$3);
var _1 = SHA1;

SHA1.blockSize = 512;
SHA1.outSize = 160;
SHA1.hmacStrength = 80;
SHA1.padLength = 64;

SHA1.prototype._update = function _update(msg, start) {
  var W = this.W;

  for (var i = 0; i < 16; i++)
    W[i] = msg[start + i];

  for(; i < W.length; i++)
    W[i] = rotl32$1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

  var a = this.h[0];
  var b = this.h[1];
  var c = this.h[2];
  var d = this.h[3];
  var e = this.h[4];

  for (i = 0; i < W.length; i++) {
    var s = ~~(i / 20);
    var t = sum32_5$1(rotl32$1(a, 5), ft_1(s, b, c, d), e, W[i], sha1_K[s]);
    e = d;
    d = c;
    c = rotl32$1(b, 30);
    b = a;
    a = t;
  }

  this.h[0] = sum32$2(this.h[0], a);
  this.h[1] = sum32$2(this.h[1], b);
  this.h[2] = sum32$2(this.h[2], c);
  this.h[3] = sum32$2(this.h[3], d);
  this.h[4] = sum32$2(this.h[4], e);
};

SHA1.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$6.toHex32(this.h, 'big');
  else
    return utils$6.split32(this.h, 'big');
};

var utils$5 = utils$9;
var common$2 = common$5;
var shaCommon = common$4;
var assert$2 = minimalisticAssert;

var sum32$1 = utils$5.sum32;
var sum32_4$1 = utils$5.sum32_4;
var sum32_5 = utils$5.sum32_5;
var ch32 = shaCommon.ch32;
var maj32 = shaCommon.maj32;
var s0_256 = shaCommon.s0_256;
var s1_256 = shaCommon.s1_256;
var g0_256 = shaCommon.g0_256;
var g1_256 = shaCommon.g1_256;

var BlockHash$2 = common$2.BlockHash;

var sha256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function SHA256$1() {
  if (!(this instanceof SHA256$1))
    return new SHA256$1();

  BlockHash$2.call(this);
  this.h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  this.k = sha256_K;
  this.W = new Array(64);
}
utils$5.inherits(SHA256$1, BlockHash$2);
var _256 = SHA256$1;

SHA256$1.blockSize = 512;
SHA256$1.outSize = 256;
SHA256$1.hmacStrength = 192;
SHA256$1.padLength = 64;

SHA256$1.prototype._update = function _update(msg, start) {
  var W = this.W;

  for (var i = 0; i < 16; i++)
    W[i] = msg[start + i];
  for (; i < W.length; i++)
    W[i] = sum32_4$1(g1_256(W[i - 2]), W[i - 7], g0_256(W[i - 15]), W[i - 16]);

  var a = this.h[0];
  var b = this.h[1];
  var c = this.h[2];
  var d = this.h[3];
  var e = this.h[4];
  var f = this.h[5];
  var g = this.h[6];
  var h = this.h[7];

  assert$2(this.k.length === W.length);
  for (i = 0; i < W.length; i++) {
    var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i], W[i]);
    var T2 = sum32$1(s0_256(a), maj32(a, b, c));
    h = g;
    g = f;
    f = e;
    e = sum32$1(d, T1);
    d = c;
    c = b;
    b = a;
    a = sum32$1(T1, T2);
  }

  this.h[0] = sum32$1(this.h[0], a);
  this.h[1] = sum32$1(this.h[1], b);
  this.h[2] = sum32$1(this.h[2], c);
  this.h[3] = sum32$1(this.h[3], d);
  this.h[4] = sum32$1(this.h[4], e);
  this.h[5] = sum32$1(this.h[5], f);
  this.h[6] = sum32$1(this.h[6], g);
  this.h[7] = sum32$1(this.h[7], h);
};

SHA256$1.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$5.toHex32(this.h, 'big');
  else
    return utils$5.split32(this.h, 'big');
};

var utils$4 = utils$9;
var SHA256 = _256;

function SHA224() {
  if (!(this instanceof SHA224))
    return new SHA224();

  SHA256.call(this);
  this.h = [
    0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
    0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4 ];
}
utils$4.inherits(SHA224, SHA256);
var _224 = SHA224;

SHA224.blockSize = 512;
SHA224.outSize = 224;
SHA224.hmacStrength = 192;
SHA224.padLength = 64;

SHA224.prototype._digest = function digest(enc) {
  // Just truncate output
  if (enc === 'hex')
    return utils$4.toHex32(this.h.slice(0, 7), 'big');
  else
    return utils$4.split32(this.h.slice(0, 7), 'big');
};

var utils$3 = utils$9;
var common$1 = common$5;
var assert$1 = minimalisticAssert;

var rotr64_hi = utils$3.rotr64_hi;
var rotr64_lo = utils$3.rotr64_lo;
var shr64_hi = utils$3.shr64_hi;
var shr64_lo = utils$3.shr64_lo;
var sum64 = utils$3.sum64;
var sum64_hi = utils$3.sum64_hi;
var sum64_lo = utils$3.sum64_lo;
var sum64_4_hi = utils$3.sum64_4_hi;
var sum64_4_lo = utils$3.sum64_4_lo;
var sum64_5_hi = utils$3.sum64_5_hi;
var sum64_5_lo = utils$3.sum64_5_lo;

var BlockHash$1 = common$1.BlockHash;

var sha512_K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
];

function SHA512$1() {
  if (!(this instanceof SHA512$1))
    return new SHA512$1();

  BlockHash$1.call(this);
  this.h = [
    0x6a09e667, 0xf3bcc908,
    0xbb67ae85, 0x84caa73b,
    0x3c6ef372, 0xfe94f82b,
    0xa54ff53a, 0x5f1d36f1,
    0x510e527f, 0xade682d1,
    0x9b05688c, 0x2b3e6c1f,
    0x1f83d9ab, 0xfb41bd6b,
    0x5be0cd19, 0x137e2179 ];
  this.k = sha512_K;
  this.W = new Array(160);
}
utils$3.inherits(SHA512$1, BlockHash$1);
var _512 = SHA512$1;

SHA512$1.blockSize = 1024;
SHA512$1.outSize = 512;
SHA512$1.hmacStrength = 192;
SHA512$1.padLength = 128;

SHA512$1.prototype._prepareBlock = function _prepareBlock(msg, start) {
  var W = this.W;

  // 32 x 32bit words
  for (var i = 0; i < 32; i++)
    W[i] = msg[start + i];
  for (; i < W.length; i += 2) {
    var c0_hi = g1_512_hi(W[i - 4], W[i - 3]);  // i - 2
    var c0_lo = g1_512_lo(W[i - 4], W[i - 3]);
    var c1_hi = W[i - 14];  // i - 7
    var c1_lo = W[i - 13];
    var c2_hi = g0_512_hi(W[i - 30], W[i - 29]);  // i - 15
    var c2_lo = g0_512_lo(W[i - 30], W[i - 29]);
    var c3_hi = W[i - 32];  // i - 16
    var c3_lo = W[i - 31];

    W[i] = sum64_4_hi(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo);
    W[i + 1] = sum64_4_lo(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo);
  }
};

SHA512$1.prototype._update = function _update(msg, start) {
  this._prepareBlock(msg, start);

  var W = this.W;

  var ah = this.h[0];
  var al = this.h[1];
  var bh = this.h[2];
  var bl = this.h[3];
  var ch = this.h[4];
  var cl = this.h[5];
  var dh = this.h[6];
  var dl = this.h[7];
  var eh = this.h[8];
  var el = this.h[9];
  var fh = this.h[10];
  var fl = this.h[11];
  var gh = this.h[12];
  var gl = this.h[13];
  var hh = this.h[14];
  var hl = this.h[15];

  assert$1(this.k.length === W.length);
  for (var i = 0; i < W.length; i += 2) {
    var c0_hi = hh;
    var c0_lo = hl;
    var c1_hi = s1_512_hi(eh, el);
    var c1_lo = s1_512_lo(eh, el);
    var c2_hi = ch64_hi(eh, el, fh, fl, gh);
    var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
    var c3_hi = this.k[i];
    var c3_lo = this.k[i + 1];
    var c4_hi = W[i];
    var c4_lo = W[i + 1];

    var T1_hi = sum64_5_hi(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo,
      c4_hi, c4_lo);
    var T1_lo = sum64_5_lo(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo,
      c4_hi, c4_lo);

    c0_hi = s0_512_hi(ah, al);
    c0_lo = s0_512_lo(ah, al);
    c1_hi = maj64_hi(ah, al, bh, bl, ch);
    c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);

    var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo);
    var T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);

    hh = gh;
    hl = gl;

    gh = fh;
    gl = fl;

    fh = eh;
    fl = el;

    eh = sum64_hi(dh, dl, T1_hi, T1_lo);
    el = sum64_lo(dl, dl, T1_hi, T1_lo);

    dh = ch;
    dl = cl;

    ch = bh;
    cl = bl;

    bh = ah;
    bl = al;

    ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo);
    al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
  }

  sum64(this.h, 0, ah, al);
  sum64(this.h, 2, bh, bl);
  sum64(this.h, 4, ch, cl);
  sum64(this.h, 6, dh, dl);
  sum64(this.h, 8, eh, el);
  sum64(this.h, 10, fh, fl);
  sum64(this.h, 12, gh, gl);
  sum64(this.h, 14, hh, hl);
};

SHA512$1.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$3.toHex32(this.h, 'big');
  else
    return utils$3.split32(this.h, 'big');
};

function ch64_hi(xh, xl, yh, yl, zh) {
  var r = (xh & yh) ^ ((~xh) & zh);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function ch64_lo(xh, xl, yh, yl, zh, zl) {
  var r = (xl & yl) ^ ((~xl) & zl);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function maj64_hi(xh, xl, yh, yl, zh) {
  var r = (xh & yh) ^ (xh & zh) ^ (yh & zh);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function maj64_lo(xh, xl, yh, yl, zh, zl) {
  var r = (xl & yl) ^ (xl & zl) ^ (yl & zl);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s0_512_hi(xh, xl) {
  var c0_hi = rotr64_hi(xh, xl, 28);
  var c1_hi = rotr64_hi(xl, xh, 2);  // 34
  var c2_hi = rotr64_hi(xl, xh, 7);  // 39

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s0_512_lo(xh, xl) {
  var c0_lo = rotr64_lo(xh, xl, 28);
  var c1_lo = rotr64_lo(xl, xh, 2);  // 34
  var c2_lo = rotr64_lo(xl, xh, 7);  // 39

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s1_512_hi(xh, xl) {
  var c0_hi = rotr64_hi(xh, xl, 14);
  var c1_hi = rotr64_hi(xh, xl, 18);
  var c2_hi = rotr64_hi(xl, xh, 9);  // 41

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s1_512_lo(xh, xl) {
  var c0_lo = rotr64_lo(xh, xl, 14);
  var c1_lo = rotr64_lo(xh, xl, 18);
  var c2_lo = rotr64_lo(xl, xh, 9);  // 41

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g0_512_hi(xh, xl) {
  var c0_hi = rotr64_hi(xh, xl, 1);
  var c1_hi = rotr64_hi(xh, xl, 8);
  var c2_hi = shr64_hi(xh, xl, 7);

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g0_512_lo(xh, xl) {
  var c0_lo = rotr64_lo(xh, xl, 1);
  var c1_lo = rotr64_lo(xh, xl, 8);
  var c2_lo = shr64_lo(xh, xl, 7);

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g1_512_hi(xh, xl) {
  var c0_hi = rotr64_hi(xh, xl, 19);
  var c1_hi = rotr64_hi(xl, xh, 29);  // 61
  var c2_hi = shr64_hi(xh, xl, 6);

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g1_512_lo(xh, xl) {
  var c0_lo = rotr64_lo(xh, xl, 19);
  var c1_lo = rotr64_lo(xl, xh, 29);  // 61
  var c2_lo = shr64_lo(xh, xl, 6);

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

var utils$2 = utils$9;

var SHA512 = _512;

function SHA384() {
  if (!(this instanceof SHA384))
    return new SHA384();

  SHA512.call(this);
  this.h = [
    0xcbbb9d5d, 0xc1059ed8,
    0x629a292a, 0x367cd507,
    0x9159015a, 0x3070dd17,
    0x152fecd8, 0xf70e5939,
    0x67332667, 0xffc00b31,
    0x8eb44a87, 0x68581511,
    0xdb0c2e0d, 0x64f98fa7,
    0x47b5481d, 0xbefa4fa4 ];
}
utils$2.inherits(SHA384, SHA512);
var _384 = SHA384;

SHA384.blockSize = 1024;
SHA384.outSize = 384;
SHA384.hmacStrength = 192;
SHA384.padLength = 128;

SHA384.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$2.toHex32(this.h.slice(0, 12), 'big');
  else
    return utils$2.split32(this.h.slice(0, 12), 'big');
};

sha.sha1 = _1;
sha.sha224 = _224;
sha.sha256 = _256;
sha.sha384 = _384;
sha.sha512 = _512;

var ripemd = {};

var utils$1 = utils$9;
var common = common$5;

var rotl32 = utils$1.rotl32;
var sum32 = utils$1.sum32;
var sum32_3 = utils$1.sum32_3;
var sum32_4 = utils$1.sum32_4;
var BlockHash = common.BlockHash;

function RIPEMD160() {
  if (!(this instanceof RIPEMD160))
    return new RIPEMD160();

  BlockHash.call(this);

  this.h = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];
  this.endian = 'little';
}
utils$1.inherits(RIPEMD160, BlockHash);
ripemd.ripemd160 = RIPEMD160;

RIPEMD160.blockSize = 512;
RIPEMD160.outSize = 160;
RIPEMD160.hmacStrength = 192;
RIPEMD160.padLength = 64;

RIPEMD160.prototype._update = function update(msg, start) {
  var A = this.h[0];
  var B = this.h[1];
  var C = this.h[2];
  var D = this.h[3];
  var E = this.h[4];
  var Ah = A;
  var Bh = B;
  var Ch = C;
  var Dh = D;
  var Eh = E;
  for (var j = 0; j < 80; j++) {
    var T = sum32(
      rotl32(
        sum32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)),
        s[j]),
      E);
    A = E;
    E = D;
    D = rotl32(C, 10);
    C = B;
    B = T;
    T = sum32(
      rotl32(
        sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)),
        sh[j]),
      Eh);
    Ah = Eh;
    Eh = Dh;
    Dh = rotl32(Ch, 10);
    Ch = Bh;
    Bh = T;
  }
  T = sum32_3(this.h[1], C, Dh);
  this.h[1] = sum32_3(this.h[2], D, Eh);
  this.h[2] = sum32_3(this.h[3], E, Ah);
  this.h[3] = sum32_3(this.h[4], A, Bh);
  this.h[4] = sum32_3(this.h[0], B, Ch);
  this.h[0] = T;
};

RIPEMD160.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$1.toHex32(this.h, 'little');
  else
    return utils$1.split32(this.h, 'little');
};

function f(j, x, y, z) {
  if (j <= 15)
    return x ^ y ^ z;
  else if (j <= 31)
    return (x & y) | ((~x) & z);
  else if (j <= 47)
    return (x | (~y)) ^ z;
  else if (j <= 63)
    return (x & z) | (y & (~z));
  else
    return x ^ (y | (~z));
}

function K(j) {
  if (j <= 15)
    return 0x00000000;
  else if (j <= 31)
    return 0x5a827999;
  else if (j <= 47)
    return 0x6ed9eba1;
  else if (j <= 63)
    return 0x8f1bbcdc;
  else
    return 0xa953fd4e;
}

function Kh(j) {
  if (j <= 15)
    return 0x50a28be6;
  else if (j <= 31)
    return 0x5c4dd124;
  else if (j <= 47)
    return 0x6d703ef3;
  else if (j <= 63)
    return 0x7a6d76e9;
  else
    return 0x00000000;
}

var r = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
];

var rh = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
];

var s = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
];

var sh = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
];

var utils = utils$9;
var assert = minimalisticAssert;

function Hmac(hash, key, enc) {
  if (!(this instanceof Hmac))
    return new Hmac(hash, key, enc);
  this.Hash = hash;
  this.blockSize = hash.blockSize / 8;
  this.outSize = hash.outSize / 8;
  this.inner = null;
  this.outer = null;

  this._init(utils.toArray(key, enc));
}
var hmac = Hmac;

Hmac.prototype._init = function init(key) {
  // Shorten key, if needed
  if (key.length > this.blockSize)
    key = new this.Hash().update(key).digest();
  assert(key.length <= this.blockSize);

  // Add padding to key
  for (var i = key.length; i < this.blockSize; i++)
    key.push(0);

  for (i = 0; i < key.length; i++)
    key[i] ^= 0x36;
  this.inner = new this.Hash().update(key);

  // 0x36 ^ 0x5c = 0x6a
  for (i = 0; i < key.length; i++)
    key[i] ^= 0x6a;
  this.outer = new this.Hash().update(key);
};

Hmac.prototype.update = function update(msg, enc) {
  this.inner.update(msg, enc);
  return this;
};

Hmac.prototype.digest = function digest(enc) {
  this.outer.update(this.inner.digest());
  return this.outer.digest(enc);
};

(function (exports) {
	var hash = exports;

	hash.utils = utils$9;
	hash.common = common$5;
	hash.sha = sha;
	hash.ripemd = ripemd;
	hash.hmac = hmac;

	// Proxy hash functions to the main object
	hash.sha1 = hash.sha.sha1;
	hash.sha256 = hash.sha.sha256;
	hash.sha224 = hash.sha.sha224;
	hash.sha384 = hash.sha.sha384;
	hash.sha512 = hash.sha.sha512;
	hash.ripemd160 = hash.ripemd.ripemd160;
} (hash));

var SupportedAlgorithm;
(function (SupportedAlgorithm) {
    SupportedAlgorithm["sha256"] = "sha256";
    SupportedAlgorithm["sha512"] = "sha512";
})(SupportedAlgorithm || (SupportedAlgorithm = {}));

const version$1 = "sha2/5.6.1";

const logger$1 = new Logger(version$1);
function ripemd160(data) {
    return "0x" + (hash.ripemd160().update(arrayify(data)).digest("hex"));
}
function sha256$1(data) {
    return "0x" + (hash.sha256().update(arrayify(data)).digest("hex"));
}
function sha512(data) {
    return "0x" + (hash.sha512().update(arrayify(data)).digest("hex"));
}
function computeHmac(algorithm, key, data) {
    if (!SupportedAlgorithm[algorithm]) {
        logger$1.throwError("unsupported algorithm " + algorithm, Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "hmac",
            algorithm: algorithm
        });
    }
    return "0x" + hash.hmac(hash[algorithm], arrayify(key)).update(arrayify(data)).digest("hex");
}

const version = "solidity/5.6.1";

const regexBytes = new RegExp("^bytes([0-9]+)$");
const regexNumber = new RegExp("^(u?int)([0-9]*)$");
const regexArray = new RegExp("^(.*)\\[([0-9]*)\\]$");
const Zeros = "0000000000000000000000000000000000000000000000000000000000000000";
const logger = new Logger(version);
function _pack(type, value, isArray) {
    switch (type) {
        case "address":
            if (isArray) {
                return zeroPad(value, 32);
            }
            return arrayify(value);
        case "string":
            return toUtf8Bytes(value);
        case "bytes":
            return arrayify(value);
        case "bool":
            value = (value ? "0x01" : "0x00");
            if (isArray) {
                return zeroPad(value, 32);
            }
            return arrayify(value);
    }
    let match = type.match(regexNumber);
    if (match) {
        //let signed = (match[1] === "int")
        let size = parseInt(match[2] || "256");
        if ((match[2] && String(size) !== match[2]) || (size % 8 !== 0) || size === 0 || size > 256) {
            logger.throwArgumentError("invalid number type", "type", type);
        }
        if (isArray) {
            size = 256;
        }
        value = BigNumber.from(value).toTwos(size);
        return zeroPad(value, size / 8);
    }
    match = type.match(regexBytes);
    if (match) {
        const size = parseInt(match[1]);
        if (String(size) !== match[1] || size === 0 || size > 32) {
            logger.throwArgumentError("invalid bytes type", "type", type);
        }
        if (arrayify(value).byteLength !== size) {
            logger.throwArgumentError(`invalid value for ${type}`, "value", value);
        }
        if (isArray) {
            return arrayify((value + Zeros).substring(0, 66));
        }
        return value;
    }
    match = type.match(regexArray);
    if (match && Array.isArray(value)) {
        const baseType = match[1];
        const count = parseInt(match[2] || String(value.length));
        if (count != value.length) {
            logger.throwArgumentError(`invalid array length for ${type}`, "value", value);
        }
        const result = [];
        value.forEach(function (value) {
            result.push(_pack(baseType, value, true));
        });
        return concat(result);
    }
    return logger.throwArgumentError("invalid type", "type", type);
}
// @TODO: Array Enum
function pack(types, values) {
    if (types.length != values.length) {
        logger.throwArgumentError("wrong number of values; expected ${ types.length }", "values", values);
    }
    const tight = [];
    types.forEach(function (type, index) {
        tight.push(_pack(type, values[index]));
    });
    return hexlify(concat(tight));
}
function keccak256(types, values) {
    return keccak256$1(pack(types, values));
}
function sha256(types, values) {
    return sha256$1(pack(types, values));
}

var FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
var INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f';
var MINIMUM_LIQUIDITY = /*#__PURE__*/JSBI.BigInt(1000); // exports for internal consumption

var ZERO = /*#__PURE__*/JSBI.BigInt(0);
var ONE = /*#__PURE__*/JSBI.BigInt(1);
var FIVE = /*#__PURE__*/JSBI.BigInt(5);
var _997 = /*#__PURE__*/JSBI.BigInt(997);
var _1000 = /*#__PURE__*/JSBI.BigInt(1000);

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

// see https://stackoverflow.com/a/41102306
var CAN_SET_PROTOTYPE = ('setPrototypeOf' in Object);
/**
 * Indicates that the pair has insufficient reserves for a desired output amount. I.e. the amount of output cannot be
 * obtained by sending any amount of input.
 */

var InsufficientReservesError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(InsufficientReservesError, _Error);

  function InsufficientReservesError() {
    var _this;

    _this = _Error.call(this) || this;
    _this.isInsufficientReservesError = true;
    _this.name = _this.constructor.name;
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_assertThisInitialized(_this), (this instanceof InsufficientReservesError ? this.constructor : void 0).prototype);
    return _this;
  }

  return InsufficientReservesError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
/**
 * Indicates that the input amount is too small to produce any amount of output. I.e. the amount of input sent is less
 * than the price of a single unit of output after fees.
 */

var InsufficientInputAmountError = /*#__PURE__*/function (_Error2) {
  _inheritsLoose(InsufficientInputAmountError, _Error2);

  function InsufficientInputAmountError() {
    var _this2;

    _this2 = _Error2.call(this) || this;
    _this2.isInsufficientInputAmountError = true;
    _this2.name = _this2.constructor.name;
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_assertThisInitialized(_this2), (this instanceof InsufficientInputAmountError ? this.constructor : void 0).prototype);
    return _this2;
  }

  return InsufficientInputAmountError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var computePairAddress = function computePairAddress(_ref) {
  var factoryAddress = _ref.factoryAddress,
      tokenA = _ref.tokenA,
      tokenB = _ref.tokenB;

  var _ref2 = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA],
      token0 = _ref2[0],
      token1 = _ref2[1]; // does safety checks


  return getCreate2Address(factoryAddress, keccak256(['bytes'], [pack(['address', 'address'], [token0.address, token1.address])]), INIT_CODE_HASH);
};
var Pair = /*#__PURE__*/function () {
  function Pair(currencyAmountA, tokenAmountB) {
    var tokenAmounts = currencyAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
    ? [currencyAmountA, tokenAmountB] : [tokenAmountB, currencyAmountA];
    this.liquidityToken = new Token(tokenAmounts[0].currency.chainId, Pair.getAddress(tokenAmounts[0].currency, tokenAmounts[1].currency), 18, 'UNI-V2', 'Uniswap V2');
    this.tokenAmounts = tokenAmounts;
  }

  Pair.getAddress = function getAddress(tokenA, tokenB) {
    return computePairAddress({
      factoryAddress: FACTORY_ADDRESS,
      tokenA: tokenA,
      tokenB: tokenB
    });
  }
  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  ;

  var _proto = Pair.prototype;

  _proto.involvesToken = function involvesToken(token) {
    return token.equals(this.token0) || token.equals(this.token1);
  }
  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  ;

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  _proto.priceOf = function priceOf(token) {
    !this.involvesToken(token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }
  /**
   * Returns the chain ID of the tokens in the pair.
   */
  ;

  _proto.reserveOf = function reserveOf(token) {
    !this.involvesToken(token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  };

  _proto.getOutputAmount = function getOutputAmount(inputAmount) {
    !this.involvesToken(inputAmount.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;

    if (JSBI.equal(this.reserve0.quotient, ZERO) || JSBI.equal(this.reserve1.quotient, ZERO)) {
      throw new InsufficientReservesError();
    }

    var inputReserve = this.reserveOf(inputAmount.currency);
    var outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    var inputAmountWithFee = JSBI.multiply(inputAmount.quotient, _997);
    var numerator = JSBI.multiply(inputAmountWithFee, outputReserve.quotient);
    var denominator = JSBI.add(JSBI.multiply(inputReserve.quotient, _1000), inputAmountWithFee);
    var outputAmount = CurrencyAmount.fromRawAmount(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.divide(numerator, denominator));

    if (JSBI.equal(outputAmount.quotient, ZERO)) {
      throw new InsufficientInputAmountError();
    }

    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  };

  _proto.getInputAmount = function getInputAmount(outputAmount) {
    !this.involvesToken(outputAmount.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;

    if (JSBI.equal(this.reserve0.quotient, ZERO) || JSBI.equal(this.reserve1.quotient, ZERO) || JSBI.greaterThanOrEqual(outputAmount.quotient, this.reserveOf(outputAmount.currency).quotient)) {
      throw new InsufficientReservesError();
    }

    var outputReserve = this.reserveOf(outputAmount.currency);
    var inputReserve = this.reserveOf(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    var numerator = JSBI.multiply(JSBI.multiply(inputReserve.quotient, outputAmount.quotient), _1000);
    var denominator = JSBI.multiply(JSBI.subtract(outputReserve.quotient, outputAmount.quotient), _997);
    var inputAmount = CurrencyAmount.fromRawAmount(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.add(JSBI.divide(numerator, denominator), ONE));
    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  };

  _proto.getLiquidityMinted = function getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    !totalSupply.currency.equals(this.liquidityToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'LIQUIDITY') : invariant(false) : void 0;
    var tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
    ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    !(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    var liquidity;

    if (JSBI.equal(totalSupply.quotient, ZERO)) {
      liquidity = JSBI.subtract(sqrt(JSBI.multiply(tokenAmounts[0].quotient, tokenAmounts[1].quotient)), MINIMUM_LIQUIDITY);
    } else {
      var amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].quotient, totalSupply.quotient), this.reserve0.quotient);
      var amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].quotient, totalSupply.quotient), this.reserve1.quotient);
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
    }

    if (!JSBI.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError();
    }

    return CurrencyAmount.fromRawAmount(this.liquidityToken, liquidity);
  };

  _proto.getLiquidityValue = function getLiquidityValue(token, totalSupply, liquidity, feeOn, kLast) {
    if (feeOn === void 0) {
      feeOn = false;
    }

    !this.involvesToken(token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    !totalSupply.currency.equals(this.liquidityToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOTAL_SUPPLY') : invariant(false) : void 0;
    !liquidity.currency.equals(this.liquidityToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'LIQUIDITY') : invariant(false) : void 0;
    !JSBI.lessThanOrEqual(liquidity.quotient, totalSupply.quotient) ? process.env.NODE_ENV !== "production" ? invariant(false, 'LIQUIDITY') : invariant(false) : void 0;
    var totalSupplyAdjusted;

    if (!feeOn) {
      totalSupplyAdjusted = totalSupply;
    } else {
      !!!kLast ? process.env.NODE_ENV !== "production" ? invariant(false, 'K_LAST') : invariant(false) : void 0;
      var kLastParsed = JSBI.BigInt(kLast);

      if (!JSBI.equal(kLastParsed, ZERO)) {
        var rootK = sqrt(JSBI.multiply(this.reserve0.quotient, this.reserve1.quotient));
        var rootKLast = sqrt(kLastParsed);

        if (JSBI.greaterThan(rootK, rootKLast)) {
          var numerator = JSBI.multiply(totalSupply.quotient, JSBI.subtract(rootK, rootKLast));
          var denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast);
          var feeLiquidity = JSBI.divide(numerator, denominator);
          totalSupplyAdjusted = totalSupply.add(CurrencyAmount.fromRawAmount(this.liquidityToken, feeLiquidity));
        } else {
          totalSupplyAdjusted = totalSupply;
        }
      } else {
        totalSupplyAdjusted = totalSupply;
      }
    }

    return CurrencyAmount.fromRawAmount(token, JSBI.divide(JSBI.multiply(liquidity.quotient, this.reserveOf(token).quotient), totalSupplyAdjusted.quotient));
  };

  _createClass(Pair, [{
    key: "token0Price",
    get: function get() {
      var result = this.tokenAmounts[1].divide(this.tokenAmounts[0]);
      return new Price(this.token0, this.token1, result.denominator, result.numerator);
    }
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */

  }, {
    key: "token1Price",
    get: function get() {
      var result = this.tokenAmounts[0].divide(this.tokenAmounts[1]);
      return new Price(this.token1, this.token0, result.denominator, result.numerator);
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.token0.chainId;
    }
  }, {
    key: "token0",
    get: function get() {
      return this.tokenAmounts[0].currency;
    }
  }, {
    key: "token1",
    get: function get() {
      return this.tokenAmounts[1].currency;
    }
  }, {
    key: "reserve0",
    get: function get() {
      return this.tokenAmounts[0];
    }
  }, {
    key: "reserve1",
    get: function get() {
      return this.tokenAmounts[1];
    }
  }]);

  return Pair;
}();

var Route = /*#__PURE__*/function () {
  function Route(pairs, input, output) {
    this._midPrice = null;
    !(pairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PAIRS') : invariant(false) : void 0;
    var chainId = pairs[0].chainId;
    !pairs.every(function (pair) {
      return pair.chainId === chainId;
    }) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_IDS') : invariant(false) : void 0;
    var wrappedInput = input.wrapped;
    !pairs[0].involvesToken(wrappedInput) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INPUT') : invariant(false) : void 0;
    !(typeof output === 'undefined' || pairs[pairs.length - 1].involvesToken(output.wrapped)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'OUTPUT') : invariant(false) : void 0;
    var path = [wrappedInput];

    for (var _iterator = _createForOfIteratorHelperLoose(pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
          i = _step$value[0],
          pair = _step$value[1];
      var currentInput = path[i];
      !(currentInput.equals(pair.token0) || currentInput.equals(pair.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PATH') : invariant(false) : void 0;

      var _output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;

      path.push(_output);
    }

    this.pairs = pairs;
    this.path = path;
    this.input = input;
    this.output = output;
  }

  _createClass(Route, [{
    key: "midPrice",
    get: function get() {
      if (this._midPrice !== null) return this._midPrice;
      var prices = [];

      for (var _iterator2 = _createForOfIteratorHelperLoose(this.pairs.entries()), _step2; !(_step2 = _iterator2()).done;) {
        var _step2$value = _step2.value,
            i = _step2$value[0],
            pair = _step2$value[1];
        prices.push(this.path[i].equals(pair.token0) ? new Price(pair.reserve0.currency, pair.reserve1.currency, pair.reserve0.quotient, pair.reserve1.quotient) : new Price(pair.reserve1.currency, pair.reserve0.currency, pair.reserve1.quotient, pair.reserve0.quotient));
      }

      var reduced = prices.slice(1).reduce(function (accumulator, currentValue) {
        return accumulator.multiply(currentValue);
      }, prices[0]);
      return this._midPrice = new Price(this.input, this.output, reduced.denominator, reduced.numerator);
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.pairs[0].chainId;
    }
  }]);

  return Route;
}();

// in increasing order. i.e. the best trades have the most outputs for the least inputs and are sorted first

function inputOutputComparator(a, b) {
  // must have same input and output token for comparison
  !a.inputAmount.currency.equals(b.inputAmount.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INPUT_CURRENCY') : invariant(false) : void 0;
  !a.outputAmount.currency.equals(b.outputAmount.currency) ? process.env.NODE_ENV !== "production" ? invariant(false, 'OUTPUT_CURRENCY') : invariant(false) : void 0;

  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0;
    } // trade A requires less input than trade B, so A should come first


    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1;
    } else {
      return 1;
    }
  } else {
    // tradeA has less output than trade B, so should come second
    if (a.outputAmount.lessThan(b.outputAmount)) {
      return 1;
    } else {
      return -1;
    }
  }
} // extension of the input output comparator that also considers other dimensions of the trade in ranking them

function tradeComparator(a, b) {
  var ioComp = inputOutputComparator(a, b);

  if (ioComp !== 0) {
    return ioComp;
  } // consider lowest slippage next, since these are less likely to fail


  if (a.priceImpact.lessThan(b.priceImpact)) {
    return -1;
  } else if (a.priceImpact.greaterThan(b.priceImpact)) {
    return 1;
  } // finally consider the number of hops since each hop costs gas


  return a.route.path.length - b.route.path.length;
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */

var Trade = /*#__PURE__*/function () {
  function Trade(route, amount, tradeType) {
    this.route = route;
    this.tradeType = tradeType;
    var tokenAmounts = new Array(route.path.length);

    if (tradeType === TradeType.EXACT_INPUT) {
      !amount.currency.equals(route.input) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INPUT') : invariant(false) : void 0;
      tokenAmounts[0] = amount.wrapped;

      for (var i = 0; i < route.path.length - 1; i++) {
        var pair = route.pairs[i];

        var _pair$getOutputAmount = pair.getOutputAmount(tokenAmounts[i]),
            outputAmount = _pair$getOutputAmount[0];

        tokenAmounts[i + 1] = outputAmount;
      }

      this.inputAmount = CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
      this.outputAmount = CurrencyAmount.fromFractionalAmount(route.output, tokenAmounts[tokenAmounts.length - 1].numerator, tokenAmounts[tokenAmounts.length - 1].denominator);
    } else {
      !amount.currency.equals(route.output) ? process.env.NODE_ENV !== "production" ? invariant(false, 'OUTPUT') : invariant(false) : void 0;
      tokenAmounts[tokenAmounts.length - 1] = amount.wrapped;

      for (var _i = route.path.length - 1; _i > 0; _i--) {
        var _pair = route.pairs[_i - 1];

        var _pair$getInputAmount = _pair.getInputAmount(tokenAmounts[_i]),
            inputAmount = _pair$getInputAmount[0];

        tokenAmounts[_i - 1] = inputAmount;
      }

      this.inputAmount = CurrencyAmount.fromFractionalAmount(route.input, tokenAmounts[0].numerator, tokenAmounts[0].denominator);
      this.outputAmount = CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
    }

    this.executionPrice = new Price(this.inputAmount.currency, this.outputAmount.currency, this.inputAmount.quotient, this.outputAmount.quotient);
    this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount);
  }
  /**
   * Constructs an exact in trade with the given amount in and route
   * @param route route of the exact in trade
   * @param amountIn the amount being passed in
   */


  Trade.exactIn = function exactIn(route, amountIn) {
    return new Trade(route, amountIn, TradeType.EXACT_INPUT);
  }
  /**
   * Constructs an exact out trade with the given amount out and route
   * @param route route of the exact out trade
   * @param amountOut the amount returned by the trade
   */
  ;

  Trade.exactOut = function exactOut(route, amountOut) {
    return new Trade(route, amountOut, TradeType.EXACT_OUTPUT);
  }
  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  ;

  var _proto = Trade.prototype;

  _proto.minimumAmountOut = function minimumAmountOut(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ? process.env.NODE_ENV !== "production" ? invariant(false, 'SLIPPAGE_TOLERANCE') : invariant(false) : void 0;

    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount;
    } else {
      var slippageAdjustedAmountOut = new Fraction(ONE).add(slippageTolerance).invert().multiply(this.outputAmount.quotient).quotient;
      return CurrencyAmount.fromRawAmount(this.outputAmount.currency, slippageAdjustedAmountOut);
    }
  }
  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  ;

  _proto.maximumAmountIn = function maximumAmountIn(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ? process.env.NODE_ENV !== "production" ? invariant(false, 'SLIPPAGE_TOLERANCE') : invariant(false) : void 0;

    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount;
    } else {
      var slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.quotient).quotient;
      return CurrencyAmount.fromRawAmount(this.inputAmount.currency, slippageAdjustedAmountIn);
    }
  }
  /**
   * Given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
   * amount to an output token, making at most `maxHops` hops.
   * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
   * the amount in among multiple routes.
   * @param pairs the pairs to consider in finding the best trade
   * @param nextAmountIn exact amount of input currency to spend
   * @param currencyOut the desired currency out
   * @param maxNumResults maximum number of results to return
   * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
   * @param currentPairs used in recursion; the current list of pairs
   * @param currencyAmountIn used in recursion; the original value of the currencyAmountIn parameter
   * @param bestTrades used in recursion; the current list of best trades
   */
  ;

  Trade.bestTradeExactIn = function bestTradeExactIn(pairs, currencyAmountIn, currencyOut, _temp, // used in recursion.
  currentPairs, nextAmountIn, bestTrades) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$maxNumResults = _ref.maxNumResults,
        maxNumResults = _ref$maxNumResults === void 0 ? 3 : _ref$maxNumResults,
        _ref$maxHops = _ref.maxHops,
        maxHops = _ref$maxHops === void 0 ? 3 : _ref$maxHops;

    if (currentPairs === void 0) {
      currentPairs = [];
    }

    if (nextAmountIn === void 0) {
      nextAmountIn = currencyAmountIn;
    }

    if (bestTrades === void 0) {
      bestTrades = [];
    }

    !(pairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PAIRS') : invariant(false) : void 0;
    !(maxHops > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MAX_HOPS') : invariant(false) : void 0;
    !(currencyAmountIn === nextAmountIn || currentPairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_RECURSION') : invariant(false) : void 0;
    var amountIn = nextAmountIn.wrapped;
    var tokenOut = currencyOut.wrapped;

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i]; // pair irrelevant

      if (!pair.token0.equals(amountIn.currency) && !pair.token1.equals(amountIn.currency)) continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue;
      var amountOut = void 0;

      try {
        ;

        var _pair$getOutputAmount2 = pair.getOutputAmount(amountIn);

        amountOut = _pair$getOutputAmount2[0];
      } catch (error) {
        // input too low
        if (error.isInsufficientInputAmountError) {
          continue;
        }

        throw error;
      } // we have arrived at the output token, so this is the final trade of one of the paths


      if (amountOut.currency.equals(tokenOut)) {
        sortedInsert(bestTrades, new Trade(new Route([].concat(currentPairs, [pair]), currencyAmountIn.currency, currencyOut), currencyAmountIn, TradeType.EXACT_INPUT), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length)); // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops

        Trade.bestTradeExactIn(pairsExcludingThisPair, currencyAmountIn, currencyOut, {
          maxNumResults: maxNumResults,
          maxHops: maxHops - 1
        }, [].concat(currentPairs, [pair]), amountOut, bestTrades);
      }
    }

    return bestTrades;
  }
  /**
   * Return the execution price after accounting for slippage tolerance
   * @param slippageTolerance the allowed tolerated slippage
   */
  ;

  _proto.worstExecutionPrice = function worstExecutionPrice(slippageTolerance) {
    return new Price(this.inputAmount.currency, this.outputAmount.currency, this.maximumAmountIn(slippageTolerance).quotient, this.minimumAmountOut(slippageTolerance).quotient);
  }
  /**
   * similar to the above method but instead targets a fixed output amount
   * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
   * to an output token amount, making at most `maxHops` hops
   * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
   * the amount in among multiple routes.
   * @param pairs the pairs to consider in finding the best trade
   * @param currencyIn the currency to spend
   * @param nextAmountOut the exact amount of currency out
   * @param maxNumResults maximum number of results to return
   * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
   * @param currentPairs used in recursion; the current list of pairs
   * @param currencyAmountOut used in recursion; the original value of the currencyAmountOut parameter
   * @param bestTrades used in recursion; the current list of best trades
   */
  ;

  Trade.bestTradeExactOut = function bestTradeExactOut(pairs, currencyIn, currencyAmountOut, _temp2, // used in recursion.
  currentPairs, nextAmountOut, bestTrades) {
    var _ref2 = _temp2 === void 0 ? {} : _temp2,
        _ref2$maxNumResults = _ref2.maxNumResults,
        maxNumResults = _ref2$maxNumResults === void 0 ? 3 : _ref2$maxNumResults,
        _ref2$maxHops = _ref2.maxHops,
        maxHops = _ref2$maxHops === void 0 ? 3 : _ref2$maxHops;

    if (currentPairs === void 0) {
      currentPairs = [];
    }

    if (nextAmountOut === void 0) {
      nextAmountOut = currencyAmountOut;
    }

    if (bestTrades === void 0) {
      bestTrades = [];
    }

    !(pairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PAIRS') : invariant(false) : void 0;
    !(maxHops > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MAX_HOPS') : invariant(false) : void 0;
    !(currencyAmountOut === nextAmountOut || currentPairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_RECURSION') : invariant(false) : void 0;
    var amountOut = nextAmountOut.wrapped;
    var tokenIn = currencyIn.wrapped;

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i]; // pair irrelevant

      if (!pair.token0.equals(amountOut.currency) && !pair.token1.equals(amountOut.currency)) continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue;
      var amountIn = void 0;

      try {
        ;

        var _pair$getInputAmount2 = pair.getInputAmount(amountOut);

        amountIn = _pair$getInputAmount2[0];
      } catch (error) {
        // not enough liquidity in this pair
        if (error.isInsufficientReservesError) {
          continue;
        }

        throw error;
      } // we have arrived at the input token, so this is the first trade of one of the paths


      if (amountIn.currency.equals(tokenIn)) {
        sortedInsert(bestTrades, new Trade(new Route([pair].concat(currentPairs), currencyIn, currencyAmountOut.currency), currencyAmountOut, TradeType.EXACT_OUTPUT), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length)); // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops

        Trade.bestTradeExactOut(pairsExcludingThisPair, currencyIn, currencyAmountOut, {
          maxNumResults: maxNumResults,
          maxHops: maxHops - 1
        }, [pair].concat(currentPairs), amountIn, bestTrades);
      }
    }

    return bestTrades;
  };

  return Trade;
}();

function toHex(currencyAmount) {
  return "0x" + currencyAmount.quotient.toString(16);
}

var ZERO_HEX = '0x0';
/**
 * Represents the Uniswap V2 Router, and has static methods for helping execute trades.
 */

var Router = /*#__PURE__*/function () {
  /**
   * Cannot be constructed.
   */
  function Router() {}
  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */


  Router.swapCallParameters = function swapCallParameters(trade, options) {
    var etherIn = trade.inputAmount.currency.isNative;
    var etherOut = trade.outputAmount.currency.isNative; // the router does not support both ether in and out

    !!(etherIn && etherOut) ? process.env.NODE_ENV !== "production" ? invariant(false, 'ETHER_IN_OUT') : invariant(false) : void 0;
    !(!('ttl' in options) || options.ttl > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TTL') : invariant(false) : void 0;
    var to = validateAndParseAddress(options.recipient);
    var amountIn = toHex(trade.maximumAmountIn(options.allowedSlippage));
    var amountOut = toHex(trade.minimumAmountOut(options.allowedSlippage));
    var path = trade.route.path.map(function (token) {
      return token.address;
    });
    var deadline = 'ttl' in options ? "0x" + (Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16) : "0x" + options.deadline.toString(16);
    var useFeeOnTransfer = Boolean(options.feeOnTransfer);
    var methodName;
    var args;
    var value;

    switch (trade.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = useFeeOnTransfer ? 'swapExactETHForTokensSupportingFeeOnTransferTokens' : 'swapExactETHForTokens'; // (uint amountOutMin, address[] calldata path, address to, uint deadline)

          args = [amountOut, path, to, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = useFeeOnTransfer ? 'swapExactTokensForETHSupportingFeeOnTransferTokens' : 'swapExactTokensForETH'; // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)

          args = [amountIn, amountOut, path, to, deadline];
          value = ZERO_HEX;
        } else {
          methodName = useFeeOnTransfer ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens' : 'swapExactTokensForTokens'; // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)

          args = [amountIn, amountOut, path, to, deadline];
          value = ZERO_HEX;
        }

        break;

      case TradeType.EXACT_OUTPUT:
        !!useFeeOnTransfer ? process.env.NODE_ENV !== "production" ? invariant(false, 'EXACT_OUT_FOT') : invariant(false) : void 0;

        if (etherIn) {
          methodName = 'swapETHForExactTokens'; // (uint amountOut, address[] calldata path, address to, uint deadline)

          args = [amountOut, path, to, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH'; // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)

          args = [amountOut, amountIn, path, to, deadline];
          value = ZERO_HEX;
        } else {
          methodName = 'swapTokensForExactTokens'; // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)

          args = [amountOut, amountIn, path, to, deadline];
          value = ZERO_HEX;
        }

        break;
    }

    return {
      methodName: methodName,
      args: args,
      value: value
    };
  };

  return Router;
}();

var olddao={Reserve:"0x7a2088a1bFc9d81c55368AE168C2C02570cB814F",GoodDollar:"0x32467b43BFa67273FC7dDda0999Ee9A12F2AaA08",Identity:"0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",Avatar:"0x8aCd85898458400f7Db866d53FCFF6f0D49741FF",Controller:"0xe082b26cEf079a095147F35c9647eC97c2401B83",AbsoluteVote:"0x0E801D84Fa97b50751Dbf25036d067dCf18858bF",SchemeRegistrar:"0x9d4454B023096f34B160D6B654540c56A1F81688",UpgradeScheme:"0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf",DAI:"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",cDAI:"0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",COMP:"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",Contribution:"0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",DAIStaking:"0x67d269191c92Caf3cD7723F116c85e6E9bf55933",MarketMaker:"0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",UBIScheme:"0x95401dc811bb5740090279Ba06cfA8fcF6113778",FirstClaimPool:"0xf5059a5D33d5853360D16C683c16e67980206f36",network:"develop",networkId:4447,Bridge:"0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",BancorFormula:"0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"};var develop={NameService:"0x2a810409872AfC346F9B5b26571Fd6eC42EA4849",GReputation:"0xb9bEECD1A582768711dE1EE7B0A1d582D9d72a6C",CompoundVotingMachine:"0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8",ClaimersDistribution:"0x40918Ba7f132E0aCba2CE4de4c4baF9BD2D7D849",GovernanceStaking:"0xF32D39ff9f6Aa7a7A64d7a4F00a54826Ef791a55",UBIScheme:"0xd6e1afe5cA8D00A2EFC01B89997abE2De47fdfAf",ProtocolUpgradeFuse:"0x99dBE4AEa58E518C50a1c04aE9b48C9F6354612f",network:"develop",networkId:4447,HomeBridge:"0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7",AdminWallet:"0x07882Ae1ecB7429a84f1D53048d35c4bB2056877",Identity:"0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB",GoodDollar:"0xA5B0631c5B393d4BF30D2974dF121ea7E8b0e934",Controller:"0xb3da2F710C7356E4F6540752488e88e48Fd00Cdd",Avatar:"0x625A692E96605c988192cd59563e5EB2f1E33C87",FirstClaimPool:"0x5067457698Fd6Fa1C6964e416b3f42713513B3dD",BancorFormula:"0x36b58F5C1969B7b6591D752ea6F5486D069010AB",DAI:"0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43",cDAI:"0x51A1ceB83B83F1985a81C295d1fF28Afef186E02",COMP:"0xDC11f7E700A4c898AE5CAddB1082cFfa76512aDD"};var fuse={NameService:"0x27E3B64C671a25c191535743d63Bd06CB9B93E37",GReputation:"0xdFF4cE07253b2c3fa9dCEC8B918f91d150AC26a4",FirstClaimPool:"0x5E8732889f2d84c3D834223c38361B38D7D4B9bc",CompoundVotingMachine:"0xb9978C071f2F64016A2f8515BC03bd25684201aF",ClaimersDistribution:"0xEaDa76013C87C22843b907Ce0110ea55C8E7E2a0",GovernanceStaking:"0xe3E75Ee6895F8b30d8eC3260dAa20ec1aba6DA77",UBIScheme:"0x3bdeB796950301FfC9568fAF89B7370f8B217321",ProtocolUpgradeFuse:"0x4dB8602482576321F829baa593150393f7595439",Identity:"0x7ccF1011610138b484fCc921858e7971342d213c",GoodDollar:"0x79BeecC4b165Ccf547662cB4f7C0e83b3796E5b3",Controller:"0xb453024495525908E6cC1e3C115f4B6B30cc56b9",Avatar:"0x71ddE7b8362724bd65D88Fe29d42636a9F8f9064",HomeBridge:"0x2a84f4E41c1f0E245A7278e32150Ecf1a179b7B2",FuseFaucet:"0x09Ad3430D146aa662eA8c20cBEBceBC0bbB3FB0a",Invites:"0x187fc9fB37DF0fbf75149913a97B17c968Fc90d0",OneTimePayments:"0x184C1F83b3eB75a2dac483D4a6b9FBD59Df961f8",AdminWallet:"0x14204288286823042263156146334B1a4d61227c",network:"fuse",networkId:122,ProxyFactory:"0x4136dfD47F47792fC820E2354e9F0ce8e9c586A6",BancorFormula:"0x88e111b2A42457655A34896E5B929a75E7B82F88",DAI:"0x0000000000000000000000000000000000000000",cDAI:"0x0000000000000000000000000000000000000000",COMP:"0x0000000000000000000000000000000000000000"};var dapptest={NameService:"0x9059f66843F564f7870f7135fB039EB2034a23a3",GReputation:"0x90dE2F86DBdB2110a798326e880c83bc8779d149",CompoundVotingMachine:"0x2EF9f88EEB737655FF01F9b5017f1e3399726AF1",ClaimersDistribution:"0x035A59F228e776Cc396a8F5E1cEF989E235B0035",GovernanceStaking:"0xC65cCB966873969179B6b0bA53D67D14Bbf1204C",UBIScheme:"0xBb02F06762FBc51aD222915e6855f7482a93F9Cd",ProtocolUpgradeFuse:"0xBb976201B607f16dc76586dB8Ca5EF6C50C41c22",HomeBridge:"0x180FAF09AdD6a27554b11a131DCe6f6A3ddF4cBf",AdminWallet:"0xB8357F7f41125d4b24AD052c1b7288BeF5C43446",Identity:"0x63766F0efAa46a86E9055bB46e41ff7bc64CBEA2",GoodDollar:"0x94a9D2532DA2d9153336159907604A01c3E91C11",Controller:"0x0B57Fd12F7A95c322aD176D23765507ce09892Cb",Avatar:"0xf6Ee31185AC05C2b558fF2a561C600AF3E9486dd",FirstClaimPool:"0xC20654dB7F9483f10c91dc94924dC8F04F79bfd5",BancorFormula:"0x6852Adb5Fce1D73c08A9b3Aa7edE9A03437ac2fE",DAI:"0x0000000000000000000000000000000000000000",cDAI:"0x0000000000000000000000000000000000000000",COMP:"0x0000000000000000000000000000000000000000",networkId:4447,network:"dapptest",FeeFormula:"0x24ef01de6baE76eE73Da210940A296F739d87952",OneTimePayments:"0xB10982193B39Eda3428d6AaeBbd7986f2A2Baa1a",Invites:"0x74156A1F9736307b7AD34e3691f3A5B54A0B3Eb8",FuseFaucet:"0x0Db32f0b116773fDD78C2e1b5E6609CC502e6784",ProxyFactory:"0xCD8a1C3ba11CF5ECfa6267617243239504a98d90"};var staging={FuseFaucet:"0x70f361EDB97B245E8A68573637A31886A427fe2a",ProxyAdmin:"0x2Ea4aAA8351CfE63B537E81Cd4a13c435B945C1D",Invites:"0x763b49F901DC894F2dEc1c7d19e46250B4452679",ProxyAdmin2:"0x23D8492444DA663fcb2bDa8cA9A0e84989D1f59e",GoodDollar:"0xe39236a9Cf13f65DB8adD06BD4b834C65c523d2b",NameService:"0xE63402A7dc11AB4D03c477cc92209463a55A5134",GReputation:"0x80312bad9dd71d3a159e794B7fb1B2386F82F07F",CompoundVotingMachine:"0xcF624DfdA707De7C7a5669A472F81dAc130264c3",ClaimersDistribution:"0x86d43F93eD9AD1182981C19567f83BAc1DC1513B",GovernanceStaking:"0x18525875Bd0259d3efE1c04927A027fAd8cA0b86",UBIScheme:"0x54469071Ca82B46A2C01C09D38ca6Ca4347EB21d",ProtocolUpgradeFuse:"0x1495D6f5434376981778F64c63d2E15dA25B0541",Identity:"0x0af5eF8cdCeddDD9033cEf1E83B0Ae54f3a793A5",Avatar:"0x28523b680d4ffBd6e4FC95c3c12F5485F9635E00",Controller:"0xb6808120fB648c0bdc483Ec423d933a7eBf6BB0a",AbsoluteVote:"0x7b58A5737440Bc05ca3972fDeFf8ac3bA984536B",SchemeRegistrar:"0x0E79f80809180aB8FAE189D4e76fC814672d9a40",AdminWallet:"0x2961a6C2Fe39F0FFC4f4b1D9E037CD95f4e9C993",UpgradeScheme:"0xfC9F6F5E3ff7BAAB3fEf82e66f56917D625ba38B",OneTimePayments:"0x7912636D68E5d92708862b38698f764BF1EC297C",network:"staging",networkId:122,ProxyFactory:"0x240d844AdA767bE0AB08F9BcCcB6D8a04aE370EC",HomeBridge:"0xc116Be98ad4574EE771553a0977fA9591d48C383",FirstClaimPool:"0x5D007A7633D05b0dDD068B71E8448CD1fcdbd823",FeeFormula:"0x05eb1C46bd539Fd2A098b06D83a5bB81E5a58e63",DAI:"0x0000000000000000000000000000000000000000",cDAI:"0x0000000000000000000000000000000000000000",COMP:"0x0000000000000000000000000000000000000000"};var test={ProxyFactory:"0x36dE29DB57062A583436Ae071e141404dFE2311C",NameService:"0x105678e10c32a29543902067fEd1BB2e5E0B3CEe",GReputation:"0xFf73F4DEeFFe4f7E53E20d757b99d82D465c93b9",CompoundVotingMachine:"0x1dfBd51e464E45A9Dfe33B79222D6B3f0bedC1f0",ClaimersDistribution:"0xB3375A6f09CFFF8591577d03133eeaF39cA76a84",GovernanceStaking:"0xFD6F7A6a5c21A3f503EBaE7a473639974379c351",UBIScheme:"0x137dbc6fd877D802c567B74741D9B2526685718A",ProtocolUpgradeFuse:"0x0ed64d01D0B4B655E410EF1441dD677B695639E7",network:"test",networkId:4447,HomeBridge:"0xDC11f7E700A4c898AE5CAddB1082cFfa76512aDD",OneTimePayments:"0x86A2EE8FAf9A840F7a2c64CA3d51209F9A02081D",AdminWallet:"0x34B40BA116d5Dec75548a9e9A8f15411461E8c70",Identity:"0x36b58F5C1969B7b6591D752ea6F5486D069010AB",GoodDollar:"0x5971B98C0066517Bae7D44021f42e50B77cfe1F9",Controller:"0xF380bC8b4e595dECa3A55A4C98A6C4fA1c96f537",Avatar:"0x724dbC61127E39A610Be416b455deb800d51A3B2",FirstClaimPool:"0x720472c8ce72c2A2D711333e064ABD3E6BbEAdd3",BancorFormula:"0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43",DAI:"0x4C4a2f8c81640e47606d3fd77B353E87Ba015584",cDAI:"0x2E2Ed0Cfd3AD2f1d34481277b3204d807Ca2F8c2",COMP:"0x21dF544947ba3E8b3c32561399E88B52Dc8b2823"};var production={NameService:"0xec6dcE387B1616a0c44fF2E4fA9E90E53Cf14eb0",GReputation:"0x603B8C0F110E037b51A381CBCacAbb8d6c6E4543",CompoundVotingMachine:"0x57Ee6Ceff51CB30Ecb1245934a882c500Fbec1e9",ClaimersDistribution:"0x1aE4929090258A9D5000D98Cfb8A27174d345834",GovernanceStaking:"0xFAF457Fb4A978Be059506F6CD41f9B30fCa753b0",GovernanceStakingV2:"0xB7C3e738224625289C573c54d402E9Be46205546",UBIScheme:"0xd253A5203817225e9768C05E5996d642fb96bA86",ProtocolUpgradeFuseRecover:"0xBE43eCb37Af7F7C4A8606E672c504BE55Fc6226B",network:"production",networkId:122,HomeBridge:"0xD39021DB018E2CAEadb4B2e6717D31550e7918D0",SignupBonus:"0x0000000000000000000000000000000000000000",OneTimePayments:"0xd9Aa86e0Ddb932bD78ab8c71C1B98F83cF610Bd4",Invites:"0xCa2F09c3ccFD7aD5cB9276918Bd1868f2b922ea0",AdminWallet:"0x9F75dAcB77419b87f568d417eBc84346e134144E",Identity:"0xFa8d865A962ca8456dF331D78806152d3aC5B84F",GoodDollar:"0x495d133B938596C9984d462F007B676bDc57eCEC",Controller:"0xBcE053b99e22158f8B62f4DBFbEdE1f936b2D4e4",Avatar:"0xf96dADc6D71113F6500e97590760C924dA1eF70e",FirstClaimPool:"0x18BcdF79A724648bF34eb06701be81bD072A2384",ProxyAdmin:"0x57179b2A8eB019157b0C3E761cdB26c82C982a3B",FuseFaucet:"0x01ab5966C1d742Ae0CFF7f14cC0F4D85156e83d9",FuseStaking:"0xA199F0C353E25AdF022378B0c208D600f39a6505"};var contractsAddresses = {olddao:olddao,develop:develop,"develop-mainnet":{NameService:"0x5FeaeBfB4439F3516c74939A9D04e95AFE82C4ae",GReputation:"0x976fcd02f7C4773dd89C309fBF55D5923B4c98a1",CompoundVotingMachine:"0x19cEcCd6942ad38562Ee10bAfd44776ceB67e923",GoodMarketMaker:"0xfcDB4564c18A9134002b9771816092C9693622e3",GoodReserveCDai:"0x32EEce76C2C2e8758584A83Ee2F522D4788feA0f",GoodFundManager:"0x6C2d83262fF84cBaDb3e416D527403135D757892",StakersDistribution:"0xa6e99A4ED7498b3cdDCBB61a6A607a4925Faa1B7",ProtocolUpgrade:"0x5302E909d1e93e30F05B5D6Eea766363D14F9892",CompoundStakingFactory:"0x0ed64d01D0B4B655E410EF1441dD677B695639E7",StakingContracts:[["0x94d333510d985495DE7d96a711bE3B45F658AadF",13888],["0xd7C1B2B630dF30C0bFd480757b232cf1eb87dD8f","6944"]],DonationsStaking:"0xde2Bd2ffEA002b8E84ADeA96e5976aF664115E2c",AaveStakingFactory:"0x4bf010f1b9beDA5450a8dD702ED602A104ff65EE",ExchangeHelper:"0x02b0B4EFd909240FCB2Eb5FAe060dC60D112E3a4",ForeignBridge:"0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7",Contribution:"0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5",Identity:"0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB",GoodDollar:"0xA5B0631c5B393d4BF30D2974dF121ea7E8b0e934",Controller:"0xb3da2F710C7356E4F6540752488e88e48Fd00Cdd",Avatar:"0x625A692E96605c988192cd59563e5EB2f1E33C87",FirstClaimPool:"0x5067457698Fd6Fa1C6964e416b3f42713513B3dD",BancorFormula:"0x36b58F5C1969B7b6591D752ea6F5486D069010AB",DAI:"0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43",cDAI:"0x51A1ceB83B83F1985a81C295d1fF28Afef186E02",COMP:"0xDC11f7E700A4c898AE5CAddB1082cFfa76512aDD"},"kovan-mainnet":{NameService:"0xFD2B51bb11B7345bA592F70A685652E18Cd83946",GReputation:"0xEf0c1e6f98e433d81AE3e6611944bc06e533A47B",CompoundVotingMachine:"0xBd289D4d9E174052c665e963473753bB399989bE",GoodMarketMaker:"0xE0fdF6e09C4ac5aa5A8952ac32b16446eE0D0b79",GoodReserveCDai:"0xBE4fe98C9C4c0A8f3681c34C94cE2e462da5FC89",GoodFundManager:"0xAeEC5Af38c034D2f983dA5948646617Eee3a3372",StakersDistribution:"0x139F5DD0D48b9BDbF9d12e7A2A2fDc42577746ad",ProtocolUpgrade:"0x15Ac42377D9eD4168DFf9126DAf188F20b23E54D",CompoundStakingFactory:"0xba5b519b80d044038159b980d1c8657d53ed08a8",AaveStakingFactory:"0xd30dacCE904EBACC642Ab6dd3415e6Fc7B7B2E10",StakingContracts:[["0xbc371c5c98d40de18382e3e0eeb58805d76d3d50",13888],["0x97336539bF2ab85ED83e63f294af113A7A110Cd3",6944]],StakingContractsV3:[["0x19afea8633db478a5d7a8910dc2adc982c576045",13888],["0x2e34a18CeDf2485fbA4e19495f29245A07869039",6944]],DonationsStaking:"0xe58501733711B966f9c1d81B29557674c11bD840",ExchangeHelper:"0x7C8f7F618c2F84C656aeb51D652848ce76990dB7",Reserve:"0x7330BbDd9Fc99Cc82bE0078fB643C1DDbF9be03f",GoodDollar:"0x46183b8822BB7Cbf27E10A1acc95DfB3b5f0ec79",Identity:"0xCA95A91238a9fbE2458aaC54Cf00F99eCAB14E0a",Avatar:"0x2cA80e8e6FE46066D432204dFbC902328e912Be6",Controller:"0x3778F359a108F48959562eCfe5CE677050c509D3",AbsoluteVote:"0xFC62b61205a9Df9699D0181896603e57A30Aca28",SchemeRegistrar:"0xaF633Cf595F0695aBa029F210D364e1C4282986e",UpgradeScheme:"0xAC7671a932287a69A5E1115BEde2687436Ebed7e",DAI:"0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",cDAI:"0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad",COMP:"0x61460874a7196d6a22d1ee4922473664b3e95270",Contribution:"0xb8e03cE6bb337A1161ca6E53DE568efBe5650eaF",DAIStaking:"0xd222e5557395c5b62b682Cbfd50567908592703d",MarketMaker:"0xD7cF329519e749B5f3c220e644660c61Acc24DAA",Bridge:"0x26D044e8a7bcD384FeFD22E753229922D6693d0E",BancorFormula:"0x56ca74cd7b31609a8ba666308f089e0d5e2d0584",UniswapV2SwapHelper:"0x7D7200b2b049BB3d91bCbdf95eC0EE6c2b5f8b7E"},fuse:fuse,"fuse-mainnet":{NameService:"0x3baeEff20Cb02a5b8eF413C611c015E69221663e",GReputation:"0x30A5Ba8ED4864bf3B1fa30c78Ac774fA9D5C62CC",CompoundVotingMachine:"0xE2C57968b52A417132511fBDCAB1763D41a4F270",GoodMarketMaker:"0xD2cf3205EA36AEFf3CF0e8e8701EAe40AA3f6E4F",GoodReserveCDai:"0x2AEe03Bb8b182AF876B9d008AF9416D2A3dF6dB3",ExchangeHelper:"0xeFF1EfCf1F0247f82B0d8406f32831b00Bfdf729",GoodFundManager:"0x3419945657B6Bd89DaFD7F2bafC75FF46511298F",StakersDistribution:"0xe8C67A909d3231ddD97E4CC2c1B17a8FFA94475E",ProtocolUpgrade:"0x1a521868ED7B4d8835f1F52172d38C1C3e630E92",CompoundStakingFactory:"0xE1193dE8716400ee5aD7b4B96CBdf0dABaF7d088",StakingContracts:[["0x98867484E2F0c902F64bCdEDc2e289307c988214",13888]],DonationsStaking:"0x2aAd517DE8256ee6DC7ce31Ae09EBb99F17F9975",Contribution:"0x2250c5131bf9DdCbD55F9bEFc999D691c419ad93",DAI:"0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd",cDAI:"0x6ce27497a64fffb5517aa4aee908b1e7eb63b9ff",ForeignBridge:"0x292c17365D729d367f4556F1Bd17eB8434ebF6d1",GoodDollar:"0x22A4720e32e3419e809731E7114042D6C3055845",Reputation:"0x5925F6Bf62147D2b14B85e6dCB979e3D1A81Dbb1",Identity:"0x4D347bda25BEf041BfCB5205deECD1A33ab46db9",Avatar:"0x11655e9D725Fc1f8D1410C03f136aC586f7161ee",Controller:"0xD458BAEC7E8864A2c9c2e1261D87A4FAf77002B7",AbsoluteVote:"0x57312053C36A226Df13B01089218A5f9951D3f9c",ProxyAdmin:"0xE383e9D08e3e4f76CBb4a6953aF343E7bbcc6e98",COMP:"0xf76d4a441e4ba86a923ce32b89aff89dbccaa075",network:"fuse-mainnet",networkId:3,ProxyFactory:"0x163b69fA3a7d3e5347a29A5A49b282c35d17C87A",UniswapV2SwapHelper:"0x28b3Bc8F2a1E5cf3BfE06d22971955a53a0F52d8",AaveStakingFactory:"0xfC32F09b85aB3134195bC237C2b69001B5c609dB",BancorFormula:"0x57b2c85934Ef1A891eC9b9945f3fdbcf1104c302",FeeFormula:"0x416B5A5e12235De6838D62Fd053e7Ce59E944426"},dapptest:dapptest,"dapptest-mainnet":{NameService:"0xe528aaCA8E7cD3ce503bB4a2dEadFD4088229E1F",GReputation:"0x77423AE3ce64482ef3BB601a2EA42cf30349735A",CompoundVotingMachine:"0x6804DB9596c651A1CA24bBB821712A8899932d76",GoodMarketMaker:"0xa36ADAE77B1f6f87eD60aafEF9c080c38Ca30D0F",GoodReserveCDai:"0x411CEb987F801CdEa5a301a0CCfa4a5Df37f3f7F",ExchangeHelper:"0x1333788523bEA7C7cBdd0684Bd1ee75E940fF0Eb",GoodFundManager:"0x50589243cb1d8eEF751f4BAb253Aabef6e434c0d",StakersDistribution:"0x214c3C71191AB9bD868a5f408A61c540c787662F",ProtocolUpgrade:"0x1Fb0D426927Dab092Def63b73E1397b3F29E7b33",CompoundStakingFactory:"0xe4FEed16F54b4244C174b408Ba3B5F1f19DD1E4D",AaveStakingFactory:"0xe7213b68DC25bf30bC7f1DE9BAead075c66979F9",ForeignBridge:"0x570ADc5880D778aE5935f199aa590091586CDf75",Contribution:"0x24F2D7c50357C7B1156Ca85945D3A901c88651cB",StakingContracts:[["0xc782Ee4B0d6204Ff77471884bB95d2D2f8D60fE6",13888]],DonationsStaking:"0x4bfd12E943f25621d4FA368Ca7a5c0E7F6488000",Identity:"0xb2377aAE57F2072F52FBc38696BE573af2ce5bd9",GoodDollar:"0x5Bbaf48c102373B55079F941c40822C96E715d62",Controller:"0x67d49FAF26CA6A34D483B6BDFA45824EdA64D509",Avatar:"0xE9ED26a450aC15ea88b5801E5940B58F2f778b03",FirstClaimPool:"0xe3963EF7CC3044B64842d0AAe7F2Bf1543D341Ec",BancorFormula:"0x30474Ce2DE03045B8D0AE76F8a30DbfC8f000cea",DAI:"0xadf7b0f46EB35C748438F3e215F064E01cc7f5dF",cDAI:"0x0037272a7048132b10Dd8970AC964Bab2fDB3F62",COMP:"0xE8E9B139c6477D4EaD599bE5f2bB9335533D14f7",networkId:4447,network:"dapptest-mainnet",FeeFormula:"0x8B87065fdfe4A130108E50f74ae7F85cD20A5967",ProxyFactory:"0xF47e3B0A1952A81F1afc41172762CB7CE8700133",UniswapV2SwapHelper:"0xB4059a6808Af368A69d12FBbD104Bb6B9c37e629",ETHUsdOracle:"0x79613D7834Ad35EE8dC3F9298030eaADc2A8c250",DAIEthOracle:"0x6397866132887b206EEA19f910730443E71a8CfB",DAIUsdOracle:"0xC2E1FC63cE06C279c5De18D7119C7cA123B42C1c",COMPUsdOracle:"0x9301981F27950e6546033EADD046C86754263f2D",USDCUsdOracle:"0x89Be7D874a17cD0295B2d86436a920593b5f4480",AAVEUsdOracle:"0xDFF3455E08AB33B1599D1c5B5A1D65de63d3FCd0",GasPriceOracle:"0xFAE6fA2097792Edfd7429A282F21ec2D955279D9"},"staging-mainnet":{NameService:"0xC87FAb8A8CDD346079ca6177e47408Ba18066104",GReputation:"0xD50604E530fF36B2747aE8574b37B21B9f779d37",CompoundVotingMachine:"0x40f42698A07B19Ac431Cc115a7B9CddD294d248b",GoodMarketMaker:"0x78a76Ad9A5d4a1d0c9FABcA20083442160840d0C",GoodReserveCDai:"0x6D728DE2Be4b3d7c6B50E6F3bF46CA1F64dF7820",ExchangeHelper:"0x6BC7a1310DfE3EfE7401Aff3C598C9d948f8b245",GoodFundManager:"0x1A231e22BE9923EE4C453095A7a94820D930A553",StakersDistribution:"0xF24Ef005134208Ac62aD50EafD052Ddb2C3e7bb5",ProtocolUpgrade:"0xC60411d3Bc9F36946a6de1f3890c214192255497",UniswapV2SwapHelper:"0x24D19000790fD11e244E76fA4D86FDd92e57c144",CompoundStakingFactory:"0xf22EF80a76f41424b813C9b38b3064dBfa87cf79",AaveStakingFactory:"0x9093B908b35C08f2E8DEABA352D5C319952a7e55",DonationsStaking:"0x66Fb63cB6c4E2800db9d1691B3d00361Ada9dE61",network:"staging-mainnet",networkId:3,ForeignBridge:"0xF629c80BfCaA9080e229b555924D5c72B47F5C22",Contribution:"0x27816e32270a413AF676A2E3a25dB93C7F565a80",StakingContracts:[["0x1189c2227bAa8f0749e842B366b0912d29A5A04E",13888]],Identity:"0x7599F95677cb14d7D8834a58B3b0545a13870A56",GoodDollar:"0x2e975e7711088aAfb38119454fF7fb99bAA9142F",Controller:"0x52F0584bfB6F55cc4a3E351427fACbA7e23A3fd4",Avatar:"0xFCF6029bD177370C79173D48e05AAFf3c5f0C0bC",BancorFormula:"0x57b2c85934Ef1A891eC9b9945f3fdbcf1104c302",DAI:"0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd",cDAI:"0x6ce27497a64fffb5517aa4aee908b1e7eb63b9ff",COMP:"0xf76d4a441e4ba86a923ce32b89aff89dbccaa075",ProxyFactory:"0x33D3712b90ade5d7363F3548650e508ad8eACfAA",FeeFormula:"0xc43514e62190A6253C56C7c50DAdb907e3eda666"},staging:staging,test:test,"test-mainnet":{ProxyFactory:"0xce17442a9e26bcFDFAb2e9028e3A655d046f1654",NameService:"0xE88Cd74511b17f10363b557c2E9632CAab353b39",GReputation:"0x3B7bF1232414Bc52E3C233D0aF8524f259463034",CompoundVotingMachine:"0xA6F88E890518adAB4517f95c74b0aF4370b7e0be",GoodMarketMaker:"0xa3b0167657e47ABa3b541C1b21448B449f2CE3bc",GoodReserveCDai:"0xFE67C7f6d6A9eDA3adE28d8d1bdf1B764491E823",ExchangeHelper:"0x9bDB9d2aD7Aaf2763e49aa518A3b3CC4798210c6",GoodFundManager:"0xfE16B3e38B6eEb8f4eA0C820cB4547ec03edFE0e",StakersDistribution:"0xab06522CFF9ec6302a32b9db057293E80e1BC43a",ProtocolUpgrade:"0x5D42EBdBBa61412295D7b0302d6F50aC449Ddb4F",UniswapV2SwapHelper:"0xddE78e6202518FF4936b5302cC2891ec180E8bFf",CompoundStakingFactory:"0xB06c856C8eaBd1d8321b687E188204C1018BC4E5",AaveStakingFactory:"0xaB7B4c595d3cE8C85e16DA86630f2fc223B05057",network:"test-mainnet",networkId:4447,ForeignBridge:"0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",Contribution:"0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",StakingContracts:[["0x8f19E89ed457Ca4a3cb0dF96653d1952F465ca4A",13888],["0x810D8eB0BC99Faebc340EcA183e0110Cf0635A89","6944"]],DonationsStaking:"0x0B92eE05ABeeeEdef0a0e861468A4317d6E2AC93",Identity:"0x0165878A594ca255338adfa4d48449f69242Eb8F",GoodDollar:"0x9bd03768a7DCc129555dE410FF8E85528A4F88b5",Controller:"0x23dB4a08f2272df049a4932a4Cc3A6Dc1002B33E",Avatar:"0x61c36a8d610163660E21a8b7359e1Cac0C9133e1",FirstClaimPool:"0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E",BancorFormula:"0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",DAI:"0x5FbDB2315678afecb367f032d93F642f64180aa3",cDAI:"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",COMP:"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"},"production-bug":{ProxyFactory:"0x4659176E962763e7C8A4eF965ecfD0fdf9f52057",NameService:"0xe26867DDd22F9342d9F0D566D182f2c960683971",GReputation:"0x3A9299BE789ac3730e4E4c49d6d2Ad1b8BC34DFf",CompoundVotingMachine:"0xc2Ff55b896e3c42f9e1c2f7467C51b93F1C23dFD",ClaimersDistribution:"0xF34552F1583c0B981dbB09611128c3375b47182e",GovernanceStaking:"0xFAF457Fb4A978Be059506F6CD41f9B30fCa753b0",UBIScheme:"0x87d77A30a6819860eB8332D293810ed7b510035A",ProtocolUpgradeFuse:"0x622e1131155C6a33616FA4d97273096b047e7102",network:"production",networkId:122,HomeBridge:"0xD39021DB018E2CAEadb4B2e6717D31550e7918D0",SignupBonus:"0x0000000000000000000000000000000000000000",OneTimePayments:"0xd9Aa86e0Ddb932bD78ab8c71C1B98F83cF610Bd4",Invites:"0xCa2F09c3ccFD7aD5cB9276918Bd1868f2b922ea0",AdminWallet:"0x9F75dAcB77419b87f568d417eBc84346e134144E",Identity:"0xFa8d865A962ca8456dF331D78806152d3aC5B84F",GoodDollar:"0x495d133B938596C9984d462F007B676bDc57eCEC",Controller:"0xBcE053b99e22158f8B62f4DBFbEdE1f936b2D4e4",Avatar:"0xf96dADc6D71113F6500e97590760C924dA1eF70e",FirstClaimPool:"0x18BcdF79A724648bF34eb06701be81bD072A2384",ProxyAdmin:"0x57179b2A8eB019157b0C3E761cdB26c82C982a3B",FuseFaucet:"0x01ab5966C1d742Ae0CFF7f14cC0F4D85156e83d9",FuseStaking:"0xA199F0C353E25AdF022378B0c208D600f39a6505"},"production-mainnet-bug":{ProxyFactory:"0x4659176E962763e7C8A4eF965ecfD0fdf9f52057",NameService:"0xe26867DDd22F9342d9F0D566D182f2c960683971",GReputation:"0x3A9299BE789ac3730e4E4c49d6d2Ad1b8BC34DFf",CompoundVotingMachine:"0xc2Ff55b896e3c42f9e1c2f7467C51b93F1C23dFD",GoodMarketMaker:"0x30D37B05cF73Edd8c59ce8450F093f6C06dA9272",GoodReserveCDai:"0x6C35677206ae7FF1bf753877649cF57cC30D1c42",ExchangeHelper:"0x0a8c6bB832801454F6CC21761D0A293Caa003296",GoodFundManager:"0x3F55BD3B432EDC73Bbb704Fa5a29CC08dc1aDBEB",StakersDistribution:"0x12D15EfC3c9661AD68209CD197D416BFd9B145f5",ProtocolUpgrade:"0xfc918F32D89b7592Fbda5a0FbC7Eaa0c9a0d5d4a",UniswapV2SwapHelper:"0x62305662fA7c4BC442803b940d9192DbDC92D710",CompoundStakingFactory:"0x5f6f25143cd580e2e285210d7cfcb26e59cf9566",AaveStakingFactory:"0xa99ba154223052b8c5fd92b3f5df9eb08b72d5fc",network:"production-mainnet",networkId:1,ForeignBridge:"0xD5D11eE582c8931F336fbcd135e98CEE4DB8CCB0",Contribution:"0x8eEC64bb6807c0178f96277cCE6a334B4e565E5C",StakingContracts:[["0xD33bA17C8A644C585089145e86E282fada6F3bfd",310]],StakingContractsV2:[["0x02416eb83cff1f19163f21010149c3867f3261e1",13888],["0xf4c34bed7dd779485692bb1857acf9c561b45010",6944]],DonationsStaking:"0x06EAFc6749723583672Fc8f4451c8ec0E59F5798",Identity:"0x76e76e10Ac308A1D54a00f9df27EdCE4801F288b",GoodDollar:"0x67C5870b4A41D4Ebef24d2456547A03F1f3e094B",Controller:"0x95C0d9dCEA1E243ED696F34CAc5e6559C3c128a3",Avatar:"0x1ecFD1afb601C406fF0e13c3485f2d75699b6817",ProxyAdmin:"0xA2db14C68aB35e620fEA5bF07d65e9bff84c994C",BancorFormula:"0xA049894d5dcaD406b7C827D6dc6A0B58CA4AE73a",DAI:"0x6B175474E89094C44Da98b954EedeAC495271d0F",cDAI:"0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",COMP:"0xc00e94cb662c3520282e6f5717214004a7f26888"},"production-mainnet":{ProxyFactory:"0xDa85fceD9Bd193526b7667F2AD1fD4A0F900d3A7",NameService:"0xec6dcE387B1616a0c44fF2E4fA9E90E53Cf14eb0",GoodMarketMaker:"0xDAC6A0c973Ba7cF3526dE456aFfA43AB421f659F",GoodReserveCDai:"0xa150a825d425B36329D8294eeF8bD0fE68f8F6E0",ExchangeHelper:"0x98FA532Dd5C3a6b66fbf370813803192DE4e0abd",CompoundStakingFactory:"0x78cc5ab2f0990b5fe58f95baebf8f37879534aeb",AaveStakingFactory:"0xf4411c22766947DB2da39Ad534A040b770B51153",StakersDistribution:"0x5766cf4b2fdb09d986eb1783d276013c224e28c8",GoodFundManager:"0x0c6c80d2061afa35e160f3799411d83bdeea0a5a",GReputation:"0x603b8c0f110e037b51a381cbcacabb8d6c6e4543",CompoundVotingMachine:"0x57ee6ceff51cb30ecb1245934a882c500fbec1e9",ProtocolUpgradeRecover:"0x6f1b4dFDd7156FC5752541Ef35EDF57B48E74475",network:"production-mainnet",networkId:1,ForeignBridge:"0xD5D11eE582c8931F336fbcd135e98CEE4DB8CCB0",Contribution:"0x8eEC64bb6807c0178f96277cCE6a334B4e565E5C",Identity:"0x76e76e10Ac308A1D54a00f9df27EdCE4801F288b",GoodDollar:"0x67C5870b4A41D4Ebef24d2456547A03F1f3e094B",Controller:"0x95C0d9dCEA1E243ED696F34CAc5e6559C3c128a3",Avatar:"0x1ecFD1afb601C406fF0e13c3485f2d75699b6817",ProxyAdmin:"0xA2db14C68aB35e620fEA5bF07d65e9bff84c994C",BancorFormula:"0xA049894d5dcaD406b7C827D6dc6A0B58CA4AE73a",DAI:"0x6B175474E89094C44Da98b954EedeAC495271d0F",cDAI:"0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",COMP:"0xc00e94cb662c3520282e6f5717214004a7f26888",StakingContracts:[["0xD33bA17C8A644C585089145e86E282fada6F3bfd",310]],StakingContractsV2:[["0x02416eb83cff1f19163f21010149c3867f3261e1",13888],["0xf4c34bed7dd779485692bb1857acf9c561b45010",6944]],StakingContractsV3:[["0x7b7246c78e2f900d17646ff0cb2ec47d6ba10754",13888],["0x3ff2d8eb2573819a9ef7167d2ba6fd6d31b17f4f",6944]]},production:production,"production-celo":{ProxyFactory:"0x99C22e78A579e2176311c736C4c9F0b0D5A47806",GoodDollar:"0xf2283840cE37DAe0a06B40a9A80603977f36fA3F",Avatar:"0xCD5e8a81B1e02c1837A674f87dF327C14f4e5748",Controller:"0x3D0bacBdC06A28971855275D511e6249bE67112d",Identity:"0x96B81f82A29e78C5ba9E2034Ce8490fd641a24eb",NameService:"0x563a80a452264a9e1aa37c6FA0B46D04C3c71b24",GReputation:"0xAC132ECe25217867E318eA8ff63420C90d5a74A6",network:"production-celo",networkId:42220}};

/* Without FUSE network. */
var NETWORKS = [SupportedChainId.MAINNET, SupportedChainId.KOVAN];
/* Constructs addressed map for all chains in NETWORKS constant with the same address. */
function constructSameAddressMap(address, additionalNetworks) {
    if (additionalNetworks === void 0) { additionalNetworks = []; }
    return NETWORKS.concat(additionalNetworks).reduce(function (memo, chainId) {
        memo[chainId] = address;
        return memo;
    }, {});
}

var _a, _b, _c;
var getNetworkEnv = function (network) {
    var localNetwork = localStorage.getItem('GD_NETWORK');
    var parsed = localNetwork ? JSON.parse(localNetwork) : null;
    return parsed || network || 'staging';
};
/**
 * Fetch contract address from @gooddollar/goodprotocol npm package.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {string} name Contract name.
 * @see node_modules/@gooddollar/goodprotocol/releases/deployment.json
 */
function G$ContractAddresses(chainId, name) {
    var deploymentName;
    var CURRENT_NETWORK = getNetworkEnv();
    switch (chainId) {
        case SupportedChainId.KOVAN:
            deploymentName = 'kovan-mainnet';
            break;
        case SupportedChainId.MAINNET:
        case SupportedChainId.ROPSTEN:
            deploymentName = CURRENT_NETWORK + '-mainnet';
            break;
        case SupportedChainId.FUSE:
            deploymentName = CURRENT_NETWORK;
            break;
    }
    if (!contractsAddresses[deploymentName]) {
        console.warn("tokens: Unsupported chain ID ".concat(deploymentName), CURRENT_NETWORK);
        deploymentName = deploymentName.includes('mainnet') ? CURRENT_NETWORK + '-mainnet' : CURRENT_NETWORK;
    }
    if (!contractsAddresses[deploymentName][name]) {
        throw new Error("Inappropriate contract name ".concat(name, " in ").concat(deploymentName, " ").concat(chainId));
    }
    return contractsAddresses[deploymentName][name];
}
/* UNI tokens addresses. */
var UNI_ADDRESS = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984');
/* Uniswap's factory addresses per network. */
var UNISWAP_FACTORY_ADDRESSES = __assign(__assign({}, constructSameAddressMap(FACTORY_ADDRESS)), (_a = {}, _a[SupportedChainId.FUSE] = '0x1d1f1A7280D67246665Bb196F38553b469294f3a', _a));
/* Uniswap's initialization hash codes for calculating pair addresses per network. */
var UNISWAP_INIT_CODE_HASH = __assign(__assign({}, constructSameAddressMap(INIT_CODE_HASH)), (_b = {}, _b[SupportedChainId.FUSE] = '0x04990f130515035f22e76663517440918b83941b25a4ec04ecdf4b2898e846aa', _b));
var UNISWAP_CONTRACT_ADDRESS = (_c = {},
    _c[SupportedChainId.FUSE] = '0xFB76e9E7d88E308aB530330eD90e84a952570319',
    _c);

export { sha256 as $, getContractAddress as A, BigNumber as B, isBytes as C, computeHmac as D, ripemd160 as E, sha256$1 as F, SupportedAlgorithm as G, joinSignature as H, hexValue as I, formatFixed as J, parseFixed as K, Logger as L, index as M, zeroPad as N, hexStripZeros as O, _toEscapedUtf8String as P, toUtf8CodePoints as Q, Utf8ErrorFuncs as R, SupportedChainId as S, getIcapAddress as T, UnicodeNormalizationForm as U, getCreate2Address as V, isAddress as W, sha512 as X, pack as Y, keccak256 as Z, __extends as _, __assign as a, Utf8ErrorReason as a0, FixedNumber as a1, ErrorCode as a2, Token as a3, invariant as a4, WETH9 as a5, UNI_ADDRESS as a6, G$ContractAddresses as a7, NativeCurrency as a8, __read as a9, __values as aa, Ether as ab, Fraction as ac, Percent as ad, CurrencyAmount as ae, JSBI as af, __makeTemplateObject as ag, getNetworkEnv as ah, NETWORK_LABELS as ai, inherits_browser as aj, minimalisticAssert as ak, sha3$1 as al, getAugmentedNamespace as am, DAO_NETWORK as an, UNISWAP_INIT_CODE_HASH as ao, UNISWAP_FACTORY_ADDRESSES as ap, Pair as aq, Trade as ar, UNISWAP_CONTRACT_ADDRESS as as, Router as at, Price as au, computePriceImpact as av, portfolioSupportedAt as aw, __spreadArray as b, __rest as c, __awaiter as d, __generator as e, commonjsGlobal as f, concat as g, hexConcat as h, arrayify as i, hexlify as j, getAddress as k, hexZeroPad as l, toUtf8String as m, keccak256$1 as n, nameprep as o, isHexString as p, hexDataSlice as q, require$$0 as r, hash as s, toUtf8Bytes as t, hexDataLength as u, splitSignature as v, encode as w, stripZeros as x, isBytesLike as y, decode as z };
