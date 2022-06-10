<template>
  <div id="app">
    <PatternPlays
      :plays="plays"
    ></PatternPlays>
  </div>
</template>

<script>
import PatternPlays from "./PatternPlays";
import { db } from "./../db.js";
export default {
  data() {
    return {
      plays: new Array()
    };
  },
  components: {
    PatternPlays
  },

  firestore:{
    plays: db.collection("all-plays-assertiveness"),
  }
};
</script>

<style>
</style>