import { ADA, parseAssetClass } from "@helios-lang/ledger"
import { makeBlockfrostV0Client } from "@helios-lang/tx-utils"
import { getAllV2Pools, findPool } from "../src/index.js"
import { MAINNET_BLOCKFROST_API_KEY } from "./blockfrostApiKey.js"

const DECIMALS_USDM = 6
const ASSET_CLASS_USDM =
    "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad.0014df105553444d"

async function main() {
    const client = makeBlockfrostV0Client("mainnet", MAINNET_BLOCKFROST_API_KEY)
    const pools = await getAllV2Pools(client)
    const pool = findPool(pools, ADA, parseAssetClass(ASSET_CLASS_USDM))

    console.log(
        "Price: ",
        pool.getPrice(6, DECIMALS_USDM),
        ", liquidity: ",
        pool.data.totalLiquidity,
        ", reservesA: ",
        pool.data.reserveA,
        ", reservesB: ",
        pool.data.reserveB
    )
}

main()
