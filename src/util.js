function groupByHourAndMinute(data, windowSize) {
    const maxCrashPoint = 30;
    let groupedData = [];

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
    for (let i = 0; i < groupedData.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = i; j < i + windowSize && j < groupedData.length; j++) {
            sum += groupedData[j].crashPoint;
            count++;
        }
        groupedData[i].movingAverageFromGroup = sum / count;
    }
    return groupedData;
}

function calculateTrendFromGroup(groupedData, n = 5) {
    for (let i = 0; i < groupedData.length; i++) {
        // check if there are at least n moving average values
        if (i < n + 1) {
            groupedData[i].trend = 0;
            continue;
        }
        // check if the last n moving average values are getting higher or lower
        groupedData[i].trend = groupedData[i - 1].movingAverageFromGroup >= groupedData[i - n - 1].movingAverageFromGroup
         && groupedData[i - 1].movingAverageFromGroup > 4 ? 15 : 0;
    }
    return groupedData;
}

function getGroupedData(result){
    let groupedDataLocal = groupByHourAndMinute(result, 5);
    groupedDataLocal = calculateMovingAverageFromGroup(groupedDataLocal, 7);
    groupedDataLocal = calculateTrendFromGroup(groupedDataLocal, 3);

    return groupedDataLocal;
}

module.exports= {calculateMovingAverageFromGroup, calculateTrendFromGroup, groupByHourAndMinute,getGroupedData};