import {
    makeAssetClass,
    makeMintingPolicyHash,
    makeShelleyAddress
} from "@helios-lang/ledger"
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

    const m = client.isMainnet()

    const address = makeShelleyAddress(
        m
            ? "11ea07b733d932129c378af627436e7cbc2ef0bf96e0036bb51b3bde6b52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c2"
            : "10d6ba9b7509eac866288ff5072d2a18205ac56f744bc82dcd808cb8fe83ec96719dc0591034b78e472d6f477446261fec4bc517fa4d047f02"
    )
    const assetClass = makeAssetClass(
        makeMintingPolicyHash(
            m
                ? "f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c"
                : "d6aae2059baee188f74917493cf7637e679cd219bdfbbf4dcbeb1d0b"
        ),
        "4d5350"
    )

    const utxos = await helper.getUtxosWithAssetClass(address, assetClass)

    return utxos.map((utxo) =>
        makePool(convertUplcDataToPoolData(expectDefined(utxo.datum?.data)))
    )
}

/**
 * If multiple are found, pick the one with the largest total liquidity
 * @param {Pool[]} pools
 * @param {AssetClass} a
 * @param {AssetClass} b
 * @returns {Pool}
 */
export function findPool(pools, a, b) {
    pools = pools.filter((p) => p.isFor(a, b))

    const invertedPools = pools.filter((p) => p.isFor(b, a))

    pools = pools.concat(invertedPools.map((p) => p.invert()))

    if (pools.length == 0) {
        throw new Error(`No pools for ${a.toString()}/${b.toString()} found`)
    }

    pools.sort(
        (p0, p1) =>
            Number(p1.data.totalLiquidity) - Number(p0.data.totalLiquidity)
    )

    return pools[0]
}
