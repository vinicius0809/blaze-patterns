function groupByHourAndMinute(data, windowSize) {
    const maxCrashPoint = 20;
    let groupedData = [];

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
    console.log(missingValues);

    missingValues.forEach(mv => {
        data.push(mv);
    })
    
    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    data.forEach(item => {
        // Limit crashPoint to maxCrashPoint
        item.crash_point = Math.min(item.crash_point, maxCrashPoint);
        // Convert crash_point to double
        item.crash_point = parseFloat(item.crash_point);
        // Get hour and minute
        const hour = item.hora;
        const minute = item.minuto;
        // Create key for grouped data
        const key = `${hour}:${minute}`;
        // If key doesn't exist, create new entry
        let adjustedDate = new Date(item.created_at);
        adjustedDate.setSeconds(0);
        adjustedDate.setMilliseconds(0);
        adjustedDate.setHours(adjustedDate.getHours() - 3);
        if (!groupedData[key]) {
            groupedData[key] = {
                crashPoint: item.crash_point,
                dateTime: adjustedDate.toISOString().replace(":00.000Z", "").replace("T", " ").substring(5),
                movingAverage: 0,
                window: []
            };
        }
        //add current crash_point to window
        groupedData[key].window.push(item.crash_point);
        //if window is bigger than the size of the window, remove the first element
        if (groupedData[key].window.length > windowSize) {
            groupedData[key].window.shift();
        }
        //calculate moving average
        groupedData[key].movingAverage = groupedData[key].window.reduce((acc, val) => acc + val, 0) / groupedData[key].window.length;
        // If key exists, update crashPoint if necessary
        if (item.crash_point > groupedData[key].crashPoint) {
            groupedData[key].crashPoint = item.crash_point;
            groupedData[key].dateTime = adjustedDate.toISOString().replace(":00.000Z", "").replace("T", " ").substring(5);
        }
    });

    return Object.values(groupedData);
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