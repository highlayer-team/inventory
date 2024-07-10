import { defineStore } from 'pinia';
import { useKeysStore } from './useKeysStore';
import { ref, computed } from 'vue';
const bitcoin = require('bitcoinjs-lib');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const useAddressStore = defineStore('addressManager', () => {
    const keyStore = useKeysStore();
    let addressesData = ref({});
    let isLoading = ref(false);
    let error = ref(null);
    let currentBitcoinBlockHeight = ref(0);
    let isMounted = ref(true);
    let addressAmountsByType=ref({
        p2pkh:0,
        p2wpkh:0
    })
    const REFRESH_INTERVAL = 300000; // 5 minutes in milliseconds

    let refreshInterval = null;

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
            const height = await makeRequest('https://mempool.space/api/blocks/tip/height');
            currentBitcoinBlockHeight.value = height;
        } catch (err) {
            console.error('Error fetching latest block height:', err);
        }
    }

    async function checkAddress(type, index) {

        const address = keyStore.getAddress(type, index);
        const balanceUrl = `https://mempool.space/api/address/${address}`;
        const txUrl = `https://mempool.space/api/address/${address}/txs`;
        const balanceResult = await makeRequest(balanceUrl);
        const history = await makeRequest(txUrl);
        const balance = balanceResult.chain_stats.funded_txo_sum - balanceResult.chain_stats.spent_txo_sum;
        if(history.length>0){
            addressesData.value[address] = {
                type,
                balance: balance,
                transactions: history,
                index: index
            };
        }
        return history.length > 0;
    }

    async function discoverAddresses(type) {
        let index = 0;
        while (isMounted.value) {
            const hasTransactions = await checkAddress(type, index);
            if (!hasTransactions) {
                await wait(10000)
              
               index = 0
            
            }else{
                index++;
                addressAmountsByType.value[type]=Math.max(addressAmountsByType.value[type],index);
            }
         
        }
    }
    
    async function startPolling() {
        if (isLoading.value) return; 
        isLoading.value = true;
        error.value = null;
        try {
                discoverAddresses('p2wpkh'),  // For BIP84
                discoverAddresses('p2pkh')    // For BIP44
            
        } catch (err) {
            error.value = err.message;
        } finally {
            isLoading.value = false;
        }

    }
    



    function startIntervals() {
        isMounted.value = true;
        fetchLatestBlockHeight(); 
        startPolling(); 
        refreshInterval = setInterval(fetchLatestBlockHeight, REFRESH_INTERVAL);
    }

    async function fetchTransactionDetails(txId) {
        if (!txId) {
            throw new Error('Transaction ID is required');
        }

        try {
            const txUrl = `https://mempool.space/api/tx/${txId}`;
            const txData = await makeRequest(txUrl);

            // Fetch additional data for inputs
            for (let input of txData.vin) {
                const prevTxUrl = `https://mempool.space/api/tx/${input.txid}`;
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
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    const totalBalance = computed(() => {
        return Object.values(addressesData.value).reduce((sum, data) => sum + data.balance, 0);
    });

    function getFormattedTotalBalance() {
        return (totalBalance.value / 100000000).toFixed(8);
    }

    return {
        addressesData,
        isLoading,
        error,
        totalBalance,
        getFormattedTotalBalance,
        currentBitcoinBlockHeight,
        startIntervals,
        stopIntervals,
        addressAmountsByType,
        fetchTransactionDetails
    };
});