/**
 * Fill this to be able to run the examples
 * @type {string}
 */
export const MAINNET_BLOCKFROST_API_KEY = ""

if (MAINNET_BLOCKFROST_API_KEY == "") {
    throw new Error("Blockfrost API key not set")
}
