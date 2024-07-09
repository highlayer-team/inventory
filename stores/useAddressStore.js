import { defineStore } from 'pinia';
import { useKeysStore } from './useKeysStore';
const bitcoin = require('bitcoinjs-lib');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const useAddressStore = defineStore('addressManager', () => {
    const keyStore = useKeysStore();
    let addressesData = ref({});
    let isLoading = ref(false);
    let error = ref(null);
    let lastUsedIndices = ref({});
    let currentBitcoinBlockHeight = ref(0);
    let isMounted = ref(true);
    const WALLET_LIMIT = 20; // Number of unused addresses to check before stopping
    const BLOCK_HEIGHT_FETCH_INTERVAL = 60000; // 1 minute in milliseconds
    const BALANCE_FETCH_INTERVAL = 300000; // 5 minutes in milliseconds

    let blockHeightInterval = null;
    let balanceInterval = null;

    async function makeRequest(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return await response.json();
        } catch (err) {
            await wait(1000);
            return await makeRequest(url);
        }
    }

    async function fetchLatestBlockHeight() {
        try {
            const height = await makeRequest('https://blockstream.info/api/blocks/tip/height');
            currentBitcoinBlockHeight.value = height;
        } catch (err) {
            console.error('Error fetching latest block height:', err);
        }
    }

    async function discoverAddresses(type) {
        let index = 0;
        let walletNumber = 0;
        const external = 0; // Using 0 as the default for the main chain
        while (isMounted.value) {
            const address = keyStore.getAddress(type, external, index);
            const balanceUrl = `https://blockstream.info/api/address/${address}`;
            const txUrl = `https://blockstream.info/api/address/${address}/txs`;
            const balanceResult = await makeRequest(balanceUrl);
            const history = await makeRequest(txUrl);
            const balance = balanceResult.chain_stats.funded_txo_sum - balanceResult.chain_stats.spent_txo_sum;
            if (balance > 0 || history.length > 0) {
                addressesData.value[address] = {
                    balance: balance,
                    transactions: history,
                    index: index
                };
                walletNumber = 0;
                lastUsedIndices.value[type] = index;
            } else {
                walletNumber = (walletNumber + 1) % WALLET_LIMIT;
            }
            index++;
            if (walletNumber === 0 && index > lastUsedIndices.value[type]) {
                break;
            }
            if (!isMounted.value) {
                console.log('Address discovery stopped due to unmount');
                break;
            }
        }
    }

    async function fetchBalanceAndTransactions() {
        if (isLoading.value) return; // Prevent concurrent calls
        isLoading.value = true;
        error.value = null;
        try {
            await discoverAddresses('p2wpkh');  // For BIP84
            await discoverAddresses('p2pkh');   // For BIP44
        } catch (err) {
            error.value = err.message;
        } finally {
            isLoading.value = false;
        }
    }

    function startIntervals() {
        isMounted.value = true;
        if (!blockHeightInterval) {
            fetchLatestBlockHeight(); // Fetch immediately
            blockHeightInterval = setInterval(fetchLatestBlockHeight, BLOCK_HEIGHT_FETCH_INTERVAL);
        }
        if (!balanceInterval) {
            fetchBalanceAndTransactions(); // Fetch immediately
            balanceInterval = setInterval(fetchBalanceAndTransactions, BALANCE_FETCH_INTERVAL);
        }
    }

    async function fetchTransactionDetails(txId) {
        if (!txId) {
            throw new Error('Transaction ID is required');
        }

        try {
            const txUrl = `https://blockstream.info/api/tx/${txId}`;
            const txData = await makeRequest(txUrl);

            // Fetch additional data for inputs
            for (let input of txData.vin) {
                const prevTxUrl = `https://blockstream.info/api/tx/${input.txid}`;
                const prevTxData = await makeRequest(prevTxUrl);
                input.prevout = prevTxData.vout[input.vout];
            }

            // Calculate fee
            const inputSum = txData.vin.reduce((sum, input) => sum + input.prevout.value, 0);
            const outputSum = txData.vout.reduce((sum, output) => sum + output.value, 0);
            txData.fee = inputSum - outputSum;

            return txData;
        } catch (err) {
            console.error('Error fetching transaction details:', err);
            throw new Error('Failed to fetch transaction details');
        }
    }

    function stopIntervals() {
        isMounted.value = false;
        if (blockHeightInterval) {
            clearInterval(blockHeightInterval);
            blockHeightInterval = null;
        }
        if (balanceInterval) {
            clearInterval(balanceInterval);
            balanceInterval = null;
        }
    }

    const totalBalance = computed(() => {
        return Object.values(addressesData.value).reduce((sum, data) => sum + data.balance, 0);
    });

    function getFormattedTotalBalance() {
        return (totalBalance.value / 100000000).toFixed(8);
    }

    return {
        fetchBalanceAndTransactions,
        addressesData,
        isLoading,
        error,
        totalBalance,
        getFormattedTotalBalance,
        lastUsedIndices,
        currentBitcoinBlockHeight,
        startIntervals,
        stopIntervals,
        fetchTransactionDetails
    };
});