import { _ as __extends } from './tslib.es6.js';

var UnsupportedChainId = /** @class */ (function (_super) {
    __extends(UnsupportedChainId, _super);
    function UnsupportedChainId(chainId) {
        if (chainId === void 0) { chainId = 'UNKNOWN'; }
        return _super.call(this, "Unsupported chain ".concat(chainId)) || this;
    }
    return UnsupportedChainId;
}(Error));
var InvalidChainId = /** @class */ (function (_super) {
    __extends(InvalidChainId, _super);
    function InvalidChainId(expectedChainId) {
        return _super.call(this, "Invalid chain, expected ".concat(expectedChainId)) || this;
    }
    return InvalidChainId;
}(Error));
var UnsupportedToken = /** @class */ (function (_super) {
    __extends(UnsupportedToken, _super);
    function UnsupportedToken(token) {
        if (token === void 0) { token = 'UNKNOWN'; }
        return _super.call(this, "Unsupported token ".concat(token)) || this;
    }
    return UnsupportedToken;
}(Error));
var UnexpectedToken = /** @class */ (function (_super) {
    __extends(UnexpectedToken, _super);
    function UnexpectedToken(token) {
        if (token === void 0) { token = 'UNKNOWN'; }
        return _super.call(this, "Unexpected token ".concat(token)) || this;
    }
    return UnexpectedToken;
}(Error));
var InsufficientLiquidity = /** @class */ (function (_super) {
    __extends(InsufficientLiquidity, _super);
    function InsufficientLiquidity() {
        return _super.call(this, "Insufficient liquidity for this trade") || this;
    }
    return InsufficientLiquidity;
}(Error));

export { InvalidChainId as I, UnsupportedChainId as U, UnexpectedToken as a, InsufficientLiquidity as b, UnsupportedToken as c };
