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



    // describe('Adding and selling item', async () => {
    //     let result, totalNumber

    //     before(async () => {
    //         result = await ethbay.createItem('T-Shirt', web3.utils.toWei('1', 'Ether'), { from: seller })
    //         totalNumber = await ethbay.totalNumber()
    //     })

    //     it('Creating item should be successful if all correct', async () => {
    //         //SUCCESSFUL
    //         assert.equal(totalNumber, 1);
    //         const event = result.logs[0].args;
    //         assert.equal(event.itemId.toNumber(), totalNumber.toNumber(), 'item id is correct');
    //         assert.equal(event.itemName, 'T-Shirt', 'item name is correct');
    //         assert.equal(event.itemPrice, '1000000000000000000', 'item price is correct');
    //         assert.equal(event.itemOwner, seller, 'item owner is correct');
    //         assert.equal(event.isItemSold, false, 'item not sold is correct');
    //     })

    //     it('Creating item should be failed if either no name or no price', async () => {
    //         //Product must have a name
    //         await ethbay.createItem('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
    //         //Price must be greater than 0
    //         await ethbay.createItem('T-Shirt', web3.utils.toWei('0', 'Ether'), { from: seller }).should.be.rejected;
    //     })

    //     it('Check the item created', async () => {
    //         const item = await ethbay.items(totalNumber);
    //         assert.equal(item.itemId.toNumber(), totalNumber.toNumber(), 'Item id is correct');
    //         assert.equal(item.itemName, 'T-Shirt', 'Item name is correct');
    //         assert.equal(item.itemPrice, '1000000000000000000', 'Item price is correct');
    //         assert.equal(item.itemOwner, seller, 'Item owner is correct');
    //         assert.equal(item.isItemSold, false, 'item not sold is correct');
    //     })

    //     it('Sell the item', async () => {
    //         let sellerOldBalance;
    //         sellerOldBalance = await web3.eth.getBalance(seller);
    //         sellerOldBalance = new web3.utils.BN(sellerOldBalance); // for calculating big number

    //         // SUCCESS: Buyer makes purchase
    //         result = await ethbay.buyItem(totalNumber, { from: buyer, value: web3.utils.toWei('1', 'Ether') });

    //         // Check Log
    //         const event = result.logs[0].args;
    //         assert.equal(event.itemId.toNumber(), totalNumber.toNumber(), 'Item id is correct');
    //         assert.equal(event.itemName, 'T-Shirt', 'Item name is correct');
    //         assert.equal(event.itemPrice, '1000000000000000000', 'Item price is correct');
    //         assert.equal(event.itemOwner, buyer, 'Item owner is correct');
    //         assert.equal(event.isItemSold, true, 'Item sold is correct');

    //         // Check the seller receives the funds
    //         let sellerNewBalance;
    //         sellerNewBalance = await web3.eth.getBalance(seller);
    //         sellerNewBalance = await new web3.utils.BN(sellerNewBalance);

    //         let price;
    //         price = web3.utils.toWei('1', 'Ether');
    //         price = new web3.utils.BN(price);

    //         const expectedBalacne = sellerOldBalance.add(price);
    //         assert.equal(expectedBalacne.toString(), sellerNewBalance.toString());
    //     })

    //     it('Selling the item twice should be rejected', async () => {
    //         // FAILURE: Cannot be purchased twice
    //         await ethbay.buyItem(totalNumber, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    //     })

    //     it('Selling the item with wrong Id should be rejected', async () => {
    //         // FAILURE: Invalid Item ID
    //         await ethbay.buyItem(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    //     })

    //     it('Adding another testing item should be succefully done', async () => {
    //         await ethbay.createItem('Something', web3.utils.toWei('1', 'Ether'), { from: seller });
    //     })

    //     it('Buying the item with insufficient fund should be failed', async () => {
    //         // FAILURE: Invalid Value in Payment
    //         await ethbay.buyItem(totalNumber, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
    //     })

    //     it('Seller buying item from her/hisself should be rejected', async () => {
    //         // FAILURE: Invalid Buyer cannot be the Seller
    //         await ethbay.buyItem(totalNumber, { from: seller, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    //     })

    // })
});
