import {
    convertSpendingCredentialToUplcData,
    makeAssetClass,
    makeInlineTxOutputDatum,
    makeShelleyAddress,
    makeTokenValue,
    makeValidatorHash,
    makeValue
} from "@helios-lang/ledger"
import { makeTxBuilder, selectSmallestFirst } from "@helios-lang/tx-utils"
import { makeConstrData, makeIntData } from "@helios-lang/uplc"
import { makePrincipalMintingPolicyHash } from "./pools.js"
import { toBytes } from "@helios-lang/codec-utils"

/**
 * @import { Tx, ValidatorHash } from "@helios-lang/ledger"
 * @import { UplcData } from "@helios-lang/uplc"
 * @import  { OrderData, SwapOrderArgs, SwapConfig } from "./index.js"
 */

/**
 * @param {OrderData} order
 * @returns {UplcData}
 */
export function convertOrderDataToUplcData(order) {
    return makeConstrData(0, [
        convertSpendingCredentialToUplcData(order.canceller),
        order.refundReceiver.toUplcData(),
        order.refundReceiverDatum,
        order.successReceiver.toUplcData(),
        order.successReceiverDatum,
        order.lpAsset.toUplcData(),
        convertOrderSwapConfigToUplcData(order.swapConfig),
        makeIntData(order.maxBatcherFee),
        makeConstrData(1, []) // TODO: what if actually set
    ])
}

/**
 * @param {SwapConfig} swapConfig
 * @returns {UplcData}
 */
function convertOrderSwapConfigToUplcData(swapConfig) {
    return makeConstrData(0, [
        makeConstrData(swapConfig.direction == "B_TO_A" ? 0 : 1, []),
        makeConstrData(0, [makeIntData(swapConfig.orderAmount)]),
        makeIntData(swapConfig.minimumReceived),
        makeConstrData(swapConfig.killable == "PENDING_ON_FAILED" ? 0 : 1, [])
    ])
}

/**
 * @param {boolean} isMainnet
 * @returns {ValidatorHash}
 */
export function makeOrderValidatorHash(isMainnet) {
    return makeValidatorHash(
        isMainnet
            ? "c3e28c36c3447315ba5a56f33da6a6ddc1770a876a8d9f0cb3a97c4c"
            : "da9525463841173ad1230b1d5a1b5d0a3116bbdeb4412327148a1b7a"
    )
}

/**
 * @param {SwapOrderArgs} args
 * @returns {Promise<Tx>}
 */
export async function makeSwapOrderTx(args) {
    const isMainnet = args.changeAddress.mainnet

    const b = makeTxBuilder({
        isMainnet
    })

    const inputTokens = makeTokenValue(args.inputAsset, args.inputQuantity)
    const envelopeAmount = makeValue(2_700_000n)
    const inputValue = envelopeAmount.add(inputTokens.value)

    const [toSpend, spare] = selectSmallestFirst({
        allowSelectingUninvolvedAssets: true
    })(args.utxos, inputValue)

    const minSwapValidatorHash = makeOrderValidatorHash(isMainnet)
    const minSwapOrderAddr = makeShelleyAddress(
        isMainnet,
        minSwapValidatorHash,
        args.changeAddress.stakingCredential
    )

    const tx = await b
        .spendUnsafe(toSpend)
        .payUnsafe(
            minSwapOrderAddr,
            inputValue,
            makeInlineTxOutputDatum(
                convertOrderDataToUplcData({
                    canceller: args.changeAddress.spendingCredential,
                    refundReceiver: args.changeAddress,
                    refundReceiverDatum: makeConstrData(0, []),
                    successReceiver: args.changeAddress,
                    successReceiverDatum: makeConstrData(0, []),
                    lpAsset: makeAssetClass(
                        makePrincipalMintingPolicyHash(isMainnet),
                        toBytes(args.lpTokenName)
                    ),
                    maxBatcherFee: 700_000n, // lovelace taken from the envelope amount?
                    swapConfig: {
                        direction: args.direction,
                        orderAmount: args.inputQuantity,
                        minimumReceived: args.minReceived,
                        killable: "PENDING_ON_FAILED"
                    }
                })
            )
        )
        .build({
            networkParams: args.params,
            spareUtxos: spare,
            changeAddress: args.changeAddress
        })

    return tx
}
