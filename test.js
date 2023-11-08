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
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    ped_spawned: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    car_collide: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    ped_collide: {
        type: DataTypes.BOOLEAN,
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

async function import_scenario_one_from_csv() {
    for (let counter = 1; counter < 57; counter++) {
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        try {
            const copy_data_csv = fs.readFileSync(`./Data/Scenario1n/S_1_${counter}.csv`).toString().split('\n');
            copy_data_csv.shift();
            for (const row of copy_data_csv) {
                try {
                    const row_data = row.split(',');
                    const utc = row_data[0];
                    if (!(!!(row_data[0]))) continue;
                    const time = row_data[1].trim();
                    const position_x = row_data[2].trim();
                    const position_y = row_data[3].trim();
                    const position_z = row_data[4].trim();
                    const rotation_x = row_data[5].trim();
                    const rotation_y = row_data[6].trim();
                    const rotation_z = row_data[7].trim();
                    const velocity_x = row_data[8].trim();
                    const velocity_y = row_data[9].trim();
                    const velocity_z = row_data[10].trim();
                    const throttle = row_data[11].trim();
                    const brake = row_data[12].trim();
                    const steering = row_data[13].trim();
                    const car_spawned = row_data[15].trim() === 'True' ? true : false;
                    const ped_spawned = row_data[16].trim() === 'True' ? true : false;
                    const ped_collide = row_data[16] ? (parseFloat(row_data[16].trim()) > 0 ? true : false) : false;
                    const car_collide = row_data[17] ? (row_data[17].trim() === 'True' ? true : false) : false;

                    await scenario_one.create({
                        utc,
                        time,
                        position_x,
                        position_y,
                        position_z,
                        rotation_x,
                        rotation_y,
                        rotation_z,
                        velocity_x,
                        velocity_y,
                        velocity_z,
                        throttle,
                        brake,
                        steering,
                        car_spawned,
                        ped_spawned,
                        ped_collide,
                        car_collide,
                        id
                    });
                }
                catch (err) {
                    console.log('error inserting copy sheet data', `${counter} - ${err}`)
                }
                console.log('inserted copy csv file', counter)
            }
        }
        catch (err) {
            console.log(`copy version not found- ${counter} - ${err}`);
        }
        console.log('inserted full copy csv file', counter)
        
        try {
            const data_csv = fs.readFileSync(`./Data/Scenario1/S_1_${counter}.csv`).toString().split('\n');
            data_csv.shift();
            for (const row of data_csv) {
                try {
                    const row_data = row.split(',');
                    const utc = row_data[0];
                    if (!(!!(row_data[0]))) continue;
                    const time = row_data[1].trim();
                    const position_x = row_data[2].trim();
                    const position_y = row_data[3].trim();
                    const position_z = row_data[4].trim();
                    const rotation_x = row_data[5].trim();
                    const rotation_y = row_data[6].trim();
                    const rotation_z = row_data[7].trim();
                    const velocity_x = row_data[8].trim();
                    const velocity_y = row_data[9].trim();
                    const velocity_z = row_data[10].trim();
                    const throttle = row_data[11].trim();
                    const brake = row_data[12].trim();
                    const steering = row_data[13].trim();
                    const car_spawned = row_data[15].trim() === 'True' ? true : false;
                    const ped_spawned = row_data[16].trim() === 'True' ? true : false;
                    const ped_collide = row_data[16] ? (parseFloat(row_data[16].trim()) > 0 ? true : false) : false;
                    const car_collide = row_data[17] ? (row_data[17].trim() === 'True' ? true : false) : false;

                    await scenario_one.create({
                        utc,
                        time,
                        position_x,
                        position_y,
                        position_z,
                        rotation_x,
                        rotation_y,
                        rotation_z,
                        velocity_x,
                        velocity_y,
                        velocity_z,
                        throttle,
                        brake,
                        steering,
                        car_spawned,
                        ped_spawned,
                        ped_collide,
                        car_collide,
                        id
                    });
                }
                catch (err) {
                    console.log('error inserting data sheet data', `${counter} - ${err}`)
                }
                console.log('inserted data csv file', counter)
            }
        }
        catch (err) {
            console.log(`copy version not found- ${counter} - ${err}`);
        }
        
    }
}
import_scenario_one_from_csv()