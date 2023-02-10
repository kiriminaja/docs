<script>
import Container from "@nuxt-themes/elements/components/globals/Container.vue"
export default {
  extends: Container
}
</script>

<template>
  <component :is="as" class="container xl:w-9/12 mx-auto">
    <slot />
  </component>
</template>
