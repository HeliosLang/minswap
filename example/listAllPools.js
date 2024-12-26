import { makeBlockfrostV0Client } from "@helios-lang/tx-utils"
import { getAllV2Pools } from "../src/index.js"
import { MAINNET_BLOCKFROST_API_KEY } from "./blockfrostApiKey.js"

async function main() {
    const client = makeBlockfrostV0Client("mainnet", MAINNET_BLOCKFROST_API_KEY)
    const pools = await getAllV2Pools(client)

    for (let pool of pools) {
        console.log(
            `${pool.data.assetClassA.toString()}/${pool.data.assetClassB.toString()}`
        )
    }
}

main()
