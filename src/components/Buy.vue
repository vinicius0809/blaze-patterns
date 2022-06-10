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
      plays: new Array()
    };
  },
  components: {
    plays: Plays,
  },

  firestore:{
    plays: db.collection("all-plays-assertiveness"),
  }
};
</script>

<style>
</style>