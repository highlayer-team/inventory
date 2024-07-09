import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useKeysStore } from './useKeysStore';
const bitcoin = require('bitcoinjs-lib');

export const useAddressStore = defineStore('addressManager', () => {
    const keyStore = useKeysStore();
    let addressesData = ref({});
    let isLoading = ref(false);
    let error = ref(null);
    let lastUsedIndices = ref({});

    const WALLET_LIMIT = 20; // Number of unused addresses to check before stopping

    async function makeRequest(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return await response.json();
        } catch (err) {
            throw new Error(`Fetch error: ${err.message}`);
        }
    }

    async function discoverAddresses(type) {
        let index = 0;
        let walletNumber = 0;
        const external = 0; // Using 0 as the default for the main chain

        while (true) {
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
                    index:index
                };
                walletNumber = 0;
                lastUsedIndices.value[type] = index;
            } else {
                walletNumber=walletNumber+1%WALLET_LIMIT;
            }

            index++;
        }
    }

    async function fetchBalanceAndTransactions() {
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
        lastUsedIndices
    };
});