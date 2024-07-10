<template>

        
      <div class="flex flex-col gap-4 border-l p-6 md:p-8 flex-1 h-full max-h-[90%]">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white">Transactions</h2>
        </div>
        <div class="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="text-white">Date</TableHead>
                <TableHead class="text-white">Type</TableHead>
                <TableHead class="text-white">Amount</TableHead>
                <TableHead class="text-white">Confirmations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
  <TableRow v-for="tx in transactions" :key="tx.txid">
    <NuxtLink :to="`/tx/btc/${tx.txid}`" class="contents hover:bg-gray-700">
      <TableCell class="text-white">{{ formatDate(tx.status.block_time) }}</TableCell>
      <TableCell>
        <Badge variant="outline" :class="getTransactionType(tx).class">
          {{ getTransactionType(tx).label }}
        </Badge>
      </TableCell>
      <TableCell :class="getTransactionType(tx).class">
        {{ formatBitcoinAmount(getTransactionAmount(tx)) }} BTC
      </TableCell>
      <TableCell>
        <Badge variant="secondary" :class="getConfirmationClass(getConfirmations(tx))">
          {{ getConfirmations(tx) }}
        </Badge>
      </TableCell>
    </NuxtLink>
  </TableRow>
</TableBody>
          </Table>
        </div>
      </div>
    
  </template>
  
  <script setup>
  const keysStore = useKeysStore();
  const addressStore = useAddressStore();
  
  onMounted(() => {
    addressStore.startIntervals();
  });
  
  onUnmounted(() => {
    addressStore.stopIntervals();
  });
  
  const transactions = computed(() => {
    return Object.values(addressStore.addressesData)
      .flatMap(data => data.transactions)
      .sort((a, b) => b.status.block_time - a.status.block_time);
  });
  
  function getTransactionType(tx) {
    const inputAddresses = tx.vin.map(input => input.prevout.scriptpubkey_address);
    const outputAddresses = tx.vout.map(output => output.scriptpubkey_address);
    const ourAddresses = Object.keys(addressStore.addressesData);
  
    const isIncoming = outputAddresses.some(address => ourAddresses.includes(address));
    const isOutgoing = inputAddresses.some(address => ourAddresses.includes(address));
  
    if (isIncoming && !isOutgoing) {
      return { label: 'Received BTC', class: 'border-green-600 text-green-500' };
    } else if (isOutgoing) {
      return { label: 'Sent BTC', class: 'border-red-600 text-red-500' };
    } else {
      return { label: 'Internal Transfer', class: 'border-yellow-600 text-yellow-500' };
    }
  }
  
  function getTransactionAmount(tx) {
    const ourAddresses = Object.keys(addressStore.addressesData);
    let amount = 0;
  
    // Sum up incoming amounts
    tx.vout.forEach(output => {
      if (ourAddresses.includes(output.scriptpubkey_address)) {
        amount += output.value;
      }
    });
  
    // Subtract outgoing amounts
    tx.vin.forEach(input => {
      if (ourAddresses.includes(input.prevout.scriptpubkey_address)) {
        amount -= input.prevout.value;
      }
    });
  
    return amount;
  }
  
  function formatBitcoinAmount(satoshis) {
    return (satoshis / 100000000).toFixed(8);
  }
  
  function getConfirmations(tx) {
    return tx.status.confirmed
      ? addressStore.currentBitcoinBlockHeight - tx.status.block_height + 1
      : 0;
  }
  
  function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
  }
  

  function getConfirmationClass(confirmations) {
    if (confirmations <= 0) return 'bg-red-500 text-white';
    if (confirmations < 6) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  }
  </script>