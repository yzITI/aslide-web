<script setup>
import OverlayLoading from './components/OverlayLoading.vue'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <KeepAlive>
        <Component :is="Component" />
      </KeepAlive>
    </Transition>
  </RouterView>
  <OverlayLoading></OverlayLoading>
</template>
