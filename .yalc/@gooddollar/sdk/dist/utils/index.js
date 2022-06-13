import { B as BigNumber, f as getAddress } from '../chunks/index3.js';
import { Z as Zero, O as One, p as parseUnits, f as formatUnits } from '../chunks/index.js';

var Fraction = /** @class */ (function () {
    function Fraction(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }
    Fraction.convert = function (sdk) {
        return new Fraction(BigNumber.from(sdk.numerator.toString()), BigNumber.from(sdk.denominator.toString()));
    };
    Fraction.from = function (numerator, denominator) {
        return new Fraction(BigNumber.from(numerator), BigNumber.from(denominator));
    };
    Fraction.parse = function (value) {
        return value === ''
            ? Fraction.NAN
            : isEmptyValue(value)
                ? Fraction.ZERO
                : new Fraction(parseBalance(value, 18), Fraction.BASE);
    };
    Fraction.prototype.isZero = function () {
        return !this.isNaN() && this.numerator.isZero();
    };
    Fraction.prototype.isNaN = function () {
        return this.denominator.isZero();
    };
    Fraction.prototype.eq = function (fraction) {
        return this.numerator
            .mul(fraction.denominator)
            .div(fraction.numerator)
            .eq(this.denominator);
    };
    Fraction.prototype.gt = function (fraction) {
        return this.numerator
            .mul(fraction.denominator)
            .div(fraction.numerator)
            .gt(this.denominator);
    };
    Fraction.prototype.lt = function (fraction) {
        return this.numerator
            .mul(fraction.denominator)
            .div(fraction.numerator)
            .lt(this.denominator);
    };
    Fraction.prototype.toString = function (maxFractions) {
        if (maxFractions === void 0) { maxFractions = 8; }
        if (this.isNaN())
            return '';
        if (this.isZero())
            return '0';
        var str = formatBalance(this.numerator.mul(Fraction.BASE).div(this.denominator), 18, maxFractions);
        if (str.endsWith('.0'))
            str = str.substring(0, str.length - 2);
        return str;
    };
    Fraction.prototype.apply = function (value) {
        return this.denominator.isZero() ? Zero : this.numerator.mul(value).div(this.denominator);
    };
    Fraction.BASE = BigNumber.from(10).pow(18);
    Fraction.NAN = new Fraction(Zero, Zero);
    Fraction.ZERO = new Fraction(Zero, One);
    return Fraction;
}());

var formatFromBalance = function (value, decimals) {
    if (decimals === void 0) { decimals = 18; }
    if (value) {
        return Fraction.from(BigNumber.from(value), BigNumber.from(10).pow(decimals)).toString();
    }
    else {
        return '';
    }
};
var formatToBalance = function (value, decimals) {
    if (decimals === void 0) { decimals = 18; }
    if (value) {
        return { value: parseUnits(Number(value).toFixed(decimals), decimals), decimals: decimals };
    }
    else {
        return { value: BigNumber.from(0), decimals: decimals };
    }
};
function isWETH(value) {
    if (value.toLowerCase() === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        return 'ETH';
    }
    return value;
}
var formatBalance = function (value, decimals, maxFraction) {
    if (decimals === void 0) { decimals = 18; }
    if (maxFraction === void 0) { maxFraction = 0; }
    var formatted = formatUnits(value, decimals);
    if (maxFraction > 0) {
        var split = formatted.split('.');
        if (split.length > 1) {
            return split[0] + '.' + split[1].substr(0, maxFraction);
        }
    }
    return formatted;
};
var parseBalance = function (value, decimals) {
    if (decimals === void 0) { decimals = 18; }
    return parseUnits(value || '0', decimals);
};
var isEmptyValue = function (text) {
    return BigNumber.isBigNumber(text)
        ? BigNumber.from(text).isZero()
        : text === '' || text.replace(/0/g, '').replace(/\./, '') === '';
};
// returns the checksummed address if the address is valid, otherwise returns false
function isAddress(value) {
    try {
        return getAddress(value);
    }
    catch (_a) {
        return false;
    }
}
function isAddressString(value) {
    try {
        return getAddress(value);
    }
    catch (_a) {
        return '';
    }
}

export { formatBalance, formatFromBalance, formatToBalance, isAddress, isAddressString, isEmptyValue, isWETH, parseBalance };
