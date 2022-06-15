<template>
  <div id="app">
    <v-container>
      <v-row>
        <v-col></v-col>
        <v-col>
          <h2 style="text-align: center;">Jogadas</h2>
          <table>
            <tr>
              <th></th>
              <th colspan="3" v-for="play in plays" :key="play.id">{{play.id}}</th>
            </tr>
            <tr>
              <th>Horário</th>
              <template v-for="i in plays.length">
                <th :key="'acertos'+ i">Acertos</th>
                <th :key="'erros' + i">Erros</th>
                <th :key="'diferenca' + i">Diferença</th>
              </template>
              <th>Total</th>
            </tr>
            <tr v-for="(n, index) in 24" :key="index" :class="getHourClass(index)">
              <td>{{index}}</td>
              <template v-for="play in plays">
                <td class="darkGrayBG" :key="'totalCorrect' + play.name">{{getPlayDiff(play, index).totalCorrect}}</td>
                <td class="darkGrayBG" :key="'wrongPlays' + play.name">{{getPlayDiff(play, index).wrongPlays}}</td>
                <td :class="getBGColor(getPlayDiff(play, index).difference)" :key="'difference' + play.name">
                  {{getPlayDiff(play,
                  index).difference}}</td>
              </template>
              <td :class="getBGColor(getTotalByHour(plays, index))">{{getTotalByHour(plays, index)}}</td>
            </tr>
            <tr>
              <td>Total</td>
              <td v-for="play in plays" colspan="3" :key="'total' + play.name"
                :class="getBGColor(getTotalByPattern(play))">{{getTotalByPattern(play)}}</td>
            </tr>
          </table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  export default {
    props: {
      propPlays: Array,
    },
    data() {
      return {
        plays: new Array()
      };
    },
    mounted(){
      this.plays = this.propPlays.filter(p => p.id !== 'assertiveness');
    },

    methods: {
      getHourClass(index) {
        const hour = new Date().getHours();
        if (index === hour) {
          return "evidence";
        }

        return "";
      },

      getPlayDiff(plays, index) {
        const property = index.toString().padStart(2, '0') + "_" + (index + 1).toString().padStart(2, '0');

        let result = plays[property];

        return result ? result : {difference: 0, totalCorrect: 0, wrongPlays: 0};
      },

      getTotalByHour(plays, index) {
        let total = 0;

        plays.forEach(element => {
          if (element.id != "assertiveness") {
            total += this.getPlayDiff(element, index).difference
          }
        });

        return total;
      },

      getTotalByPattern(playPattern) {
        let total = 0;
        Object.values(playPattern).forEach(element => {
          if (typeof element !== "string")
            total += element.difference
        });
        return total;
      },
      getPatternCount(plays) {
        return (plays.length - 1) * 3
      },

      getBGColor(value) {
        if (value > 0)
          return "greenBG";

        if (value < 0)
          return "redBG";

        return "grayBG";
      }
    }
  };
</script>

<style>
  td,
  th {
    border: 1px solid #dddddd;
    padding: 8px;
  }

  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
    text-align: center;
  }

  h2 {
    text-align: left;
  }

  .greenBG {
    background: #14C38E;
  }

  .redBG {
    background: #F24C4C;
  }

  .evidence {
    border: 3px solid yellow;
  }

  .darkGrayBG {
    background: gray;
  }

  .grayBG {
    background: rgb(172, 171, 171);
  }
</style>