<template>
  <div id="home">
    <div class="inputs">
      <div class="start-date">
        <label for="start-date"><strong>Data Início: </strong></label>
        <input v-model="startDate" type="date" id="start-date" />
      </div>
      <div class="end-date">
        <label for="end-date"><strong>Data Fim: </strong></label>
        <input v-model="endDate" type="date" id="end-date" />
      </div>
      <div class="button-search">
        <button @click="searchDataBase()" type="button">Filtrar</button>
      </div>
    </div>
    <div class="component">
      <PatternPlays class="pattern-plays" :propPlays="plays" :playsStatus="playsStatus" :doubleResults="doubleResults"></PatternPlays>
    </div>
  </div>
</template>

<script>
  /* eslint-disable */
  import PatternPlays from "./PatternPlays";
  import { realtimeDb, firestoreDb } from "./../db.js";
  export default {
    data() {
      return {
        plays: new Array(),
        playsStatus: new Array(),
        doubleResults: [],
        startDate: '',
        endDate: ''
      };
    },
    components: {
      PatternPlays
    },
    methods: {
      async searchDataBase() {
        const dbRef = firestoreDb.collection("played-colors");
        const realtimeDbRef = realtimeDb.ref("played-colors");
        let playedColors = [];
        const today = new Date();

        if (this.startDate > '2022-06-22') {
          await realtimeDbRef
            .orderByChild('timePlayed')
            .startAt(this.startDate + "T03:00:00Z")
            .endAt(this.getNextDay(this.getEndDate()) + "T02:59:59Z")
            .once('value', (snapshot) => {
              snapshot.forEach((doc) => {
                playedColors.push(doc.val());
              });
            });
            console.log("Consultou no realtime database")
        }
        else {
          await dbRef
            .where("timePlayed", ">=", this.startDate + "T03:00:00Z")
            .where("timePlayed", "<=", this.getNextDay(this.getEndDate()) + "T02:59:59Z")
            .get()
            .then(querySnapshot => {
              querySnapshot.forEach((doc) => {
                playedColors.push(doc.data());
              });
            });
            
            console.log("Consultou no firestore")
        }

        const groupedPlays = this.groupByPlays(playedColors);
        const groupedAndAdjustedPlays = this.adjustPlays(groupedPlays);
        const calculatedPlays = this.calculatePlays(groupedAndAdjustedPlays);
        this.plays = calculatedPlays;
      },
      getEndDate() {
        return this.endDate === '' ? this.startDate : this.endDate;
      },
      getNextDay(dateStr) {
        let date = new Date(dateStr);
        date.setDate(date.getDate() + 2);
        return "" + date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate().toString().padStart(2, '0');
      },
      calculatePlays(groupedAndAdjustedPlays) {
        let result = [];

        groupedAndAdjustedPlays.forEach(groupedPlay => {
          let obj = {};
          for (let i = 0; i < 24; i++) {
            const property = i.toString().padStart(2, '0') + "_" + (i + 1).toString().padStart(2, '0');
            obj[property] = {
              totalCorrect: 0,
              wrongPlays: 0,
              difference: 0
            }
          }

          groupedPlay.forEach(play => {
            const hour = this.getHourUtcMinus3(parseInt(play.plays[play.plays.length - 1].timePlayed.split("T")[1].split(":")[0]));
            const prop = hour.toString().padStart(2, '0') + "_" + (parseInt(hour) + 1).toString().padStart(2, '0');
            if (play.plays.find(p => p.correct === "SG" || p.correct === "G1" || p.correct === "G2" || p.correct === "G3")) {
              obj[prop].totalCorrect++;
            }
            else {
              obj[prop].wrongPlays += play.plays.length === 3 ? 7 : play.plays.length === 2 ? 3 : 1;
            }
            obj[prop].difference = obj[prop].totalCorrect - obj[prop].wrongPlays;
            obj["id"] = play.plays[0].patternName;
          })

          result.push(obj);
        });
        return result;
      },
      getHourUtcMinus3(hour) {
        let result = 0;
        switch (hour) {
          case 2:
          result = 23;
            break;
          case 1:
          result = 22;
            break;
          case 0:
          result = 21;
            break;
          default:
          result = hour - 3;
            break;
        }
        return result;
      },
      adjustPlays(groupedPlays) {
        let result = [];

        for (let i = 0; i < groupedPlays.length; i++) {
          result.push(this.getAdjustedPlays(groupedPlays, i))
        }

        return result;
      },
      getAdjustedPlays(groupedPlays, index) {
        let distinctPlays = [];
        let arrayWithPlays = [];

        groupedPlays[index].forEach(play => {
          if (!distinctPlays.includes(play.playId)) {
            distinctPlays.push(play.playId);
          }
        });

        distinctPlays.forEach(distinctPlay => {
          let objPlay = { playId: distinctPlay, plays: [] };
          groupedPlays[index].forEach(play => {
            if (play.playId === distinctPlay) {
              play["id"] = play.patternName;
              objPlay.plays.push(play);
            }
          });
          arrayWithPlays.push(objPlay);
        });
        return arrayWithPlays;
      },
      groupByPlays(playedColors) {
        let pvpvp = [];
        let pvvppv = [];
        let vpppv = [];
        let vvvvv = [];
        let outro = [];

        playedColors.forEach(pc => {
          pc.patternName = this.getPatternName(pc.patternName);
          switch (pc.patternName) {
            case "PVPVP":
              pvpvp.push(pc);
              break;

            case "PVVPPV":
              pvvppv.push(pc);
              break;

            case "VPPPV":
              vpppv.push(pc);
              break;

            case "VVVVV":
              vvvvv.push(pc);
              break;

            default:
              outro.push(pc);
              break;
          }
        });
        return [pvpvp, pvvppv, vpppv, outro, vvvvv];
      },

      getPatternName(pattern) {
        let result = "";

        switch (pattern) {
          case "PVPVP":
          case "VPVPV":
            result = "PVPVP";
            break;

          case "PVVPPV":
          case "VPPVVP":
            result = "PVVPPV";
            break;

          case "VPPPV":
          case "PVVVP":
            result = "VPPPV";
            break;

          case "VVVVV":
          case "PPPPP":
            result = "VVVVV";
            break;

          case "VVPVVPVV":
          case "PPVPPVPP":
            result = "VVPVVPVV";
            break;

          default:
            break;
        }

        return result;
      },
      // async getLastColor(){
      //   let lastResults = [];
      //   setInterval(async ()=>{
      //     if(lastResults.length === 10){
      //       lastResults.shift();
      //       await firestoreDb.collection("double-results").limit(1).orderBy("created_at", "desc").get().then(snapShot=> {
      //         snapShot.forEach(r=>{
      //           lastResults.push(r.data());
      //         })
      //       });
            
      //     }
      //     else{
      //       await firestoreDb.collection("double-results").limit(10).orderBy("created_at", "desc").get().then(snapShot=> {
      //         snapShot.forEach(r=>{
      //           lastResults.push(r.data());
      //         })
      //       });

      //       lastResults.reverse();

      //     }
      //     this.doubleResults = lastResults;
      // }, 30000);
      // }
    },
    firestore: {
      plays: firestoreDb.collection("all-plays-assertiveness"),
      // playsStatus: firestoreDb.collection("plays"),
    },
    // async mounted(){
    //    await this.getLastColor()
    // }
  };
</script>

<style>
  #home {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }

  .inputs {
    align-self: center;
  }

  .button-search {
    box-shadow: 0px 10px 14px -7px #3e7327;
    background: linear-gradient(to bottom, #77b55a 5%, #72b352 100%);
    background-color: #77b55a;
    border-radius: 4px;
    border: 1px solid #4b8f29;
    display: inline-block;
    cursor: pointer;
    color: #ffffff;
    font-family: Arial;
    font-size: 13px;
    font-weight: bold;
    text-decoration: none;
    text-shadow: 0px 1px 0px #5b8a3c;
  }

  .button-search:hover {
    background: linear-gradient(to bottom, #72b352 5%, #77b55a 100%);
    background-color: #72b352;
  }

  .button-search:active {
    position: relative;
    top: 1px;
  }
</style>