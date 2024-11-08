<template>
  <div>
<!--    <span class="vf-text-body vf-text-body&#45;&#45;4">-->
<!--&lt;!&ndash;      <button&ndash;&gt;-->
<!--&lt;!&ndash;          :class="buttonClass"&ndash;&gt;-->
<!--&lt;!&ndash;          @click="handleButtonClick"&ndash;&gt;-->
<!--&lt;!&ndash;          type="button"&ndash;&gt;-->
<!--&lt;!&ndash;      >&ndash;&gt;-->
<!--&lt;!&ndash;       View HTML Preview&ndash;&gt;-->
<!--&lt;!&ndash;      </button>&ndash;&gt;-->
<!--      -->
<!--      -->
<!--      <span v-if="!useButtonVariant"> providing this track</span>-->
<!--    </span>-->

    <button
        :class="buttonClass"
        @click="handleButtonClick"
        type="button"
    >
      <i class="fa fa-eye mr-2"></i> <!-- Optional icon for visual appeal -->
      View HTML Preview
    </button>

    <fwb-modal v-if="crateModalOpen" class="large-modal">
      <template #header>
        <div class="flex justify-between">
          <fwb-button @click="handleModalClose" color="red">
            close
          </fwb-button>
        </div>
      </template>
      <template #body>
        <iframe
            ref="iframeRef"
            :srcdoc="cratePreview"
            title="RO-Crate Preview"
            width="100%"
            height="100%"
            class="modal-iframe">
        </iframe>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {FwbButton, FwbModal} from 'flowbite-vue';
import RoCrateSingleton from '../utils/roCrateSingleton';

const props = defineProps<{
  crateUrl: string;
}>();

const useButtonVariant = ref<boolean>(false);
const cratePreview = ref<string>('');
const crateModalOpen = ref<boolean>(false);
const iframeRef = ref<HTMLIFrameElement | null>(null);

function handleButtonClick() {
  RoCrateSingleton.getHtmlContent('ro-crate-preview.html', props.crateUrl).then(
      (previewHtml: string | null) => {
        if (previewHtml !== null) {
          cratePreview.value = previewHtml;
          crateModalOpen.value = true;
        } else {
          console.error('Failed to load preview HTML content');
        }
      }
  );
}

function handleIframeMessage(event: MessageEvent) {
  if (typeof event.data !== 'string') {
    return;
  }
  if (
      !event.data.includes('multiqc') &&
      !event.data.includes('krona') &&
      !event.data.includes('ro-crate-preview')
  ) {
    return;
  }
  RoCrateSingleton.getHtmlContent(event.data, props.crateUrl).then(
      (htmlContent: string | null) => {
        if (htmlContent !== null && iframeRef.value) {
          iframeRef.value.srcdoc = htmlContent;
        } else {
          console.error('Failed to load iframe content');
        }
      }
  );
}

function handleModalClose() {
  window.removeEventListener('message', handleIframeMessage);
  crateModalOpen.value = false;
}

onMounted(() => {
  window.addEventListener('message', handleIframeMessage);
});

onUnmounted(() => {
  window.removeEventListener('message', handleIframeMessage);
});

const buttonClass = ref(
    `ro-crate-browser-button vf-button ${
        useButtonVariant.value
            ? 'vf-button--sm vf-button--secondary'
            : 'vf-button--link mg-button-as-link'
    }`
);
</script>

<style scoped>
.large-modal {
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 2000;
}

.modal-iframe {
  border: none;
  width: 100%;
  height: 90vh; /* Adjust to occupy most of the screen */
}

button {
  font-size: 1.125rem; /* Large button text */
  font-weight: 600; /* Semi-bold for emphasis */
  background-color: #00bd7e;
  color: white;
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}
</style>
