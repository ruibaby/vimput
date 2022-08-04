/* eslint-disable no-console */
import { onMessage } from "webext-bridge";
import { createApp } from "vue";
import CodemirrorEditor from "~/components/CodemirrorEditor.vue";

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  // mount component to context window
  const container = document.createElement("div");
  const root = document.createElement("div");
  const styleEl = document.createElement("link");
  const shadowDOM =
    container.attachShadow?.({ mode: __DEV__ ? "open" : "closed" }) ||
    container;
  styleEl.setAttribute("rel", "stylesheet");
  styleEl.setAttribute(
    "href",
    browser.runtime.getURL("dist/contentScripts/style.css")
  );
  shadowDOM.appendChild(styleEl);
  shadowDOM.appendChild(root);
  document.body.appendChild(container);

  console.info("[vitesse-webext] Hello world from content script");

  // communication example: send previous tab title from background page
  onMessage("tab-prev", ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data.title}"`);
  });

  const inputDom = document.querySelectorAll("input");

  inputDom.forEach((input) => {
    input.addEventListener("keyup", (e) => {
      if (e.ctrlKey && e.code === "KeyI") {
        console.log("[vitesse-webext] Ctrl+I", e);
        e.preventDefault();
        e.stopPropagation();

        const rootComponent = defineComponent({
          components: {
            CodemirrorEditor,
          },
          data() {
            return {
              value: e.target.value,
              visible: false,
            };
          },
          template: `
            <CodemirrorEditor :model-value="value" v-model:visible="visible" @change="handleChange"
                              @close="handleClose"/>`,
          mounted() {
            setTimeout(() => {
              this.visible = true;
            }, 200);
          },
          methods: {
            handleChange(value) {
              e.target.value = value;
            },
            handleClose() {
              e.target.focus();
              setTimeout(() => {
                app.unmount();
              }, 1000);
            },
          },
        });

        const app = createApp(rootComponent);

        app.mount(root);
      }
    });
  });
})();
