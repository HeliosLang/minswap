/**
 * @import { AssetClass } from "@helios-lang/ledger"
 * @import { Pool, PoolData } from "./index.js"
 */

/**
 * @param {PoolData} data
 * @returns {Pool}
 */
export function makePool(data) {
    return new PoolImpl(data)
}

/**
 * @implements {Pool}
 */
class PoolImpl {
    /**
     * @type {PoolData}
     */
    data

    /**
     * @param {PoolData} data
     */
    constructor(data) {
        this.data = data
    }

    /**
     * @returns {Pool}
     */
    invert() {
        return makePool({
            assetClassA: this.data.assetClassB,
            assetClassB: this.data.assetClassA,
            totalLiquidity: this.data.totalLiquidity,
            reserveA: this.data.reserveB,
            reserveB: this.data.reserveA,
            baseFeeA: this.data.baseFeeB,
            baseFeeB: this.data.baseFeeA,
            feeSharing: this.data.feeSharing
        })
    }

    /**
     * @param {AssetClass} a
     * @param {AssetClass} b
     */
    isFor(a, b) {
        return (
            this.data.assetClassA.isEqual(a) && this.data.assetClassB.isEqual(b)
        )
    }

    /**
     * @param {number} decimalsA
     * @param {number} decimalsB
     * @returns {number}
     */
    getPrice(decimalsA, decimalsB) {
        const adjustedReserveA =
            Number(this.data.reserveA) / Math.pow(10, decimalsA)
        const adjustedReserveB =
            Number(this.data.reserveB) / Math.pow(10, decimalsB)

        return adjustedReserveA / adjustedReserveB
    }
}
