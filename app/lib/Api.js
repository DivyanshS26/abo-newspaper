import {
    _chechDatabaseDistance,
    _saveCustomer,
    _updateCustomer,
    _deleteCustomer,
    _readCustomer,
    _getAllCustomer,
    _saveAbo,
    _updateAbo,
    _deleteAbo,
    _readAbo,
    _getAllAbosForCustomer,
    _readAllAbos,
    _getLocalVersionsForPlz,
} from './Database.js'

//****************************************/
// 1. Berechne die Strecke von der Firma bis zum Kunden für die Preisberechnung
//****************************************/
export function getDistanceFromCompanyToDestinationPlz(plzDestination) {
    return Promise.all([
        _chechDatabaseDistance(plzDestination),
    ]).then((distanceCalcObj) => ({
        distanceCalcObj,
    }))
}

//****************************************/
// 2. Kundendaten
//****************************************/
export function saveCustomer(newCustomer) {
    return Promise.all([
        _saveCustomer(newCustomer),
    ]).then((success) => ({
        success,
    }))
}

export function updateCustomer(customer) {
    return Promise.all([
        _updateCustomer(customer),
    ]).then((success) => ({
        success,
    }))
}

export function deleteCustomer(customerId) {
    return Promise.all([
        _deleteCustomer(customerId),
    ]).then((success) => ({
        success,
    }))
}

export function readCustomer(customerEmail) {
    return Promise.all([
        _readCustomer(customerEmail),
    ]).then((customer) => ({
        customer,
    }))
}

export function getAllCustomers() {
    return Promise.all([
        _getAllCustomer(),
    ]).then(([allCustomers]) => ({
        allCustomers,
    }))
}


//****************************************/
// 3. Abo/Abonnement
//****************************************/

export function saveAboForCustomer(newAbo) {
    return Promise.all([
        _saveAbo(newAbo),
    ]).then((success) => ({
        success,
    }))
}

export function updateAboForCustomer(abo) {
    return Promise.all([
        _updateAbo(abo),
    ]).then((success) => ({
        success,
    }))
}

export function deleteAboForCustomer(aboId) {
    return Promise.all([
        _deleteAbo(aboId),
    ]).then((success) => ({
        success,
    }))
}

export function readAbo(aboId) {
    return Promise.all([
        _readAbo(aboId),
    ]).then((abo) => ({
        abo,
    }))
}

export function readAllAbosForCustomer(customerId) {
    return Promise.all([
        _getAllAbosForCustomer(customerId),
    ]).then(([allAbos]) => ({
        allAbos,
    }))
}

export function readAllAbos() {
    return Promise.all([
        _readAllAbos(),
    ]).then(([allAbos]) => ({
        allAbos,
    }))
}

//****************************************/
// 4. Lokalausgabe
//****************************************/
export function getLocalVersionsForPlz(plz) {
    return Promise.all([
        _getLocalVersionsForPlz(plz),
    ]).then(([localversions]) => ({
        localversions,
    }))
}

