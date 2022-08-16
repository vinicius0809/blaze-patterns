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
  created() {
    // eslint-disable-next-line
    if (!window.console) console = {log: function() {}}; 
    // this.$vuetify.theme.dark = true;
  },
  methods: {    
  },
  components: {
    HomeApp
  },
};
</script>