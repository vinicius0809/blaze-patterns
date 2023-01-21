<template>
    <div id="app">
        <div class="container">
            <h1>LISTA DE SINAIS 3x NO JOGO CRASH DA BLAZE</h1>
            <h2>Legenda: 💖 = >50x / 💚 = >10x / ❇️ = >5x / ✅ = >3x / ☢️ = >2x / ❌ = LOSS / 🖐 = sem entrada</h2>
            <h3>Acertos / Erros: 💖 = {{getAllOcurrencies('💖')}} / 💚 = {{getAllOcurrencies('💚')}} / ❇️ =
                {{getAllOcurrencies('❇️')}} / ✅ = {{getAllOcurrencies('✅')}} / ☢️ = {{getAllOcurrencies('☢️')}} / ❌ =
                {{getAllOcurrencies('❌')}} / Saldo Geral: <label
                    class="win">{{getAllOcurrencies('💖')+getAllOcurrencies('💚')+getAllOcurrencies('❇️')+getAllOcurrencies('✅')}}</label>
                / <label class="loss">{{getAllOcurrencies('❌')+getAllOcurrencies('☢️')}}</label></h3>
            <h3>Buscar as velas de 3x e 5x com 20 segundos antes do minuto informado na lista. Velas altas podem subir
                um pouco antes, busque por conta e risco.</h3>
            <div v-if="!haveList" class="input-lists">
                <div>
                    <label for="input-list3x">Insira a lista de sinais 3x</label>
                    <textarea name="input-list3x" id="input-list3x" cols="30" rows="10" v-model="list3x"></textarea>
                </div>
                <div><label for="input-list5x">Insira a lista de sinais 5x</label>
                    <textarea name="input-list5x" id="input-list5x" cols="30" rows="10" v-model="list5x"></textarea>
                </div>
                <div><label for="input-list10x">Insira a lista de sinais 10x</label>
                    <textarea name="input-list10x" id="input-list10x" cols="30" rows="10" v-model="list10x"></textarea>
                </div>
                <div><label for="input-list20x">Insira a lista de sinais 20x</label>
                    <textarea name="input-list20x" id="input-list20x" cols="30" rows="10" v-model="list20x"></textarea>
                </div>
                <div><label for="input-list-rec">Insira a lista de sinais de REC</label>
                    <textarea name="input-list-rec" id="input-list-rec" cols="30" rows="10"
                        v-model="listRec"></textarea>
                </div>
            </div>
            <div v-else>
                <button @click="nextList()">Editar Lista</button>
                <h2 class="timer">Atualização em {{ timerCountdown }}</h2>
            </div>
            <button @click="getResultFromFirebase(firstFromList)">Processar</button>
            <div v-if="numberOfTables > 0" class="tables">
                <table v-for="i in numberOfTables" :key="i" class="table">
                    <tr>
                        <th></th>
                        <th>Minuto</th>
                        <th>Resultado</th>
                        <th>Possível</th>
                    </tr>
                    <tr v-for="result in getResults(i)" :key="result.time.toString()" :class="getRowClass(result)">
                        <td><strong>{{result.index}}</strong></td>
                        <td>{{ `${correctTime(result.time.getHours())}:${correctTime(result.time.getMinutes())}`
                        }}</td>
                        <td>{{ result.result }}</td>
                        <td>{{ getPossibleValue(result) }}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { realtimeDb } from "./../db.js";
