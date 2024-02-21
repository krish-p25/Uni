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
    }
}, {
    timestamps: false,
    tableName: 'custom',
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
        console.log(data);
        res.status(200).send('OK');
        //speed, acceleration, throttle, number of brakes, steering, time, number of accidents
        try {
            await custom_data.create({
                timestamp: data.timestamp,
                speed: data.speed,
                acceleration: data.acceleration,
                brake: data.brake,
                driver: data.driver,
                steering: data.steering
            });
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

module.exports = router;