<script lang="ts" setup>
import { storageDemo } from "~/logic/storage";
import Logo from "~/components/Logo.vue";
import browser from "webextension-polyfill";

function openOptionsPage() {
  // eslint-disable-next-line
  browser.runtime.openOptionsPage();
}
</script>

<template>
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <Logo />
    <div>Popup</div>
    <p class="mt-2 opacity-50">This is the popup page</p>
    <button class="btn mt-2" @click="openOptionsPage">Open Options</button>
    <div class="mt-2">
      <span class="opacity-50">Storage:</span> {{ storageDemo }}
    </div>
  </main>
</template>
