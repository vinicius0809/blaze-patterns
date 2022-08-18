<template>
    <div id="app">
        <v-container class="container">
            <v-row>
                <v-col></v-col>
                <v-col>
                    <h3>
                        <strong>Horários ativos</strong>
                    </h3>
                    <div v-for="(play, index) in playsStatus" :key="play.id + index">
                        <strong>{{ play.id }}:</strong> {{ sortArray(playsStatus[index].activeHours) }}
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
export default {
    props: {
        playsStatus: Array,
    },
    methods: {

        sortArray(x) {
            const array = x;
            array.sort((a, b) => {
                if (a < b)
                    return -1

                else if (a > b)
                    return 1

                else return 0;
            });
            return array;
        }
    }
};
</script>

<style>
td,
th {
    border: 1px solid black;
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

.blackBG {
    background: black;
    color: white;
}

.evidence {
    border: 3px solid blue;
}

.darkGrayBG {
    background: gray;
}

.grayBG {
    background: rgb(172, 171, 171);
}
 #app {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }
  
  .container {
    align-self: center;
  }

</style>

