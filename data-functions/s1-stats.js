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
    const average_steering = data.reduce((acc, curr) => acc + curr.steering, 0) / data.length;
    const average_throttle = data.reduce((acc, curr) => acc + curr.throttle, 0) / data.length;
    const average_brake = data.reduce((acc, curr) => acc + curr.brake, 0) / data.length;
    console.log('average_steering', average_steering);
    console.log('average_throttle', average_throttle);
    console.log('average_brake', average_brake);
}
pull_data_statistics()