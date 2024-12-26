import { makeAssetClass, makeMintingPolicyHash } from "@helios-lang/ledger"
import { makeBlockfrostV0Client } from "@helios-lang/tx-utils"
import { MAINNET_BLOCKFROST_API_KEY } from "./blockfrostApiKey.js"

const POOL_TOKEN_ASSET_CLASS = makeAssetClass(
    makeMintingPolicyHash(
        "f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c"
    ),
    "4d5350"
)

async function main() {
    const client = makeBlockfrostV0Client("mainnet", MAINNET_BLOCKFROST_API_KEY)
    const addresses = await client.getAddressesWithAssetClass(
        POOL_TOKEN_ASSET_CLASS
    )

    for (let item of addresses) {
        const address = item.address

        if (address.era != "Shelley") {
            throw new Error("expected only ShelleyAddresses")
        }

        console.log(
            `${item.quantity} pool${item.quantity > 1n ? "s" : ""} at ${address.spendingCredential.toHex()}/${address.stakingCredential?.toHex() ?? "<no-staking>"}`
        )
    }
}

main()
