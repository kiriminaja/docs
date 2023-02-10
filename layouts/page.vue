<template>
  <section class="py-20">
    <CustomContainer>
      <slot />
    </CustomContainer>
  </section>
</template>
<script setup lang="ts">
import CustomContainer from "~/components/globals/CustomContainer.vue";
</script>
