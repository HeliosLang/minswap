import { convertUplcDataToAssetClass } from "@helios-lang/ledger"
import {
    assertConstrData,
    expectIntData,
    unwrapUplcDataOption
} from "@helios-lang/uplc"

/**
 * @import { UplcData } from "@helios-lang/uplc"
 * @import { PoolData } from "./index.js"
 */

/**
 * Throws an error if the datum doesn't have the correct structure
 * @param {UplcData} datum
 * @returns {PoolData}
 */
export function convertUplcDataToPoolData(datum) {
    assertConstrData(datum, 0, 10)

    const feeSharingData = unwrapUplcDataOption(datum.fields[8])
    let feeSharing = feeSharingData
        ? expectIntData(feeSharingData).value
        : undefined

    return {
        // TODO: convert staking credential
        assetClassA: convertUplcDataToAssetClass(datum.fields[1]),
        assetClassB: convertUplcDataToAssetClass(datum.fields[2]),
        totalLiquidity: expectIntData(datum.fields[3]).value,
        reserveA: expectIntData(datum.fields[4]).value,
        reserveB: expectIntData(datum.fields[5]).value,
        baseFeeA: expectIntData(datum.fields[6]).value,
        baseFeeB: expectIntData(datum.fields[7]).value,
        feeSharing
    }
}
