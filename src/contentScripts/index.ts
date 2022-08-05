import { createApp, defineComponent } from "vue";
import CodemirrorEditor from "~/components/CodemirrorEditor.vue";
import browser from "webextension-polyfill";

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

  const inputElements = document.querySelectorAll("input");
  const textareaElements = document.querySelectorAll("textarea");

  inputElements.forEach((input) => {
    bindKeyboardShortcuts(input);
  });

  textareaElements.forEach((textarea) => {
    bindKeyboardShortcuts(textarea);
  });

  function bindKeyboardShortcuts(element: HTMLElement) {
    element.addEventListener("keyup", (e) => {
      const target = e.target as HTMLInputElement;

      if (e.ctrlKey && e.code === "KeyI") {
        const rootComponent = defineComponent({
          components: {
            CodemirrorEditor,
          },
          data() {
            return {
              value: target.value,
            };
          },
          template: `
            <CodemirrorEditor :model-value="value" @change="onValueChange" @close="onClose"/>`,
          methods: {
            onValueChange(value) {
              target.value = value;
            },
            onClose() {
              setTimeout(function () {
                target.focus();
                app.unmount();
              }, 100);
            },
          },
        });

        const app = createApp(rootComponent);
        app.mount(root);

        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
})();
