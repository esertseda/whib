<template>
  <div class="bg-background border border-border rounded-chic px-4 py-2 text-gray-700">
    <span>💡</span> {{ tip }}
  </div>
</template>

<script setup>
const props = defineProps({
  tip: String
});
</script> 