<template>
    <div class="dark">
 
    <LoginScreen v-if="!keysManager.account"></LoginScreen>
    <div v-else class="flex h-screen flex-row items-stretch justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Sidebar></Sidebar>
        <slot  />
    </div>
    </div>
</template>
<script setup>
let keysManager=useKeysStore()
</script>
