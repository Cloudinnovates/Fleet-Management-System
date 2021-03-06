const express = require('express');
const database = require('../database');
const router = express.Router();

router.post('/LoadDashboardData', (req, res) => {
    let sqlFetch = `SELECT SUM(CASE WHEN vehicle_type = 'Big' THEN 1 ELSE 0 END) AS VEHICLE_TYPE_BIG, 
        SUM(CASE WHEN vehicle_type = 'Medium' THEN 1 ELSE 0 END) AS VEHICLE_TYPE_MEDIUM,
        SUM(CASE WHEN vehicle_type = 'Small' THEN 1 ELSE 0 END) AS VEHICLE_TYPE_SMALL, 
        SUM(CASE WHEN vehicle_status = 'Available' THEN 1 ELSE 0 END) AS VEHICLE_STATUS_AVAILABLE, 
        SUM(CASE WHEN vehicle_status = 'Maintenance' THEN 1 ELSE 0 END) AS VEHICLE_STATUS_MAINTENANCE, 
        SUM(CASE WHEN vehicle_status = 'Assigned' THEN 1 ELSE 0 END) AS VEHICLE_STATUS_ASSIGNED
        FROM VMS_VEHICLE_DETAIL`;

    database.task(async task => {
        return await task.manyOrNone(sqlFetch);
    }).then(result => {
        return res.status(201).json({message: 'Success', result: result[0]});
    }).catch(error => {
        console.log(error);
        return res.status(500).json({message: 'Error'});
    });
});

router.get('/LoadVehicleData', (req, res) => {
    let sqlFetch = `SELECT auto_id, vehicle_code, vehicle_name, vehicle_plate, vehicle_type, vehicle_status 
        FROM VMS_VEHICLE_DETAIL`;

    database.task(async task => {
        return await task.manyOrNone(sqlFetch);
    }).then(result => {
        return res.status(201).json({message: 'Success', result: result});
    }).catch(error => {
        console.log(error);
        return res.status(500).json({message: 'Error'});
    })
});

router.post('/InsertVehicle', (req, res) => {
    let vehicle = req.body.vehicle;

    let sqlValidate = `SELECT COUNT(*) FROM VMS_VEHICLE_DETAIL WHERE vehicle_code = $1`;
    let sqlInsert = `INSERT INTO VMS_VEHICLE_DETAIL (vehicle_code, vehicle_name, vehicle_plate, vehicle_type) 
        VALUES ($1, $2, $3, $4)`;

    database.task(async task => {
        let validateVehicleCode = await task.manyOrNone(sqlValidate, [vehicle_code]);

        if (validateVehicleCode[0].count === '0') {
            await task.manyOrNone(sqlInsert, [vehicle.vehicle_code, vehicle.vehicle_name, vehicle.vehicle_plate,
                vehicle.vehicle_type]);
        } else {
            res.send({message: 'Failed', error: 'Duplicated Vehicle Code'});
        }
    }).then(() => {
        return res.status(201).json({message: 'Success'});
    }).catch(error => {
        console.log(error);
        return res.status(500).json({message: 'Error'});
    });
});

module.exports = router;
