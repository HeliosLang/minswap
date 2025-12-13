export { makeCancelOrderTx, makeSwapOrderTx } from "./Order.js"
export { makePool } from "./Pool.js"
export { convertUplcDataToPoolData } from "./PoolData.js"
export { findPool, findPoolByLPAssetClass, getAllV2Pools } from "./pools.js"

/**
 * @import { BytesLike } from "@helios-lang/codec-utils"
 * @import {
 *   AssetClass,
 *   NetworkParams,
 *   PubKeyHash,
 *   ShelleyAddress,
 *   SpendingCredential,
 *   TxInput,
 *   Value
 * } from "@helios-lang/ledger"
 * @import { UplcData } from "@helios-lang/uplc"
 */

/**
 * @typedef {object} OrderData
 * Wrapped in ConstrData(0, [...])
 *
 * @prop {SpendingCredential} canceller
 * @prop {ShelleyAddress} refundReceiver
 *
 * @prop {UplcData} refundReceiverDatum
 * Defaults to ConstrData(0, [])
 *
 * @prop {ShelleyAddress} successReceiver
 * Usually the same as the refundReceiver
 *
 * @prop {UplcData} successReceiverDatum
 * Defaults to ConstrData(0, [])
 *
 * @prop {AssetClass} lpAsset
 * Asset class of Liquidity Pool token
 *
 * @prop {SwapConfig} swapConfig
 *
 * @prop {bigint} maxBatcherFee
 * Seems to default to 700_000 (or does it depend on pool?)
 * Maybe we can always set to 0?
 *
 * @prop {unknown} [expiredOptions]
 * If unset: uses ConstrData(1, [])
 */

/**
 * @typedef {"B_TO_A" | "A_TO_B"} OrderDirection
 */

/**
 * @typedef {object} SwapConfig
 * Wrapped with ConstrData(0, [...])
 *
 * @prop {OrderDirection} direction
 * "B_TO_A" -> 0 (encoded as `ConstrData(0, [])`)
 * "A_TO_B" -> 1 (encoded as `ConstrData(1, [])`)
 *
 * @prop {bigint} orderAmount
 * Always use "SPECIFIC_AMOUNT" for now, so encoded as `ConstrData(0, [IntData(orderAmount)])`
 *
 * @prop {bigint} minimumReceived
 * Lower limit (e.g. we can take current price -0.5%)
 *
 * @prop {"PENDING_ON_FAILED" | "KILL_ON_FAILED"} killable
 * "PENDING_ON_FAILED" -> 0
 * "KILL_ON_FAILED" -> 1
 *
 * Defaults to "PENDING_ON_FAILED" (i.e. `ConstrData(0, [])`)
 */

/**
 * @typedef {object} SwapOrderArgs
 *
 * @prop {PubKeyHash} owner
 * This is is the canceller
 *
 * @prop {ShelleyAddress} changeAddress
 * Used for both change of current Tx, and success and refund fields in datum
 *
 * @prop {NetworkParams} params
 *
 * @prop {BytesLike} lpTokenName
 * @prop {OrderDirection} direction
 * @prop {AssetClass} inputAsset
 * @prop {bigint} inputQuantity
 * @prop {TxInput[]} utxos
 * All UTXOs will be spent, so coin selection must be done by caller.
 * These UTXOs are also used for fees.
 *
 * @prop {bigint} minReceived
 */

/**
 * @typedef {object} CancelOrderArgs
 * @prop {TxInput} order
 * @prop {ShelleyAddress} changeAddress
 * @prop {NetworkParams} params
 * @prop {TxInput[]} spareUTXOs
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
 * @prop {Value} value
 * On-chain value contained in current Pool UTxO
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
