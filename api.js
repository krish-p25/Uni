const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('simulator', 'postgres', 'Wperkin-10', {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres',
    logging: false,
  });

const scenario_one = sequelize.define('scenario_one', {
    utc: {
        type: DataTypes.STRING,
        allowNull: false
    },
    time: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    position_x: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    position_y: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    position_z: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    rotation_x: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    rotation_y: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    rotation_z: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    velocity_x: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    velocity_y: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    velocity_z: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    throttle: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    brake: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    steering: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    car_spawned: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ped_spawned: {
        type: DataTypes.STRING,
        allowNull: false
    },
    car_collide: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ped_collide: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
}, {
    timestamps: false,
    tableName: 'scenario_one',
    freezeTableName: true
});

const custom_data = sequelize.define('custom', {
    timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    speed: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    acceleration: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    brake: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    driver: {
        type: DataTypes.STRING,
        allowNull: false
    },
    steering: {
        type: DataTypes.NUMERIC,
        allowNull: false
    },
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, {
    timestamps: false,
    tableName: 'custom',
    freezeTableName: true
})

const indicators = sequelize.define('indicators', {
    timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    driver: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    scenario: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'indicators',
    freezeTableName: true
})

const router = require('express').Router();

router.get('/scenario-one-stats', async (req, res) => {
    try {
        const dataToWrite = await JSON.parse(fs.readFileSync('./data-functions/data-summary.json', 'utf8'))
        const all_data = await scenario_one.findAll();
        const velocity_data = all_data.map(point => ({
            velocity: Math.cbrt(parseFloat(point.velocity_x)*parseFloat(point.velocity_x) + parseFloat(point.velocity_y)*parseFloat(point.velocity_y) + parseFloat(point.velocity_z)*parseFloat(point.velocity_z)),
            id: point.id,
        }));
        const velocity_data_grouped_by_id = velocity_data.reduce((acc, curr) => {
            if (acc[curr.id]) {
                acc[curr.id].push(curr.velocity);
            }
            else {
                acc[curr.id] = [curr.velocity];
            }
            return acc;
        }, {});

        let maxLength = Math.max(...Object.values(velocity_data_grouped_by_id).map(arr => arr.length));

        let countArray = new Array(maxLength).fill(0);
        let averageArray = new Array(maxLength).fill(0);

        for (let arr of Object.values(velocity_data_grouped_by_id)) {
            for (let i = 0; i < maxLength; i++) {
                if (i < arr.length) {
                    averageArray[i] += arr[i];
                    countArray[i] += 1;
                }
            }
        }

        averageArray = averageArray.map((sum, index) => sum / countArray[index]);

        const return_data = {
            total_users: dataToWrite.scenario_one.total_users,
            number_of_brakes: dataToWrite.scenario_one.number_of_brakes,
            average_velocity: dataToWrite.scenario_one.average_velocity,
            average_throttle: dataToWrite.scenario_one.average_throttle,
            velocity_data: averageArray,
        }
        res.status(200).json(return_data);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
})

router.post('/test-data-endpoint', async (req, res) => {
    try {
        const data = req.body;
        res.status(200).send('OK');
        //speed, acceleration, throttle, number of brakes, steering, time, number of accidents
        try {
            for (const input_data of data.data) {
                await custom_data.create({
                    timestamp: input_data.Time,
                    speed: input_data.Speed,
                    acceleration: input_data.Acceleration,
                    brake: input_data.IsBraking,
                    driver: input_data.DriverID,
                    steering: input_data.SteeringAngle
                });
                //console.log( new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }), ' - Data written to database', input_data.DriverID)
            }
        }
        catch (err) {
            console.log(`${err}`)
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
})

async function get_user_data(driverId) {
    try {
        const user_data = await custom_data.findAll({
            where: {
                driver: driverId
            }
        });
        const indicators_data = await indicators.findAll({
            where: {
                driver: driverId
            }
        });
        return {
            message: "OK",
            status: 200,
            data: user_data,
            indicators: indicators_data
        }
    }
    catch (err) {
        console.log('error getting user data', err)
        return {
            message: "Internal Server Error",
            status: 500
        }
    }
}

router.post('/get-user-data', async (req, res) => {
    try {
        const driverId = req.body.driverId;
        const user_data = await get_user_data(driverId);
        res.status(user_data.status).json(user_data);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
})

async function recalculate_averages() {
    try {
        const all_data = await custom_data.findAll();
        //split all data into seperate arrays for each driver
        const data_grouped_by_driver = all_data.reduce((acc, curr) => {
            if (acc[curr.driver]) {
                acc[curr.driver].push(curr);
            }
            else {
                acc[curr.driver] = [curr];
            }
            return acc;
        }, {});
        //get average steering actions, average braking actions, and average duration in miliseconds
        const average_steering_actions = Object.values(data_grouped_by_driver).map(arr => {
            let count = 0;
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i].steering > 0 && arr[i + 1].steering < 0) {
                    count++;
                }
                if (arr[i].steering < 0 && arr[i + 1].steering > 0) {
                    count++;
                }
            }
            return count;
        }).reduce((acc, curr) => acc + curr, 0) / Object.values(data_grouped_by_driver).length;
        const average_braking_actions = Object.values(data_grouped_by_driver).map(arr => {
            let count = 0;
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i].brake > 0 && arr[i + 1].brake == 0) {
                    count++;
                }
            }
            return count;
        }).reduce((acc, curr) => acc + curr, 0) / Object.values(data_grouped_by_driver).length;
        const average_duration = Object.values(data_grouped_by_driver).map(arr => arr[arr.length - 1].timestamp - arr[0].timestamp).reduce((acc, curr) => acc + curr, 0) / Object.values(data_grouped_by_driver).length;
        const average_throttle = Object.values(data_grouped_by_driver).map(arr => arr.map(point => point.acceleration).reduce((acc, curr) => acc + parseFloat(curr), 0) / arr.length).reduce((acc, curr) => acc + curr, 0) / Object.values(data_grouped_by_driver).length;
        const average_speed = Object.values(data_grouped_by_driver).map(arr => arr.map(point => point.speed).reduce((acc, curr) => acc + parseFloat(curr), 0) / arr.length).reduce((acc, curr) => acc + curr, 0) / Object.values(data_grouped_by_driver).length;
        //write to file
        const dataToWrite = {
                total_users: Object.values(data_grouped_by_driver).length,
                number_of_brakes: average_braking_actions,
                average_velocity: average_speed,
                average_throttle: average_throttle,
                average_steering_actions: average_steering_actions,
                average_duration: average_duration
        }
        //find average velocity vs time across all drivers
        const velocity_data = all_data.map(datapoint => {
            return {
                velocity: parseFloat(datapoint.speed),
                id: datapoint.driver,
                timestamp: parseFloat(datapoint.timestamp) - all_data.filter(item => item.driver == datapoint.driver).sort((a, b) => a.timestamp - b.timestamp)[0].timestamp
            }
        })
        const velocity_data_grouped_by_id = velocity_data.reduce((acc, curr) => {
            if (acc[curr.id]) {
                acc[curr.id].push(curr.velocity);
            }
            else {
                acc[curr.id] = [curr.velocity];
            }
            return acc;
        }, {});

        let maxLength = Math.max(...Object.values(velocity_data_grouped_by_id).map(arr => arr.length));
        let countArray = new Array(maxLength).fill(0);
        let averageArray = new Array(maxLength).fill(0);
        for (let arr of Object.values(velocity_data_grouped_by_id)) {
            for (let i = 0; i < maxLength; i++) {
                if (i < arr.length) {
                    averageArray[i] += arr[i];
                    countArray[i] += 1;
                }
            }
        }

        //find average steering wheel angle vs time across all drivers
        const steering_data = all_data.map(datapoint => {
            return {
                steering: parseFloat(datapoint.steering),
                id: datapoint.driver,
                timestamp: parseFloat(datapoint.timestamp) - all_data.filter(item => item.driver == datapoint.driver).sort((a, b) => a.timestamp - b.timestamp)[0].timestamp
            }
        })
        const steering_data_grouped_by_id = steering_data.reduce((acc, curr) => {
            if (acc[curr.id]) {
                acc[curr.id].push(curr.steering);
            }
            else {
                acc[curr.id] = [curr.steering];
            }
            return acc;
        }, {});

        let maxLengthSteering = Math.max(...Object.values(steering_data_grouped_by_id).map(arr => arr.length));
        let countArraySteering = new Array(maxLengthSteering).fill(0);
        let averageArraySteering = new Array(maxLengthSteering).fill(0);
        for (let arr of Object.values(steering_data_grouped_by_id)) {
            for (let i = 0; i < maxLengthSteering; i++) {
                if (i < arr.length) {
                    averageArraySteering[i] += arr[i];
                    countArraySteering[i] += 1;
                }
            }
        }

        averageArray = averageArray.map((sum, index) => sum / countArray[index]);
        averageArraySteering = averageArraySteering.map((sum, index) => sum / countArraySteering[index]);
        dataToWrite.velocity_data = averageArray;
        dataToWrite.steering_data = averageArraySteering;
        fs.writeFileSync('./averages.json', JSON.stringify(dataToWrite));
        console.log(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }), ' - Averages recalculated');
        return {
            message: "OK",
            status: 200
        }
    }
    catch (err) {
        console.log('error recalculating averages', err);
        return {
            message: "Internal Server Error",
            status: 500
        }
    }
}
recalculate_averages()

async function get_average_values() {
    try {
        const data = await JSON.parse(fs.readFileSync('./averages.json', 'utf8'));
        return {
            message: "OK",
            status: 200,
            data: data
        }
    }
    catch (err) {
        console.log('error getting average values', err);
        return {
            message: "Internal Server Error",
            status: 500
        }
    }
}

router.get('/get-average-values', async (req, res) => {
    try {
        const average_values = await get_average_values();
        res.status(average_values.status).json(average_values);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
})

async function create_indicator(driverId, scenario) {
    try {
        await indicators.create({
            timestamp: Date.now(),
            driver: driverId,
            scenario
        });
        return {
            message: "OK",
            status: 200
        }
    }
    catch (err) {
        console.log('error creating indicator', `${err}`);
        return {
            message: "Internal Server Error",
            status: 500
        }
    }
}

router.get('/scenario-start', async (req, res) => {
    try {
        const driverId = req.query.driverId;
        const scenario = req.query.scenario;
        console.log(req.query)
        console.log(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }), ' - Scenario started', driverId);
        const user_data = await create_indicator(driverId, scenario);
        if (user_data.status == 200) {
            res.status(200).send('OK');
        }
        else {
            res.status(500).send('Internal Server Error');
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router;