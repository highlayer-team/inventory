<template>
    <div class="dark">
    <LoginScreen v-if="!keysManager.account"></LoginScreen>
    <slot v-else />
    </div>
</template>
<script setup>
let keysManager=useKeysStore()
</script>
