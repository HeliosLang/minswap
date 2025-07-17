import { strictEqual } from "node:assert"
import { describe, it } from "node:test"
import { makeShelleyAddress } from "@helios-lang/ledger"
import { makeOrderValidatorHash } from "./Order.js"

describe("order enterprise address", () => {
    it("correct for mainnet", () => {
        const vHash = makeOrderValidatorHash(true)

        const addr = makeShelleyAddress(true, vHash)

        strictEqual(
            addr.toBech32(),
            "addr1w8p79rpkcdz8x9d6tft0x0dx5mwuzac2sa4gm8cvkw5hcnqst2ctf"
        )
    })

    it("correct for preprod", () => {
        const vHash = makeOrderValidatorHash(false)

        const addr = makeShelleyAddress(false, vHash)

        strictEqual(
            addr.toBech32(),
            "addr_test1wrdf2f2x8pq3wwk3yv936ksmt59rz94mm66yzge8zj9pk7s0kjph3"
        )
    })
})
