<template>
  <div id="app">
    <plays
      :plays="plays"
    ></plays>
  </div>
</template>

<script>
import Plays from "./Plays";
import { db } from "./../db.js";
export default {
  data() {
    return {
      plays: new Array(),
      currentRoute: window.location.pathname,
      openCart: {
        items: new Array(),
        isOpen: true,
        id: "",
      },
    };
  },
  components: {
    plays: Plays,
  },

  firestore:{
    plays: db.collection("all-plays-assertiveness"),
  },
  methods: {
    changeRoute(routeName) {
      var current = window.location.pathname;
      var split = current.split("/");
      var textToReplace = split[split.length - 1];

      if (textToReplace == "") {
        window.location.pathname = this.currentRoute + routeName;
      } else if (textToReplace == routeName) {
        console.log("Tentou acessar a mesma url...");
      } else {
        window.location.pathname = this.currentRoute.replace(
          textToReplace,
          routeName
        );
      }
    },

    // async addItemToCart(item) {
    //   const position = this.positionOnCart(item);
    //   if (position > -1) {
    //     this.openCart.items[position].quantity += item.quantity;
    //     docRef.set(this.openCart.items[position]);
    //   } else {
    //     this.openCart.items.push(item);
    //     docRef.set(item);
    //   }
    // },
    removeItemFromCart(item) {
      const position = this.positionOnCart(item);
      var docRef = db
        .collection("cart")
        .doc(this.openCart.id)
        .collection("items")
        .doc(item.id);

      if (position > -1) {
        if (this.openCart.items[position].quantity > 1) {
          this.openCart.items[position].quantity -= item.quantity;
          docRef.set(this.openCart.items[position]);
        } else {
          this.openCart.items.splice(position, 1);
          docRef.delete();
        }
      }
    },
    positionOnCart(item) {
      for (let i = 0; i < this.openCart.items.length; i++) {
        const element = this.openCart.items[i];
        if (element.id == item.id && element.quantity > 0) {
          return i;
        }
      }
      return -1;
    },
  },
  mounted() {
    db.collection("cart")
      .where("isOpen", "==", true)
      .limit(1)
      .get()
      .then((response) => {
        response.forEach((document) => {
          db.collection("cart")
            .doc(document.data().id)
            .collection("items")
            .get()
            .then((resp) => {
              resp.forEach((doc) => {
                this.openCart.items.push(doc.data());
              });
              this.openCart.id = document.data().id;
            });
        });
      });
  },
};
</script>

<style>
</style>