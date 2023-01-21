<template>
  <div id="app">
    <div class="container">
      <strong>{{ timerCountdown }}</strong>
      <canvas ref="canvas" id="crash-chart"></canvas>
      <!-- <button @click="renderChart()">Update Chart!</button> -->
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import { realtimeDb } from "./../db.js";
import { getGroupedData } from "./../util.js";
Chart.register(...registerables);

export default {
  props: {
    groupedData: Array,
    originalResult: Array,
  },
  data() {
    return {
      chart: null,
      timerCountdown: 3,
      timerEnabled: true,
      groupedDataLocal: this.groupedData,
      result: this.originalResult
    }
  },
  watch: {
    timerCountdown: {
      async handler(value) {
        if (value > 0 && this.timerEnabled) {
          setTimeout(() => {
            this.timerCountdown--;
          }, 1000);
        } else if (value <= 0) {
          await realtimeDb.ref("crash-results")
            .orderByChild('created_at')
            .startAt(this.result[this.result.length - 1].created_at)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                this.result.push(doc.val());
              })              
            })
            .then(() => {
                  this.result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                  const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000); // 2 hours in milliseconds
                  this.result = this.result.filter(item => new Date(item.created_at) >= twoHoursAgo);
                
                });
                
          this.groupedDataLocal = getGroupedData(this.result)
          this.renderChart();
          this.timerCountdown = 30;
        }
      },
    }
  },
  methods: {
    renderChart() {
      if (this.chart) this.chart.destroy();
      let ctx = this.$refs.canvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.groupedDataLocal.map(d => d.dateTime),
          datasets: [{
            //     label: 'Max Crash Point',
            //     data: this.groupedDataLocal.map(d => d.crashPoint),
            //     backgroundColor: 'rgba(255, 99, 132, 0.2)',
            //     borderColor: 'rgba(255, 99, 132, 1)',
            //     borderWidth: 1,            
            //     trendlineLinear: {
            //       style: 'rgba(255, 0, 0, 1)',
            //       width: 2
            //     },
            // },
            // {
            //     label: 'Média móvel de todos os resultados do minuto',
            //     data: this.groupedDataLocal.map(d => d.movingAverage),
            //     backgroundColor: 'blue',
            //     borderWidth: 1,
            //     type: 'line',
            //     pointRadius: 0,
            //     fill: false,
            //     lineTension: 0,
            //     borderDash: [8, 4],
            //     borderColor: "blue",
            //     pointStyle: "rectRounded"
            // },
            //   {
            label: 'Média móvel dos maiores resultados do minuto',
            data: this.groupedDataLocal.map(d => d.movingAverageFromGroup),
            backgroundColor: 'black',
            borderWidth: 3,
            type: 'line',
            pointRadius: 1,
            fill: false,
            lineTension: 0.5,
            borderColor: "black",
            pointStyle: "rectRounded"
          },
          {
            label: 'Tendência',
            data: this.groupedDataLocal.map(d => d.trend),
            backgroundColor: "rgba(74, 255, 145, 0.1)",
            borderWidth: 0.3,
            type: 'line',
            stepped: true,
            pointRadius: 0,
            fill: true,
            lineTension: 0,
            borderColor: "green",
            pointStyle: "rectRounded"
          }]
        },
        options: {
          scales: {
            xAxes: [{
              type: 'time',
              distribution: 'series',
              time: {
                unit: 'minute'
              }
            }],
            yAxes: [{
              beginAtZero: false
            }]
          },
          elements: {
            point: {
              radius: 0
            }
          }
        }
      });
    }
  },
  mounted() {
    setTimeout(() => {
      this.timerCountdown--;
    }, 1000);
    this.renderChart();
  }
}
</script>

<style>
td,
th {
  border: 1px solid black;
  padding: 8px;
}

#app{
  display: flex;    
  width:90vw;  
  justify-content: center;
  flex-wrap: nowrap;
  align-items: stretch;
  align-content: stretch;
}
.container {
  flex-direction: column;
  justify-content: center;
  width: 100%;
  text-align: center;  
  flex-grow: 0;    
}
</style>

