<template>
  <v-app id="inspire">
    <!-- <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <v-list-item link @click="changeRoute('')">
          <v-list-item-action>
            <v-icon>mdi-store</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Loja</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="changeRoute('buy')">
          <v-list-item-action>
            <v-icon>mdi-cart-plus</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Nova Compra</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="changeRoute('store')">
          <v-list-item-action>
            <v-icon>mdi-table</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Estoque</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="changeRoute('history')">
          <v-list-item-action>
            <v-icon>mdi-chart-histogram</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Histórico Compras</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="changeRoute('averages')">
          <v-list-item-action>
            <v-icon>mdi-contrast</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Estimativas</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer> -->

    <!-- <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Controle de Estoque</v-toolbar-title>
    </v-app-bar> -->

    <v-content>
      <v-container fluid>
        <app-Buy></app-Buy>
      </v-container>
    </v-content>

    <v-footer app>
      <span>&copy; 2022</span>
    </v-footer>
  </v-app>
</template>

<script>
import Buy from "./components/Buy.vue";
export default {
  props: {
    source: String,
  },
  data: () => ({
    drawer: null,
    currentRoute: window.location.pathname,
  }),
  created() {
    this.$vuetify.theme.dark = true;
    console.log(this.currentRoute);
  },
  methods: {
    changeRoute(routeName) {
      var current = window.location.pathname;
      var split = current.split("/");
      var textToReplace = split[split.length - 1];

      if (textToReplace == "") {
        window.location.pathname = this.getCurrentRoute() + routeName;
      } else if (textToReplace == routeName) {
        console.log("Tentou acessar a mesma url...");
      } else {
        window.location.pathname = this.getCurrentRoute().replace(
          textToReplace,
          routeName
        );
      }
    },
    getCurrentRoute() {
      return this.currentRoute;
    },
    routeStock() {
      return this.getCurrentRoute().includes("/store");
    },
    routeShop() {
      return (
        this.getCurrentRoute().includes("/") &&
        !this.routeStock() &&
        !this.routeBuy() 
      );
    },
    routeBuy() {
      return this.getCurrentRoute().includes("/buy");
    },
  },
  components: {
    appBuy: Buy,
  },
};
</script>