export { makePool } from "./Pool.js"
export { convertUplcDataToPoolData } from "./PoolData.js"
export { findPool, getAllV2Pools } from "./pools.js"

/**
 * @import { AssetClass } from "@helios-lang/ledger"
 */

/**
 * @typedef {object} PoolData
 * @prop {AssetClass} assetClassA
 * @prop {AssetClass} assetClassB
 * @prop {bigint} totalLiquidity
 * @prop {bigint} reserveA
 * @prop {bigint} reserveB
 * @prop {bigint} baseFeeA
 * @prop {bigint} baseFeeB
 * @prop {bigint} [feeSharing]
 */

/**
 * @typedef {object} Pool
 * @prop {PoolData} data
 * On-chain data related to Pool
 *
 * @prop {(a: AssetClass, b: AssetClass) => boolean}  isFor
 * Note: returns false if a is b and b is a are swapped (such cases must be checked by caller)
 *
 * @prop {(decimalsA: number, decimalsB: number) => number} getPrice
 * Returns the ratio of number A assets per B assets (so would be traditionally annotated as B/A)
 *
 * @prop {() => Pool} invert
 * Swap A and B
 */
