# Vue RO-Crate Browser

A Vue.js component for browsing self-contained RO-Crates with ease. This package helps you display and explore RO-Crate metadata seamlessly within your Vue applications.

## Installation

Install the package using npm or Yarn:

```bash
npm install vue-ro-crate-browser
````

## Usage

```
<template>
  <RoCrateBrowser :crateUrl="crateUrl" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RoCrateBrowser } from 'vue-ro-crate-browser';

export default defineComponent({
  components: {
    RoCrateBrowser
  },
  data() {
    return {
      crateUrl: 'https://example.com/path/to/ro-crate.zip'
    };
  }
});
</script>
```

## Author

Mahfouz Shehu