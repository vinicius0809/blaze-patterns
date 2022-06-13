<template>
  <div id="app">
  <label for="start-date">Data Início</label>
  <input v-model="startDate" type="date" id="start-date"/>
  <label for="end-date">Data Fim</label>
  <input v-model="endDate" type="date" id="end-date"/>
  <button class="search" @click="searchDataBase()">Filtrar</button>
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
      plays: new Array(),
      startDate: '',
      endDate: ''
    };
  },
  components: {
    PatternPlays
  },
  methods:{
    async searchDataBase(){
      const dbRef =  db.collection("played-colors")
      let result = [];
      await dbRef
      .where("timePlayed", ">=", this.startDate + "T00:00:00Z")
      .where("timePlayed", "<=", this.endDate + "T23:59:59Z")
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            result.push(doc.data());
        });
      })
      console.log(result);
    }
  },
  firestore:{
    plays: db.collection("all-plays-assertiveness"),
  }
};
</script>

<style>
</style>