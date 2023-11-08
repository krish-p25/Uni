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

async function pull_data_statistics() {
    const data = await scenario_one.findAll()
    const average_steering = data.reduce((acc, curr) => acc + parseFloat(curr.steering), 0) / data.length;
    const average_throttle = data.reduce((acc, curr) => acc + parseFloat(curr.throttle), 0) / data.length;
    const average_brake = data.reduce((acc, curr) => acc + parseFloat(curr.brake), 0) / data.length;
    const average_velocity = data.reduce((acc, curr) => acc + parseFloat(curr.velocity_x)*parseFloat(curr.velocity_x) + parseFloat(curr.velocity_y)*parseFloat(curr.velocity_y) + parseFloat(curr.velocity_z)+parseFloat(curr.velocity_z), 0) / data.length;
    
    let number_of_brakes = 0
    let ids_array = []
    for (const point of data) {
        if (parseFloat(point.brake) > 0 && parseFloat(data[data.indexOf(point) + 1].brake) === 0) {
            number_of_brakes++
        }
        if (!(ids_array.includes(point.id))) ids_array.push(point.id)

    }

    const dataToWrite = JSON.parse(fs.readFileSync('data-summary.json', 'utf8'))
    dataToWrite.scenario_one = {
        average_steering,
        average_throttle,
        average_brake,
        average_velocity: Math.cbrt(average_velocity),
        number_of_brakes,
        total_users: ids_array.length
    }
    fs.writeFileSync('data-summary.json', JSON.stringify(dataToWrite));
}
pull_data_statistics()