<template>
  <v-app id="inspire">
    <v-content>
      <v-container fluid>
        <HomeApp></HomeApp>
      </v-container>
    </v-content>

    <v-footer app>
      <span>&copy; 2022</span>
    </v-footer>
  </v-app>
</template>

<script>
import HomeApp from "./components/HomeApp.vue";
export default {
  props: {
    source: String,
  },
  data: () => ({
    drawer: null,
    currentRoute: window.location.pathname,
  }),
  components: {
    HomeApp
  },
};
</script>