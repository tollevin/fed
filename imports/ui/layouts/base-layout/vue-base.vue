<template>
  <div id="vue-base">
    <component v-if="type === 'vue'" :is="template ? template : not-found"></component>
    <!-- We load it as a Vue component if type === 'vue'. -->
    <blaze-template v-else-if="template" :key="template" :template="layout" :data="{main: template}"/>
  </div>
</template>
<script>
  export default {
    props: {
      layout: { type: String },
      type: { type: String },
      template: { type: String },
    },
  };
</script>