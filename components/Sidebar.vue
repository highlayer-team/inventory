<template>
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
    
    <!-- Logout button moved to the bottom -->
    <div class="flex items-center justify-center mt-4">
      <Button @click="keysStore.logout" variant="outline" class="text-foreground">
        <IconsLogout class="h-4 w-4 mr-2" />
        Logout
      </Button>
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

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

function getFreshAddress() {
  const addressCount = Object.keys(addressStore.addressesData).length;
  return keysStore.getAddress("p2wpkh", addressCount);
}
</script>