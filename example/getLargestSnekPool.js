import { ADA, parseAssetClass } from "@helios-lang/ledger"
import { makeBlockfrostV0Client } from "@helios-lang/tx-utils"
import { getAllV2Pools, findPool } from "../src/index.js"
import { MAINNET_BLOCKFROST_API_KEY } from "./blockfrostApiKey.js"

const DECIMALS_SNEK = 0
const ASSET_CLASS_SNEK =
    "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f.534e454b"

async function main() {
    const client = makeBlockfrostV0Client("mainnet", MAINNET_BLOCKFROST_API_KEY)
    const pools = await getAllV2Pools(client)

    const pool = findPool(pools, ADA, parseAssetClass(ASSET_CLASS_SNEK))

    console.log(
        "Price: ",
        pool.getPrice(6, DECIMALS_SNEK),
        ", liquidity: ",
        pool.data.totalLiquidity,
        ", reservesA: ",
        pool.data.reserveA,
        ", reservesB: ",
        pool.data.reserveB
    )
}

main()
