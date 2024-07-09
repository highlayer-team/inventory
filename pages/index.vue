<template>
    <div class="flex h-screen flex-row items-stretch justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-2 flex-none p-6 md:p-8">
        <div class="flex flex-col items-center justify-center gap-2 rounded-lg">
          <div class="flex w-full items-center justify-center gap-2 flex-col">
            <img src="@/assets/inventory-01.svg" class="h-32 w-32 text-primary" />
            <h2 class="text-2xl font-bold text-white">Inventory</h2>
          </div>
          <div class="flex flex-col md:flex-row items-center justify-center gap-2">
            <div class="text-2xl font-bold text-white h-full">
              <span>{{ addressStore.getFormattedTotalBalance() }}</span>
              <span class="ml-1 text-xl text-muted-foreground">BTC</span>
            </div>
            <div class="text-2xl font-bold text-white h-full">
              <span>100.000</span>
              <span class="ml-1 text-xl text-muted-foreground">HI</span>
            </div>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <div class="flex gap-2">
              <Button>Send</Button>
              <Button variant="outline" class="text-primary-foreground">
                Explore
              </Button>
            </div>
          </div>
        </div>
        <div v-for="(data, address, index) in addressStore.addressesData" :key="address" class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <IconsBitcoin class="h-6 w-6 text-primary" />
            <div>
              <div class="font-medium text-white">Address {{ index}} (m/84'/0'/0'/0'/{{index}})</div>
              <div class="text-sm text-muted-foreground pr-2">{{ address }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" class="text-foreground" @click="copyToClipboard(address)">
              <IconsCopy class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <!-- New Fresh Address Section -->
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center gap-2">
            <IconsBitcoin class="h-6 w-6 text-primary" />
            <div>
              <div class="font-medium text-white">Fresh Address (m/84'/0'/0'/0'/{{ Object.keys(addressStore.addressesData).length }})</div>
              <div class="text-sm text-muted-foreground pr-2">{{ getFreshAddress() }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" class="text-foreground" @click="copyToClipboard(getFreshAddress())">
              <IconsCopy class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <Button >Refresh Addresses</Button>
        </div>
      </div>
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
                <TableCell class="text-white">{{ formatDate(tx.status.block_time) }}</TableCell>
                <TableCell>
                  <Badge variant="outline" :class="tx.amount > 0 ? 'border-green-600 text-green-500' : 'border-red-600 text-red-500'">
                    {{ tx.amount > 0 ? 'Received BTC' : 'Sent BTC' }}
                  </Badge>
                </TableCell>
                <TableCell :class="tx.amount > 0 ? 'text-green-500' : 'text-red-500'">
                  {{ (tx.amount / 100000000).toFixed(8) }} BTC
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{{ tx.status.confirmed ? 'Confirmed' : 'Pending' }}</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
    const keysStore=useKeysStore()
  const addressStore = useAddressStore();
  
  onMounted(() => {
    addressStore.fetchBalanceAndTransactions();
  });
  
  const transactions = computed(() => {
    return Object.values(addressStore.addressesData)
      .flatMap(data => data.transactions)
      .sort((a, b) => b.status.block_time - a.status.block_time);
  });
  
  function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  }
  
  function getFreshAddress() {
    const addressCount = Object.keys(addressStore.addressesData).length;
    // This is a placeholder. You'll need to implement the actual derivation logic
    return keysStore.getAddress("p2wpkh",addressCount)
  }
  </script>