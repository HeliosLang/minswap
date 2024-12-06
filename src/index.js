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
 * @prop {(a: AssetClass, b: AssetClass) => boolean}  isFor
 * @prop {(decimalsA: number, decimalsB: number) => number} getPrice // ratio of number A assets per B assets (so would be traditionally annotated as B/A)
 */
