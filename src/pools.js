import { makeAssetClass, makeMintingPolicyHash, makeShelleyAddress, makeValidatorHash } from "@helios-lang/ledger"
import { makeCardanoClientHelper } from "@helios-lang/tx-utils"
import { expectDefined } from "@helios-lang/type-utils"
import { makePool } from "./Pool.js"
import { convertUplcDataToPoolData } from "./PoolData.js"

/**
 * @import { AssetClass } from "@helios-lang/ledger"
 * @import { CardanoClient } from "@helios-lang/tx-utils"
 * @import { Pool } from "./index.js"
 */

/**
 * @param {CardanoClient} client 
 * @returns {Promise<Pool[]>}
 */
export async function getAllV2Pools(client) {
    const helper = makeCardanoClientHelper(client)

    const address = makeShelleyAddress(
        client.isMainnet(),
        makeValidatorHash("ea07b733d932129c378af627436e7cbc2ef0bf96e0036bb51b3bde6b")
    )

    let utxos = await helper.getUtxos(address)

    const poolAssetClass = makeAssetClass(
        makeMintingPolicyHash("f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c"),
        "4d5350"
    )

    utxos = utxos.filter(utxo => utxo.value.assetClasses.some(ac => ac.isEqual(poolAssetClass)))

    return utxos.map(utxo => makePool(convertUplcDataToPoolData(expectDefined(utxo.datum?.data))))
}

/**
 * If multiple are found, pick the one with the largest total liquidity
 * @param {Pool[]} pools 
 * @param {AssetClass} a
 * @param {AssetClass} b
 * @returns {Pool}
 */
export function findPool(pools, a, b) {
    pools = pools.filter(p => p.isFor(a, b))

    if (pools.length) {
        throw new Error(`No pools for ${a.toString()}/${b.toString()} found`)
    }

    pools.sort((p0, p1) => Number(p1) - Number(p0))

    return pools[0]
}