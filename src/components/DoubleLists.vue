<template>
    <div id="app">
        <div class="container">
            <h1>LISTA DE DOUBLE DA BLAZE</h1>
            <h2>Legenda: 💚 = SG / ✅ = G1 / ❌ = LOSS (Utilizar relógio da Blaze)</h2>
            <h3>Acertos / Erros: 💚 = {{getAllOcurrencies('💚')}} / ✅ = {{getAllOcurrencies('✅')}} / ⚪️ =
                {{getAllOcurrencies('⚪️💚') + getAllOcurrencies('⚪️✅')}} / ❌ =
                {{getAllOcurrencies('❌')}} / Saldo Geral: <label
                    class="win">{{getAllOcurrencies('💚')+getAllOcurrencies('✅')}}</label> / <label
                    class="loss">{{getAllOcurrencies('❌')}}</label></h3>
            <template v-if="!haveList">
                <label for="input-list">Insiraa a lista de sinais, separados por vírgula (,)</label>
                <textarea name="input-list" id="input-list" cols="30" rows="10" v-model="list"></textarea>
                <button @click="getResultFromFirebase(firstFromList)">Processar</button>
            </template>
            <template v-else>
                <!-- <button @click="nextList()">Iniciar nova lista</button> -->
                <h2>Atualização em {{ timerCountdown }}</h2>
            </template>
            <div v-if="numberOfTables > 0" class="tables">
                <table v-for="i in numberOfTables" :key="i" class="table">
                    <tr>
                        <th></th>
                        <th>Minuto</th>
                        <th>Possível</th>
                        <th>Resultado</th>
                    </tr>
                    <tr v-for="result in getResults(i)" :key="result.time + 'i'" :class="getRowClass(result)">
                        <td><strong>{{result.index}}</strong></td>
                        <td>{{ `${correctTime(result.time.getHours())}:${correctTime(result.time.getMinutes())}`}}</td>
                        <td>{{ result.possibleValue }}</td>
                        <td>{{ result.result }}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { firestoreDb } from "./../db.js";
