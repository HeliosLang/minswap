import {
    makeAssetClass,
    makeMintingPolicyHash,
    makePubKeyHash,
    makeShelleyAddress,
    makeValidatorHash
} from "@helios-lang/ledger"
import { makeCardanoClientHelper } from "@helios-lang/tx-utils"
import { expectDefined } from "@helios-lang/type-utils"
import { makePool } from "./Pool.js"
import { convertUplcDataToPoolData } from "./PoolData.js"

/**
 * @import { AssetClass, PubKeyHash } from "@helios-lang/ledger"
 * @import { ReadonlyCardanoClient } from "@helios-lang/tx-utils"
 * @import { Pool } from "./index.js"
 */

const MAINNET_POOL_DATA_SPENDING_CREDENTIAL = makeValidatorHash(
    "ea07b733d932129c378af627436e7cbc2ef0bf96e0036bb51b3bde6b"
)
const PREPROD_POOL_DATA_SPENDING_CREDENTIAL = makeValidatorHash(
    "d6ba9b7509eac866288ff5072d2a18205ac56f744bc82dcd808cb8fe"
)

// these are pub key hashes
/**
 * @type {PubKeyHash[]}
 */
const MAINNET_POOL_DATA_STAKING_CREDENTIALS = [
    makePubKeyHash("52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c2"),
    makePubKeyHash("9120678a215368e56cc7f70f5bab0cca195aa45c7f471c5db2b5a458"),
    makePubKeyHash("dc306d8c426a93d8ff9e00d8d32b729a82c29d2692eb145b3c76d434"),
    makePubKeyHash("8aea9727663c50082b9409ea78a55fab558ec0e7541d617520c00006"),
    makePubKeyHash("6ed559086ad059a58cdc3ac37f9b7db9981d8b8d429f5d81479c80de"),
    makePubKeyHash("3a41cea9ea1d520d3b5557cf59cf71adfd24dfbf365a68953ebbde3d"),
    makePubKeyHash("2f387f67a83b02987ec60ed765eb34ac9fd70cf6092f81a0b689ce5e"),
    makePubKeyHash("1648a550221eb453ef07b8992f12aa2ad2e13bbd8707d1826586843e"),
    makePubKeyHash("a0c49bcd80d2de3d833e0857a81056d6018aec14a94cb1aa640504ce"),
    makePubKeyHash("8ebb5f8f7381652644e15c3e734787e6e0ec469ba08a2edc592164c8"),
    makePubKeyHash("8fa6b569e84e0253e32c23f6c0dae1611e1299b1bb85a2baad984897"),
    makePubKeyHash("040487191ececbe97e44dfb6ea1754b99a1a7bf65f8d707123f203ad"),
    makePubKeyHash("8313246dc91c31215e82e4bb2430db3982811506a5392ca3d4dd0dfd")
]

const PREPROD_POOL_DATA_STAKING_CREDENTIALS = [
    makePubKeyHash("83ec96719dc0591034b78e472d6f477446261fec4bc517fa4d047f02")
]

/**
 * @param {ReadonlyCardanoClient} client
 * @returns {Promise<Pool[]>}
 */
export async function getAllV2Pools(client) {
    const helper = makeCardanoClientHelper(client)

    const m = client.isMainnet()

    const addresses = m
        ? MAINNET_POOL_DATA_STAKING_CREDENTIALS.map((stakingCred) =>
              makeShelleyAddress(
                  true,
                  MAINNET_POOL_DATA_SPENDING_CREDENTIAL,
                  stakingCred
              )
          )
        : PREPROD_POOL_DATA_STAKING_CREDENTIALS.map((stakingCred) =>
              makeShelleyAddress(
                  false,
                  PREPROD_POOL_DATA_SPENDING_CREDENTIAL,
                  stakingCred
              )
          )

    const assetClass = makeAssetClass(
        makeMintingPolicyHash(
            m
                ? "f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c"
                : "d6aae2059baee188f74917493cf7637e679cd219bdfbbf4dcbeb1d0b"
        ),
        "4d5350"
    )

    const utxos = (
        await Promise.all(
            addresses.map((address) =>
                helper.getUtxosWithAssetClass(address, assetClass)
            )
        )
    ).reduce((prev, lst) => prev.concat(lst), [])

    /**
     * @type {Pool[]}
     */
    const pools = []

    // only add utxos with defined pool data
    for (let utxo of utxos) {
        if (utxo.datum?.data) {
            pools.push(makePool(convertUplcDataToPoolData(utxo.datum.data)))
        } else {
            console.error(`utxo ${utxo.id.toString()} is missing pool datum`)
        }
    }

    return pools
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