export default {
    data() {
        return {
            timerCountdown: 10,
            timerEnabled: false,
            haveList: false,
            list3x: '',
            list5x: '',
            list10x: '',
            list20x: '',
            listRec: '',
            list: '',
            actualResults: new Array(),
            results: new Array()
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
        getPossibleValue(x) {
            let result = x.possibleValue == 0 ? "REC" : "3x";

            if (x.possibleValue > 3) {
                result = x.possibleValue + "x";
                if (x.result == "❌") {
                    result = x.result + " " + result;
                }

                if (x.result != "🖐" && x.result != "❌") {
                    const split = x.result.split(" ");
                    let crash = parseFloat(split[1].replace("x", ""));

                    const win = crash >= x.possibleValue ? split[0] + " " : "";
                    result = win + result;
                }
            }
            return result;
        },
        getResults(index) {
            const sizeList = 10;
            let max = -1 + index * sizeList;
            // max = this.results.length < max ? this.results.length : max;
            let start = max - 9;
            let result = new Array();

            for (let i = start; (i <= max && i < this.results.length); i++) {
                const element = { ...this.results[i], index: i + 1 };
                result.push(element);
            }

            return result;
        },
        nextList() {
            this.haveList = false;
            // this.timerEnabled = false;
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

            this.listMinutesInDateNew.forEach(d => {
                let hasNext = false;
                data.forEach(el => {
                    if (el.next) {
                        hasNext = true;
                    }
                });
                let obj = { time: d.date, next: d.date > new Date() && !hasNext, result: d.possibleValue == 0 ? '🖐' : this.getResult(d), possibleValue: d.possibleValue }
                data.push(obj);
            });
            this.results = data;
        },
        getResult(d) {
            let date = d.date;
            let result = '🖐';
            let minusSeconds = d.possibleValue == 10 ? -27 : d.possibleValue == 20 ? -32 : -20
            let dateIni = new Date(date.getTime());
            dateIni.setSeconds(minusSeconds);
            let dateFim = new Date(date.getTime());
            dateFim.setSeconds(50);

            for (let i = 0; i < this.actualResults.length; i++) {
                const c = this.actualResults[i];
                const createdAt = new Date(c.created_at);
                const crashPoint = parseFloat(c.crash_point);
                if (createdAt >= dateIni && createdAt <= dateFim) {
                    let antIniMeiFim = "antes";
                    const minutes = createdAt.getMinutes();
                    const seconds = createdAt.getSeconds();
                    if (minutes == date.getMinutes()) {
                        if (seconds < 21) {
                            antIniMeiFim = "começo"
                        }
                        else if (seconds > 20 && seconds < 41) {
                            antIniMeiFim = "meio"
                        }
                        else {
                            antIniMeiFim = "fim"
                        }
                    }

                    if (crashPoint > 50) {
                        result = `💖 ${c.crash_point}x (${antIniMeiFim})`;
                        break;
                    }
                    else if (crashPoint > 10) {
                        result = `💚 ${c.crash_point}x (${antIniMeiFim})`;
                        break;
                    }
                    else if (crashPoint > 5 && (result.includes("❌") || result.includes("☢️") || result.includes("✅") || result.includes("🖐"))) {
                        result = `❇️ ${c.crash_point}x (${antIniMeiFim})`;
                    }
                    else if (crashPoint > 3 && (result.includes("❌") || result.includes("☢️") || result.includes("🖐"))) {
                        result = `✅ ${c.crash_point}x (${antIniMeiFim})`;
                    }
                    else if (crashPoint > 2 && (result.includes("❌") || result.includes("🖐"))) {
                        result = `☢️ ${c.crash_point}x (${antIniMeiFim})`;
                    }
                    else {
                        result = !result.includes("🖐") ? result : "❌";
                    }
                }
            }

            return result;
        },
        async getResultFromFirebase(time) {
            let result = [];
            if (time != null && time != undefined && time != 'undefined' &&
                (this.timerEnabled == false || (this.timerEnabled && this.timerCountdown <= 0))) {
                let newtime = new Date(time.time.getTime());
                newtime.setSeconds(-15);
                const str = newtime.toISOString();
                await realtimeDb.ref("crash-results")
                    .orderByChild('created_at')
                    .startAt(str)
                    .get()
                    .then((snapshot) => {
                        console.log(snapshot.exists());
                        console.log(snapshot.val());
                        console.log(str);
                        snapshot.forEach((doc) => {
                            result.push(doc.val());
                        });

                        this.actualResults = result;
                    });
            }
            this.haveList = true;
            this.timerCountdown = 30;
            this.timerEnabled = true;
            this.updateResults();
        },
        splitList(list) {
            if (list == "") return [];
            let newList = [];
            let splited = list.split("*");
            let dat = new Date(splited[0]);
            const limitSeconds = 10;

            if (dat.getSeconds() > 60-limitSeconds) {
                dat.setMinutes(dat.getMinutes() +1)
            }
            // if (dat.getSeconds() < limitSeconds) {
            //     dat.setMinutes(dat.getMinutes() -1)
            // }
            newList.push(dat);

            for (let i = 1; i < splited.length; i++) {
                const element = splited[i];
                const text = element.split("\n")[1];

                if (text != undefined && text != "") {
                    dat = new Date(text);
                    if (dat.getSeconds() > 60-limitSeconds) {
                        dat.setMinutes(dat.getMinutes() +1)
                    }
                    // if (dat.getSeconds() < limitSeconds) {
                    //     dat.setMinutes(dat.getMinutes() -1)
                    // }
                    newList.push(dat);
                }
            }
            return newList;
        },
        groupListsByTime() {
            let resultList = [];
            let resultList3x = [];
            let resultList5x = [];
            let resultList10x = [];
            let resultList20x = [];

            this.listMinutes3x.forEach(x3 => {
                const obj = { possibleValue: 3, date: x3 }
                resultList3x.push(obj);

                let exists = false;
                resultList.forEach(rl => {
                    if (rl.date.getMinutes() == obj.date.getMinutes() && rl.date.getHours() == obj.date.getHours()) {
                        exists = true;
                        rl.possibleValue = obj.possibleValue;
                    }
                })

                if (!exists) {
                    resultList.push(obj);
                }
            });
            this.listMinutes5x.forEach(x5 => {
                const obj = { possibleValue: 4, date: x5 }
                resultList5x.push(obj);

                let exists = false;
                resultList.forEach(rl => {
                    if (rl.date.getHours() == obj.date.getHours()) {
                        if (rl.date.getMinutes() == obj.date.getMinutes()) {
                            exists = true;
                            rl.possibleValue = obj.possibleValue;
                        }
                    }
                })

                if (!exists) {
                    // resultList.push(obj);
                }
            });
            this.listMinutes10x.forEach(x10 => {
                const obj = { possibleValue: 7, date: x10 }
                resultList10x.push(obj);

                let exists = false;
                resultList.forEach(rl => {
                    if (rl.date.getHours() == obj.date.getHours()) {
                        if (rl.date.getMinutes() == obj.date.getMinutes()) {
                            exists = true;
                            rl.possibleValue = obj.possibleValue;
                        }
                        else if (rl.date.getMinutes() + 1 == obj.date.getMinutes() ||
                            rl.date.getMinutes() - 1 == obj.date.getMinutes()) {
                            exists = true;
                            rl.possibleValue = obj.possibleValue;
                        }
                    }
                });

                if (!exists) {
                    resultList.push(obj);
                }
            });
            this.listMinutes20x.forEach(x20 => {
                const obj = { possibleValue: 10, date: x20 }
                resultList20x.push(obj);

                let exists = false;
                resultList.forEach(rl => {
                    if (rl.date.getHours() == obj.date.getHours()) {
                        if (rl.date.getMinutes() == obj.date.getMinutes()) {
                            exists = true;
                            rl.possibleValue = obj.possibleValue;
                        }
                        else if (rl.date.getMinutes() + 1 == obj.date.getMinutes() ||
                            rl.date.getMinutes() - 1 == obj.date.getMinutes()) {
                            exists = true;
                            rl.possibleValue = obj.possibleValue;
                        }
                    }
                });

                if (!exists) {
                    resultList.push(obj);
                }
            });

            this.listMinutesRec.forEach(rec => {
                const obj = { possibleValue: 0, date: rec }
                resultList20x.push(obj);

                let exists = false;
                let indexToRemove = -1;
                resultList.forEach((rl, index) => {
                    if (rl.date.getMinutes() == obj.date.getMinutes() && rl.date.getHours() == obj.date.getHours()) {
                        exists = true;
                        rl.possibleValue = obj.possibleValue;
                        indexToRemove = index;
                    }
                })

                if (exists) {
                    resultList.splice(indexToRemove, 1);
                }
            });
            return resultList.sort((a, b) => (a.date > b.date) ? 1 : -1);
        }
    },
    computed: {
        listMinutes3x() {
            return this.splitList(this.list3x);
        },
        listMinutes5x() {
            return this.splitList(this.list5x);
        },
        listMinutes10x() {
            return this.splitList(this.list10x);
        },
        listMinutes20x() {
            return this.splitList(this.list20x);
        },
        listMinutesRec() {
            return this.splitList(this.listRec);
        },
        numberOfTables() {
            return this.listMinutesInDateNew.length <= 1 ? 0 : Math.ceil(this.listMinutesInDateNew.length / 10);
        },
        listMinutesInDateNew() {
            // let dates = new Array();
            const groupedLists = this.groupListsByTime();

            return groupedLists;
        },
        listMinutesInDate() {
            let dates = new Array();
            this.list.split(',').forEach(min => {
                let possibleValue = 3;

                if (min.includes("(5x)")) {
                    possibleValue = 4;
                    min = min.replace("(5x)", "");
                }
                else if (min.includes("(10x)")) {
                    possibleValue = 6;
                    min = min.replace("(10x)", "");
                }
                else if (min.includes("(20x)")) {
                    possibleValue = 10;
                    min = min.replace("(20x)", "");
                }
                else if (min.includes("(50x)")) {
                    possibleValue = 50;
                    min = min.replace("(50x)", "");
                }
                else if (min.includes("(rec)")) {
                    possibleValue = 0;
                    min = min.replace("(rec)", "");
                }

                let dat = new Date(min);

                if (dat.getSeconds() > 40) {
                    dat.setMinutes(dat.getMinutes() + 1)
                }

                dates.push({ date: dat, possibleValue });
            });
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
.input-lists {
    display: inline-flex;
}


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

