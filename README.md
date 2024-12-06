# minswap

WASM-free library for querying Minswap DEX token prices

Minswap prices are based on the ratio of liquidity pool reserves. These reserves are tracked in the datum of a Pool UTxO.

## V2 Mainnet

For V2 pools, these pool UTxOs are located at the validator with hash: ea07b733d932129c378af627436e7cbc2ef0bf96e0036bb51b3bde6b

Each Pool UTxO contains the following a token with the following assetclass: f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c.4d5350
(tokenname `MSP` i.e. MinSwapPool)

## Pool datum structure

```
PoolData = ConstrData(0, [
    stakingCredential: ConstrData(0, [
        poolBatchingStakeCredential: LucidCredentialData
    ]) // 0
    assetA: AssetData // 1
    assetB: AssetData // 2
    totalLiquidity: IntData // 3
    reserveA: IntData // 4
    reserveB: IntData // 5
    baseFeeA: IntData // 6
    baseFeeB: IntData // 7
    feeSharing: OptionData<IntData> // 8
    allowDynamicFee: BoolData // 9
])

AssetData = ConstrData(0, [ByteArrayData, ByteArrayData])
OptionData<T> = ConstrData(0, [T]) | ConstrData(1, [])
BoolData = ConstrData(0, []) | ConstrData(1, []) // 0 is false, 1 is true
```
