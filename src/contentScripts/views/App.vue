<script lang="ts" setup>
import { useToggle } from "@vueuse/core";
import "../../styles";

const [show, toggle] = useToggle(false);
</script>

<template>
  <div
    class="fixed right-0 bottom-0 m-5 z-100 flex font-sans select-none leading-1em"
  >
    <div
      :class="show ? 'opacity-100' : 'opacity-0'"
      class="bg-white text-gray-800 rounded-full shadow w-max h-min"
      m="y-auto r-2"
      p="x-4 y-2"
      transition="opacity duration-300"
    >
      Vitesse WebExt
    </div>
    <div
      bg="teal-600 hover:teal-700"
      class="flex w-10 h-10 rounded-full shadow cursor-pointer"
      @click="toggle()"
    >
      <pixelarticons-power class="block m-auto text-white text-lg" />
    </div>
  </div>
</template>
