<template>
    <div class="flex h-screen flex-row items-stretch justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <!-- Sidebar (same as wallet view) -->
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
        <!-- Fresh Address Section -->
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
          <Button>Refresh Addresses</Button>
        </div>
      </div>
  
      <!-- Main content: Transaction details -->
      <div class="flex flex-col gap-4 border-l p-6 md:p-8 flex-1 h-full max-h-[90%] overflow-auto">
        <h2 class="text-2xl font-bold text-white mb-4">Bitcoin Transaction Details</h2>
        
        <div v-if="isLoading" class="text-white">Loading transaction details...</div>
        
        <div v-else-if="error" class="text-red-500">{{ error }}</div>
        
        <div v-else-if="transaction" class="space-y-4">
          <div class="border p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">Transaction ID</h3>
            <p class="text-muted-foreground break-all">{{ transaction.txid }}</p>
          </div>
  
          <div class="border p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">Status</h3>
            <Badge :variant="transaction.status.confirmed ? 'default' : 'destructive'" :class="transaction.status.confirmed?'bg-green-700 hover:bg-green-800':'bg-red-700 hover:bg-red-800'">
              {{ transaction.status.confirmed ? 'Confirmed' : 'Unconfirmed' }}
            </Badge>
          </div>
  
          <div class="border p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">Block</h3>
            <p class="text-muted-foreground">
              {{ transaction.status.block_height || 'Pending' }}
            </p>
          </div>
  
          <div class="border p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">Time</h3>
            <p class="text-muted-foreground">
              {{ formatDate(transaction.status.block_time) }}
            </p>
          </div>
  
          <div class="border p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">Inputs</h3>
            <ul class="list-disc list-inside text-muted-foreground">
              <li v-for="input in transaction.vin" :key="input.txid">
                {{ input.prevout.scriptpubkey_address }} - {{ formatBitcoinAmount(input.prevout.value) }} BTC
              </li>
            </ul>
          </div>
  
          <div class="border p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">Outputs</h3>
            <ul class="list-disc list-inside text-muted-foreground">
              <li v-for="output in transaction.vout" :key="output.scriptpubkey">
                {{ output.scriptpubkey_address }} - {{ formatBitcoinAmount(output.value) }} BTC
              </li>
            </ul>
          </div>
  
          <div class="border p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-2">Fee</h3>
            <p class="text-muted-foreground">{{ formatBitcoinAmount(transaction.fee) }} BTC</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  
  const route = useRoute()
  const addressStore = useAddressStore()
  const keysStore = useKeysStore()
  
  const transaction = ref(null)
  const isLoading = ref(true)
  const error = ref(null)
  
  onMounted(async () => {
    try {
      const txId = route.params.id
      transaction.value = await addressStore.fetchTransactionDetails(txId)
      isLoading.value = false
    } catch (err) {
      error.value = 'Failed to load transaction details'
      isLoading.value = false
    }
  })
  
  function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString()
  }
  
  function formatBitcoinAmount(satoshis) {
    return (satoshis / 100000000).toFixed(8)
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
  }
  
  function getFreshAddress() {
    const addressCount = Object.keys(addressStore.addressesData).length
    return keysStore.getAddress("p2wpkh", addressCount)
  }
  </script>