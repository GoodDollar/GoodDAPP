import './addresses.js';

var LIQUIDITY_PROTOCOL;
(function (LIQUIDITY_PROTOCOL) {
    LIQUIDITY_PROTOCOL["COMPOUND"] = "COMPOUND";
    LIQUIDITY_PROTOCOL["AAVE"] = "AAVE";
    LIQUIDITY_PROTOCOL["UNKNOWN"] = "UNKNOWN";
    LIQUIDITY_PROTOCOL["G$"] = "GOODDOLLAR";
    LIQUIDITY_PROTOCOL["GOODDAO"] = "GoodDAO";
})(LIQUIDITY_PROTOCOL || (LIQUIDITY_PROTOCOL = {}));

var DEFAULT_DEADLINE_FROM_NOW = 60 * 20;
var AdditionalChainId;
(function (AdditionalChainId) {
    AdditionalChainId[AdditionalChainId["FUSE"] = 122] = "FUSE";
    //KOVAN = 42
})(AdditionalChainId || (AdditionalChainId = {}));

export { AdditionalChainId as A, DEFAULT_DEADLINE_FROM_NOW as D, LIQUIDITY_PROTOCOL as L };