export default {
    data() {
        return {
            timerCountdown: 10,
            timerEnabled: false,
            haveList: false,
            list: '',
            actualResults: new Array(),
            results: new Array(),
            reverseColorAfter: ''
        };
    },
    watch: {
        timerEnabled(value) {
            if (value) {
                setTimeout(() => {
                }, 1000);
            }
        },
        timerCountdown: {
            handler(value) {
                if (value > 0 && this.timerEnabled) {
                    setTimeout(() => {
                        this.timerCountdown--;
                    }, 1000);
                } else if (value <= 0) {
                    this.getResultFromFirebase(this.firstFromList);
                }
            },
        }
    },
    methods: {
        getAllOcurrencies(str) {
            let count = 0;
            this.results.forEach(r => {
                count += r.result.includes(str) ? 1 : 0;
            });
            return count;
        },
        getResults(index) {
            let max = -1 + index * 10;
            // max = this.results.length < max ? this.results.length : max;
            let start = max - 9;
            let result = new Array();

            if (start > -1) {
                for (let i = start; (i <= max && i < this.results.length); i++) {
                    const element = { ...this.results[i], index: i + 1 };
                    result.push(element);
                }
            }

            return result;
        },
        nextList() {
            this.haveList = false;
            this.timerEnabled = false;
        },
        listMinutes() {
            return this.list.split(',');
        },
        correctTime(h) {
            return h.toString().padStart(2, '0');
        },
        getRowClass(d) {
            let result = '';
            if (d.next) {
                result = 'next';
            }
            return result;
        },
        updateResults() {
            let data = new Array();

            this.listMinutesInDate.forEach(d => {
                let hasNext = false;
                data.forEach(el => {
                    if (el.next) {
                        hasNext = true;
                    }
                });
                let obj = { time: d.date, next: d.date > new Date() && !hasNext, result: this.getResult(d), possibleValue: d.possibleValue }
                data.push(obj);
            });

            // data = this.reverseColorOnLoss(data);
            this.results = data;
        },
        reverseColorOnLoss(data) {
            let reverseIni = false;
            for (let i = 0; i < data.length; i++) {
                const element = data[i];

                if (element.result.includes("❌")) {
                    reverseIni = !reverseIni;
                }

                if (reverseIni && !element.result.includes("❌")) {
                    element.possibleValue = element.possibleValue.includes("🔴") ? element.possibleValue.replace("🔴", "⚫️") : element.possibleValue.includes("⚫️") ? element.possibleValue.replace("⚫️", "🔴") : element.possibleValue;
                }
            }

            return data;
        },
        getResult(d) {
            let date = d.date;
            let result = '🖐';

            if (d.possibleValue == "🥶") {
                result = d.possibleValue;
            }
            else {
                for (let i = 0; i < this.groupedActualResults.length; i++) {
                    const c = this.groupedActualResults[i];
                    const time = this.correctTime(date.getHours()) + ":" + this.correctTime(date.getMinutes());
                    if (time == c.time) {
                        // encontrou o minuto no grupo
                        if (c.firstValue == "⚪️" && d.possibleValue.includes("⚪️")) {
                            result = "⚪️💚";
                            break;
                        }
                        if (c.secondValue == "⚪️" && d.possibleValue.includes("⚪️")) {
                            result = "⚪️✅";
                            break;
                        }

                        result = d.possibleValue != "" && d.possibleValue.includes(c.firstValue) ? c.firstValue +"💚" : (c.secondValue != "" && d.possibleValue.includes(c.secondValue)) ? c.secondValue + "✅"  : "❌ (" + c.firstValue + " / " + c.secondValue + ")";
                        break;
                    }
                }
            }

            return result;
        },
        async getResultFromFirebase() {
            let result = [];
            let dat = new Date(this.listMinutesInDate[0].date.getTime());
            let datFim = new Date(this.listMinutesInDate[this.listMinutesInDate.length - 1].date.getTime());
            dat.setMinutes(dat.getMinutes() - 2);
            datFim.setMinutes(datFim.getMinutes() + 1);
            if (this.timerEnabled == false || (this.timerEnabled && this.timerCountdown <= 0)) {
                await firestoreDb.collection("double-results")
                    .where("created_at", ">=", dat.toISOString())
                    .where("created_at", "<=", datFim.toISOString())
                    //.limit(50)
                    .orderBy("created_at")
                    .get()
                    .then(snapShot => {
                        snapShot.forEach(r => {
                            result.push(r.data());
                        })
                    });
            }

            this.actualResults = result;
            this.haveList = true;
            this.timerCountdown = 60;
            this.timerEnabled = true;
            this.updateResults();
        },
        getColorString(n, byColor = false) {
            const number = parseFloat(n);

            // if (number == 7 || number == 8) {
            //     return "🥶";
            // }

            if (byColor) {
                return number == 2 ? "⚫️" : number == 1 ? "🔴" : "⚪️";
            }

            return number == 0 ? "⚪️" : number <= 7 ? "🔴" : "⚫️";
        },
        reverseColorsResult(time) {
            let list = new Array();
            this.results.forEach(re => { list.push(re) });
            const split = time.split(":");
            list.forEach(re => {
                if (re.time.getHours() >= parseInt(split[0]) && re.time.getMinutes() >= parseInt(split[1])) {
                    if (re.result == "🖐") {
                        re.possibleValue = re.possibleValue.includes("🔴") ? re.possibleValue.replace("🔴", "⚫️") : re.possibleValue.includes("⚫️") ? re.possibleValue.replace("⚫️", "🔴") : re.possibleValue
                    }
                }
            });

            this.results = list;
        }
    },
    computed: {
        // listMinutes(){
        //     return this.list.split(',');
        // },
        groupedActualResults() {
            let grouped = new Array();
            let brancos = 0;

            this.actualResults.forEach(ar => {
                const date = new Date(ar.created_at);
                const time = this.correctTime(date.getHours()) + ":" + this.correctTime(date.getMinutes());
                let obj = { time, firstValue: this.getColorString(ar.cor, true), secondValue: '' };

                for (let i = 0; i < this.actualResults.length; i++) {
                    const el = this.actualResults[i];
                    const secondDate = new Date(el.created_at);
                    const secondTime = this.correctTime(secondDate.getHours()) + ":" + this.correctTime(secondDate.getMinutes());
                    if (secondTime == time && el.seed != ar.seed) {
                        obj.secondValue = this.getColorString(el.cor, true)
                    }
                }
                let exists = false;
                grouped.forEach(g => {
                    if (g.time == obj.time) {
                        exists = true;
                    }
                })

                if (!exists) {
                    grouped.push(obj);

                    if (obj.firstValue.includes("⚪️")) {
                        brancos++;
                        if (brancos >= 2) {
                            brancos = 0;
                            this.reverseColorAfter = time;
                            // this.reverseColorsResult(time);
                        }
                    }
                    if (obj.secondValue.includes("⚪️")) {
                        brancos++;
                        if (brancos >= 2) {
                            brancos = 0;
                            // this.reverseColorsResult(time);
                            this.reverseColorAfter = time;
                        }
                    }
                }
            });

            return grouped;
        },
        numberOfTables() {
            return this.listMinutesInDate.length <= 1 ? 0 : Math.ceil(this.listMinutesInDate.length / 10);
        },
        listMinutesInDate() {
            let dates = new Array();
            const split = this.list.split(',');
            const firstDate = new Date(split[0]);
            let countMinutes = 1;

            for (let i = 1; i < split.length; i += 2) {
                const first = split[i];
                const second = split[i + 1];
                let hasValue = true;
                // const splitTime = this.reverseColorAfter != "" ? this.reverseColorAfter.split(":") : null;
                let dat = new Date(firstDate.getTime());
                dat.setMinutes(dat.getMinutes() + (countMinutes++));

                let obj = { date: dat, possibleValue: '' };

                // possível branco
                if (parseFloat(first) == 0) {
                    obj.possibleValue = this.getColorString(second) + this.getColorString("0");
                }
                else if (parseFloat(second) == 0) {
                    obj.possibleValue = this.getColorString(first) + this.getColorString("0");
                }
                else if (this.getColorString(first) == this.getColorString(second)) {
                    obj.possibleValue = this.getColorString(first);
                }
                else {
                    hasValue = false;
                }

                if (hasValue) {
                    // if (this.reverseColorAfter != ""
                    //     && dat.getHours() >= parseInt(splitTime[0])
                    //     && dat.getMinutes() >= parseInt(splitTime[1])) {
                    //     if (re.result == "🖐") {
                    //         obj.possibleValue = obj.possibleValue.includes("🔴")
                    //             ? obj.possibleValue.replace("🔴", "⚫️")
                    //             : obj.possibleValue.includes("⚫️")
                    //                 ? obj.possibleValue.replace("⚫️", "🔴")
                    //                 : obj.possibleValue
                    //     }
                    // }
                    dates.push(obj);
                }
            }
            return dates;
        },
        nextTime() {
            let result = null;
            this.results.forEach(r => {
                if (r.next == true) {
                    result = r;
                }
            })
            return result;
        },
        firstFromList() {
            return this.results[0];
        },
    }
};
</script>

<style>
.win {
    background-color: greenyellow;
}

.loss {
    background-color: rgb(247, 75, 75);
}

.tables {
    display: flex;
    column-gap: 30px;
    justify-content: space-around;
    flex-wrap: nowrap;
    align-items: center;
    align-content: stretch;
}

.table {
    flex-grow: 1;
}

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

.next {
    background: #a6ac56;
}

.done {
    background: #b6b6b6;
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

.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}
</style>

