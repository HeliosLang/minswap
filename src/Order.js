import {
    ADA,
    convertSpendingCredentialToUplcData,
    convertUplcDataToAssetClass,
    convertUplcDataToShelleyAddress,
    convertUplcDataToSpendingCredential,
    makeAssetClass,
    makeInlineTxOutputDatum,
    makeShelleyAddress,
    makeTokenValue,
    makeValidatorHash,
    makeValue
} from "@helios-lang/ledger"
import { makeTxBuilder, selectSmallestFirst } from "@helios-lang/tx-utils"
import {
    assertConstrData,
    expectConstrData,
    expectIntData,
    makeConstrData,
    makeIntData
} from "@helios-lang/uplc"
import { makePrincipalMintingPolicyHash } from "./pools.js"
import { toBytes } from "@helios-lang/codec-utils"
import { orderValidator } from "./orderValidator.js"
import { expectDefined } from "@helios-lang/type-utils"

/**
 * @import { Tx, ValidatorHash } from "@helios-lang/ledger"
 * @import { UplcData } from "@helios-lang/uplc"
 * @import  { OrderData, SwapOrderArgs, SwapConfig, CancelOrderArgs } from "./index.js"
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
 * @param {boolean} isMainnet
 * @param {UplcData} datum
 * @return {OrderData}
 */
function convertUplcDataToOrderData(isMainnet, datum) {
    assertConstrData(datum, 0, 9)

    const canceller = convertUplcDataToSpendingCredential(datum.fields[0])
    const refundReceiver = convertUplcDataToShelleyAddress(
        isMainnet,
        datum.fields[1]
    )
    const refundReceiverDatum = datum.fields[2]
    const successReceiver = convertUplcDataToShelleyAddress(
        isMainnet,
        datum.fields[3]
    )
    const successReceiverDatum = datum.fields[4]
    const lpAsset = convertUplcDataToAssetClass(datum.fields[5])
    const swapConfig = convertUplcDataToSwapConfig(datum.fields[6])
    const maxBatcherFee = expectIntData(datum.fields[7]).value

    return {
        canceller,
        refundReceiver,
        refundReceiverDatum,
        successReceiver,
        successReceiverDatum,
        lpAsset,
        swapConfig,
        maxBatcherFee
    }
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
 * @param {UplcData} data
 * @returns {SwapConfig}
 */
function convertUplcDataToSwapConfig(data) {
    assertConstrData(data, 0, 4)

    const directionData = expectConstrData(data.fields[0])

    /**
     * @type {"B_TO_A" | "A_TO_B"}
     */
    const direction = directionData.tag == 0 ? "B_TO_A" : "A_TO_B"

    const orderAmount = expectIntData(
        expectConstrData(data.fields[1], 0, 1).fields[0]
    ).value
    const minimumReceived = expectIntData(data.fields[2]).value
    const killable =
        expectConstrData(data.fields[3]).tag == 0
            ? "PENDING_ON_FAILED"
            : "KILL_ON_FAILED"

    return {
        direction,
        orderAmount,
        minimumReceived,
        killable
    }
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

    const inputTokens = args.inputAsset.isEqual(ADA)
        ? makeValue(args.inputQuantity)
        : makeTokenValue(args.inputAsset, args.inputQuantity).value
    const envelopeAmount = args.inputAsset.isEqual(ADA)
        ? makeValue(0)
        : makeValue(2_700_000n)
    const inputValue = envelopeAmount.add(inputTokens)

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

/**
 * @param {CancelOrderArgs} args
 * @returns {Promise<Tx>}
 */
export async function makeCancelOrderTx(args) {
    const isMainnet = args.changeAddress.mainnet
    const validator = orderValidator(isMainnet)

    const datum = convertUplcDataToOrderData(
        isMainnet,
        expectDefined(args.order.datum?.data)
    )

    if (datum.canceller.kind != "PubKeyHash") {
        throw new Error("expected pubkeyhash canceller")
    }

    const tx = await makeTxBuilder({ isMainnet })
        .attachUplcProgram(validator)
        .spendUnsafe(args.order, makeConstrData(1, []))
        .addSigners(datum.canceller)
        .build({
            changeAddress: args.changeAddress,
            spareUtxos: args.spareUTXOs,
            networkParams: args.params
        })

    return tx
}
