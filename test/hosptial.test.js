const Hospital = artifacts.require("Hospital");
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract(Hospital, ([deployer, patient, doctor]) => {

    let hospital;

    before(async () => {
        hospital = await Hospital.deployed()
    })

    describe('Deployment', async () => {
        it('The deployment should be done successfully', async () => {
            const address = await hospital.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('The deployed smart contract has the correct name', async () => {
            const name = await hospital.hospitalName();
            assert.equal(name, "AkiRA Hospital");
        })
    })

    describe('Making an appointment', async () => {
        let result, counter;

        before(async () => {
            result = await hospital.makeAppointment('ZP', 2020, 2, 12, { from: patient })
            counter = await hospital.counter()
        })

        it('Making an appointment successful if all correct', async () => {
            //SUCCESSFUL
            assert.equal(counter, 1);
            const event = result.logs[0].args;
            assert.equal(event.appointmentId.toNumber(), counter.toNumber(), 'id is correct');
            assert.equal(event.patientAddress, patient, 'patient address is correct');
            assert.equal(event.patientName, 'ZP', 'patient Name is correct');
        })

        it('existsAppointment Test', async () => {
            let exists = await hospital.existsAppointment({ from: patient });
            assert.isTrue(exists);
        })

        it('Make reservation again', async () => {
            await hospital.makeAppointment('ZP', 2022, 2, 20, { from: patient }).should.be.rejected;
        })

        it('Cancel an appointment', async () => {
            let exists = await hospital.existsAppointment({ from: patient });
            assert.isTrue(exists);
            let id = await hospital.counter()
            let cancel = await hospital.cancelAppointment({ from: patient });
            const event = cancel.logs[0].args;
            assert.equal(event.appointmentId.toNumber(), id.toNumber(), 'id is correct');
            assert.equal(event.patientAddress, patient, 'patient address is correct');
            assert.equal(event.patientName, 'ZP', 'patient Name is correct');
            exists = await hospital.existsAppointment({ from: patient });
            assert.isFalse(exists);
        })
    })

    describe('Adding a doctor', async () => {

        let result;

        it('Adding a doctor', async () => {
            let isDoctor = await hospital.isDoctor(doctor, { from: patient });
            assert.isFalse(isDoctor);
            result = await hospital.addDoctor(doctor, { from: deployer });
            isDoctor = await hospital.isDoctor(doctor, { from: patient });
            assert.isTrue(isDoctor);
        })

        it('Fail to add a doctor, not admin', async () => {
            await hospital.addDoctor(doctor, { from: patient }).should.be.rejected;
        })
    })

    describe('Confirming an appointment', async () => {
        let result, counter;

        before(async () => {
            result = await hospital.makeAppointment('ZP', 2020, 2, 12, { from: patient })
            counter = await hospital.counter()
        })

        it('Making an appointment successful if all correct', async () => {
            //SUCCESSFUL
            let confirm = await hospital.confirmAppointment(patient, { from: doctor });
            const event = confirm.logs[0].args;
            assert.equal(event.appointmentId.toNumber(), counter.toNumber(), 'id is correct');
            assert.equal(event.patientAddress, patient, 'patient address is correct');
            assert.equal(event.patientName, 'ZP', 'patient Name is correct');
            assert.equal(event.doctorAddress, doctor, 'doctor address is correct');
        })

    })
});
