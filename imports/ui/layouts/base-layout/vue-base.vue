<template>
  <component v-if="type === 'vue'" :is="body ? body : not-found"></component>
  <!-- We load it as a Vue component if type === 'vue'. -->
  <blaze-template v-else-if="body" :key="body" :template="layout" :data="{main: body}"/>
</template>
<script>
  export default {
    props: {
      layout: { type: String },
      type: { type: String },
      body: { type: String },
    },
  };
</script>