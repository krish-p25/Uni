const fs = require('fs');
const path = require('path');
const sequelize = require('sequelize');

const scenario_one = sequelize.define('scenario_one', {
    utc: {
        type: sequelize.STRING,
        allowNull: false
    },
    time: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    position_x: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    position_y: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    position_z: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    rotation_x: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    rotation_y: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    rotation_z: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    velocity_x: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    velocity_y: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    velocity_z: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    throttle: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    brake: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    steering: {
        type: sequelize.NUMERIC,
        allowNull: false
    },
    car_spawned: {
        type: sequelize.BOOLEAN,
        allowNull: false
    },
    ped_spawned: {
        type: sequelize.BOOLEAN,
        allowNull: false
    },
    car_collide: {
        type: sequelize.BOOLEAN,
        allowNull: false
    },
    ped_collide: {
        type: sequelize.BOOLEAN,
        allowNull: false
    }
}, {
    timestamps: false
});

async function import_scenario_one_from_csv() {
    for (let counter = 1; counter < 57; counter++) {
        const data_csv = fs.readFileSync(`./Data/Scenario1n/S_1_${counter}.csv`)
        console.log(data_csv.toString())
        break
    }
}
import_scenario_one_from_csv()