function groupByHourAndMinute(data, windowSize) {
    const maxCrashPoint = 20;
    let groupedData = {};

    data = addMissingValues(data);
    data = sortData(data);

    let maxCrashPointMinute = -1;
    let maxCrashPointMinuteKey = "";
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        item.crash_point = limitCrashPoint(item.crash_point, maxCrashPoint);
        const key = createKey(item.hora, item.minuto);
        if (!groupedData[key]) {
            groupedData[key] = createNewGroupedDataEntry(item);
        }
        maxCrashPointMinuteKey = storeMaxCrashPoint(maxCrashPointMinute, maxCrashPointMinuteKey, item, key);
        updateCrashPoint(data, i, groupedData, maxCrashPointMinute, maxCrashPointMinuteKey, item);
        updateWindow(groupedData, key, item.crash_point, windowSize);
    }

    return Object.values(groupedData);
}

function addMissingValues(data) {
    let missingValues = [];
    for (let i = 1; i < data.length; i++) {
        let current = data[i];
        let previous = data[i - 1];
        if (current.hora - previous.hora > 1 || current.minuto - previous.minuto > 1) {
            for (let j = 1; j < (current.hora - previous.hora) * 60 + current.minuto - previous.minuto; j++) {
                let hour = previous.hora + Math.floor((previous.minuto + j) / 60);
                let minute = (previous.minuto + j) % 60;
                let created_at = new Date(previous.created_at);
                created_at.setMinutes(created_at.getMinutes()+1);
                missingValues.push({ hora: hour, minuto: minute, crash_point: previous.crash_point, created_at });
            }
        }
    }
    missingValues.forEach(mv => {
        data.push(mv);
    });
    return data;
}

function sortData(data) {
    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return data;
}

function limitCrashPoint(crashPoint, maxCrashPoint) {
    return Math.min(crashPoint, maxCrashPoint);
}

function createKey(hour, minute) {
    return `${hour}:${minute}`;
}

function storeMaxCrashPoint(maxCrashPointMinute, maxCrashPointMinuteKey, item, key) {
    if (item.crash_point > maxCrashPointMinute) {
        maxCrashPointMinute = item.crash_point;
        maxCrashPointMinuteKey = key;
    }
    return maxCrashPointMinuteKey;
}

function updateCrashPoint(data, i, groupedData, maxCrashPointMinute, maxCrashPointMinuteKey, item) {
    if (i < data.length - 1) {
        let nextItem = data[i+1];
        if (nextItem.minuto !== item.minuto && nextItem.hora !== item.hora) {
            groupedData[maxCrashPointMinuteKey].crashPoint = maxCrashPointMinute;
            maxCrashPointMinute = -1;
            maxCrashPointMinuteKey = "";
        }
    }
}

function updateWindow(groupedData, key, crashPoint, windowSize) {
    groupedData[key].window.push(crashPoint);
    if (groupedData[key].window.length > windowSize) {
        groupedData[key].window.shift();
    }
    groupedData[key].movingAverage = groupedData[key].window.reduce((acc, val) => acc + val, 0) / groupedData[key].window.length;
}

function createNewGroupedDataEntry(item) {
    let adjustedDate = new Date(item.created_at);
    adjustedDate.setSeconds(0);
    adjustedDate.setMilliseconds(0);
    adjustedDate.setHours(adjustedDate.getHours() - 3);
    return {
        crashPoint: item.crash_point,
        dateTime: adjustedDate.toISOString().replace(":00.000Z", "").replace("T", " ").substring(5),
        movingAverage: 0,
        window: []
    };
}

function calculateMovingAverageFromGroup(groupedData, windowSize) {
    groupedData.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    const weights = [];
    let weightSum = 0;
    for (let i = 0; i < windowSize; i++) {
        weights[i] = windowSize - i;
        weightSum += weights[i];
    }
    for (let i = 0; i < groupedData.length; i++) {
        let weightedSum = 0;
        let count = 0;
        for (let j = i; j < i + windowSize && j < groupedData.length; j++) {
            weightedSum += groupedData[j].crashPoint * weights[count];
            count++;
        }
        groupedData[i].movingAverageFromGroup = weightedSum / weightSum;
    }
    return groupedData;
}

function calculateMovingAverageFromMovAvg(groupedData, windowSize) {
    groupedData.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    const weights = [];
    let weightSum = 0;
    for (let i = 0; i < windowSize; i++) {
        weights[i] = windowSize - i;
        weightSum += weights[i];
    }
    for (let i = 0; i < groupedData.length; i++) {
        let weightedSum = 0;
        let count = 0;
        for (let j = i; j < i + windowSize && j < groupedData.length; j++) {
            weightedSum += groupedData[j].movingAverage * weights[count];
            count++;
        }
        groupedData[i].movingAverageFromMovAvg = weightedSum / weightSum;
    }
    return groupedData;
}

// function calculateTrendFromGroup(groupedData, n = 5) {
//     for (let i = 0; i < groupedData.length; i++) {
//         // check if there are at least n moving average values
//         if (i < n + 1) {
//             groupedData[i].trend = 0;
//             continue;
//         }
//         // calculate rate of change
//         let roc = (groupedData[i - 1].movingAverageFromGroup - groupedData[i - n - 1].movingAverageFromGroup) / n;
//         // set trend based on rate of change
//         groupedData[i].trend = roc > 0 ? 15 :  0;
//     }
//     return groupedData;
// }


function calculateTrendFromGroup(groupedData, shortEMA = 5, longEMA = 10) {
    let shortEMAValues = [];
    let longEMAValues = [];
    for (let i = 0; i < groupedData.length; i++) {
        // check if there are at least n moving average values
        if (i < longEMA + 1) {
            groupedData[i].trend = 0;
            continue;
        }
        let kShort = 2 / (shortEMA + 1);
        let kLong = 2 / (longEMA + 1);
        shortEMAValues[i] = groupedData[i].movingAverageFromGroup * kShort + (shortEMAValues[i-1] || 0) * (1 - kShort);
        longEMAValues[i] = groupedData[i].movingAverageFromGroup * kLong + (longEMAValues[i-1] || 0) * (1 - kLong);
        // set trend based on crossover between short and long EMA
        groupedData[i].trend = shortEMAValues[i] > longEMAValues[i] ? 15 : 0;
    }
    return groupedData;
}

function getGroupedData(result) {
    const x = 7;
    const y = 3;
    let groupedDataLocal = groupByHourAndMinute(result, 5);
    groupedDataLocal = calculateMovingAverageFromGroup(groupedDataLocal, x);
    groupedDataLocal = calculateMovingAverageFromMovAvg(groupedDataLocal, x);
    groupedDataLocal = calculateTrendFromGroup(groupedDataLocal, y, y*2);

    return groupedDataLocal;
}

module.exports = { calculateMovingAverageFromGroup, calculateTrendFromGroup, groupByHourAndMinute, getGroupedData };