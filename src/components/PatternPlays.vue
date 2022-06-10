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
              <th colspan="3">PVPVP</th>
              <th colspan="3">PVVPPV</th>
              <th colspan="3">VPPPV</th>
              <th colspan="3">VVVVV</th>
            </tr>
            <tr >
              <th>Horário</th>
              <template v-for="i in 4">
                <th :key="'acertos'+i">Acertos</th>
                <th :key="'erros' + i">Erros</th>
                <th :key="'diferenca' + i">Diferença</th>
              </template>
              <th>Total</th>
            </tr>
            <tr v-for="(n, index) in 24" :key="index" :class="getHourClass(index)">
              <td>{{index}}</td>
              <td class="darkGrayBG">{{getPlayDiff(plays[0], index).totalCorrect}}</td>
              <td class="darkGrayBG">{{getPlayDiff(plays[0], index).wrongPlays}}</td>
              <td :class="getBGColor(getPlayDiff(plays[0], index).difference)">{{getPlayDiff(plays[0], index).difference}}</td>
              <td class="darkGrayBG">{{getPlayDiff(plays[1], index).totalCorrect}}</td>
              <td class="darkGrayBG">{{getPlayDiff(plays[1], index).wrongPlays}}</td>
              <td :class="getBGColor(getPlayDiff(plays[1], index).difference)">{{getPlayDiff(plays[1], index).difference}}</td>
              <td class="darkGrayBG">{{getPlayDiff(plays[2], index).totalCorrect}}</td>
              <td class="darkGrayBG">{{getPlayDiff(plays[2], index).wrongPlays}}</td>
              <td :class="getBGColor(getPlayDiff(plays[2], index).difference)">{{getPlayDiff(plays[2], index).difference}}</td>
              <td class="darkGrayBG">{{getPlayDiff(plays[3], index).totalCorrect}}</td>
              <td class="darkGrayBG">{{getPlayDiff(plays[3], index).wrongPlays}}</td>
              <td :class="getBGColor(getPlayDiff(plays[3], index).difference)">{{getPlayDiff(plays[3], index).difference}}</td>
              <td :class="getBGColor(getTotalByHour(plays, index))">{{getTotalByHour(plays, index)}}</td>
            </tr>
            <tr>
              <td>Total</td>
               <td colspan="3" :class="getBGColor(getTotalByPattern(plays[0]))">{{getTotalByPattern(plays[0])}}</td>
               <td colspan="3" :class="getBGColor(getTotalByPattern(plays[1]))">{{getTotalByPattern(plays[1])}}</td>
               <td colspan="3" :class="getBGColor(getTotalByPattern(plays[2]))">{{getTotalByPattern(plays[2])}}</td>
               <td colspan="3" :class="getBGColor(getTotalByPattern(plays[3]))">{{getTotalByPattern(plays[3])}}</td>
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
    plays: Array,
  },
  data() {
    return {};
  },

  methods:{
    getHourClass(index){
      const hour = new Date().getHours();
      if(index === hour){
        return "evidence";
      }

      return "";
    },

getPlayDiff(plays, index){
  console.log(plays)
  const property = index.toString().padStart(2, '0') + "_" + (index + 1).toString().padStart(2, '0');
  return plays[property];
},

getTotalByHour(plays, index){
let total = 0;
const property = index.toString().padStart(2, '0') + "_" + (index + 1).toString().padStart(2, '0');

plays.forEach(element => {
  if(element.id != "assertiveness"){
  total += element[property].difference
  }
});

return total;
},

getTotalByPattern(playPattern){
  let total = 0;
  Object.values(playPattern).forEach(element => {
  if(element.id != "assertiveness"){
  total += element.difference
  }
});
return total;
},
getPatternCount(plays){
  return (plays.length-1) * 3
},

getBGColor(value){
        if(value > 0)
          return "greenBG";

        if(value < 0)
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

.greenBG{
  background: #14C38E;
}

.redBG{
background:#F24C4C;
}

.evidence{
  border: 3px solid yellow;
}

.darkGrayBG{
  background: gray;
}

.grayBG{
  background: rgb(172, 171, 171);
}




</style>