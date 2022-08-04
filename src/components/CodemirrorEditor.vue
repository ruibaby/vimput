<script lang="ts" setup>
import { computed, nextTick, ref, shallowRef, watch } from "vue";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { onBeforeUnmount, onMounted } from "vue-demi";
import { vim, Vim } from "@replit/codemirror-vim";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  visible: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 700,
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:visible",
  "update:modelValue",
  "change",
  "close",
]);

const rootVisible = ref(false);
const modelWrapper = ref<HTMLElement>();
const editorWrapper = shallowRef<HTMLDivElement>();
const cmState = shallowRef<EditorState>();
const cmView = shallowRef<EditorView>();

const wrapperClasses = computed(() => {
  return {
    "modal-wrapper-fullscreen": props.fullscreen,
  };
});

const contentStyles = computed(() => {
  return {
    maxWidth: props.width + "px",
  };
});

const customTheme = EditorView.theme({
  "&": {
    height: "50vh",
  },
});

function handleClose() {
  emit("update:visible", false);
  emit("close");
}

Vim.defineEx("w", "w", function () {
  emit("change", cmView.value?.state.doc.toString());
});

Vim.defineEx("wq", "wq", function () {
  emit("change", cmView.value?.state.doc.toString());
  handleClose();
});

Vim.defineEx("q", "q", function () {
  handleClose();
});

const createCmEditor = () => {
  cmState.value = EditorState.create({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      EditorView.lineWrapping,
      customTheme,
      vim({
        status: true,
      }),
      EditorView.updateListener.of((viewUpdate) => {
        if (viewUpdate.docChanged) {
          const doc = viewUpdate.state.doc.toString();
          emit("update:modelValue", doc);
        }
      }),
    ],
  });

  cmView.value = new EditorView({
    state: cmState.value,
    parent: editorWrapper.value,
  });
};

onMounted(() => {
  createCmEditor();
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue !== cmView.value?.state.doc.toString()) {
        cmView.value?.dispatch({
          changes: {
            from: 0,
            to: cmView.value?.state.doc.length,
            insert: newValue,
          },
        });
      }
    }
  );
});

onBeforeUnmount(() => {
  if (cmView.value) {
    cmView.value.destroy();
  }
});

watch(
  () => props.visible,
  () => {
    if (props.visible) {
      nextTick(() => {
        modelWrapper.value?.focus();
        editorWrapper.value?.focus();
        cmView.value?.focus();
      });
    }
  }
);
</script>
<template>
  <div
    v-show="rootVisible"
    ref="modelWrapper"
    :class="wrapperClasses"
    aria-modal="true"
    class="modal-wrapper"
    role="dialog"
    tabindex="0"
    @keyup.esc="handleClose()"
  >
    <transition
      enter-active-class="ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @before-enter="rootVisible = true"
      @after-leave="rootVisible = false"
    >
      <div v-show="visible" class="modal-layer" @click="handleClose()" />
    </transition>
    <transition
      enter-active-class="ease-out duration-200"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div
        v-show="visible"
        :style="contentStyles"
        class="modal-content transform transition-all"
      >
        <div class="modal-header">
          <slot name="header">
            <div class="modal-header-title">Vim Editor</div>
            <div class="modal-header-actions flex flex-row">
              <slot name="actions"></slot>
              <div class="modal-header-action" @click="handleClose()">X</div>
            </div>
          </slot>
        </div>
        <div class="modal-body">
          <div ref="editorWrapper" class="codemirror-wrapper contents"></div>
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
.modal-wrapper {
  @apply fixed
  top-0
  left-0
  h-full
  w-full
  flex
  flex-row
  items-center
  justify-center;
  z-index: 999;

  .modal-layer {
    @apply flex-none
    absolute
    top-0
    left-0
    h-full
    w-full
    transition-opacity
    bg-gray-500
    bg-opacity-75;
  }

  .modal-content {
    @apply flex
    flex-col
    relative
    bg-white
    items-stretch
    shadow-xl
    rounded-sm;
    width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);

    .modal-header {
      @apply flex
      justify-between
      border-b;

      .modal-header-title {
        @apply self-center
        text-base
        font-bold;
        padding: 12px 16px;
      }

      .modal-header-actions {
        @apply self-center
        h-full;
        .modal-header-action {
          @apply cursor-pointer;
          padding: 12px 16px;

          &:hover {
            @apply bg-gray-100;
          }
        }
      }
    }

    .modal-body {
      @apply overflow-y-auto
      overflow-x-hidden
      flex-1
      h-auto;
      word-wrap: break-word;
      padding: 12px 16px;
    }

    .modal-footer {
      @apply border-t;
      padding: 12px 16px;
    }
  }

  &.modal-wrapper-fullscreen {
    .modal-content {
      width: 100vw !important;
      max-width: 100vw !important;
      height: 100vh !important;
      max-height: 100vh !important;
      border-radius: 0;
    }
  }
}
</style>
