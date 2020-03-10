const SoliGity = artifacts.require("SoliGity");
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract(SoliGity, ([deployer, sponsor1, sponsor2, sponsor3]) => {

    let soliGity;

    before(async () => {
        soliGity = await SoliGity.deployed()
    })

    describe('Deployment', async () => {
        it('The deployment should be done successfully', async () => {
            const address = await soliGity.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('The deployed smart contract has the correct name', async () => {
            const name = await soliGity.dappName();
            assert.equal(name, "SoliGity");
        })
    })

    describe('Testing Reward Request', async () => {
        let result;
        let numRequests;

        before(async () => {
            // user Daniel: ID 123 pay 10000 - sponsor 1
            result = await soliGity.createRewardEvent('123', 'Daniel', '10000', { from: sponsor1 })
            numRequests = await soliGity.eventNumber()
        })

        // create a request
        it('a customer should create an event successfully', async () => {
            assert.equal(numRequests, 1);
            const event = result.logs[0].args;
            assert.equal(event.eventID.toNumber(), 1, 'number of events should be equal to 1 since this is the first test');
            assert.equal(event.sponsorID.toNumber(), 123, '1st user ID is 123, the result should be 123');
            assert.equal(event.sponsorName, 'Daniel', '1st user Name is Daniel. .... ');
            assert.equal(event.sponsorAddress, sponsor1, '1st user address should be sponsor 1 address');
        })

        // a request should be failed 
        it('Check the customer name and ID', async () => {
            await soliGity.createRewardEvent('', 'Daniel', '10000', { from: sponsor1 }).should.be.rejected;
            await soliGity.createRewardEvent('123', '', '10000', { from: sponsor1 }).should.be.rejected;
        })

        it('Check the request sender has enough money or not', async () => {
            await soliGity.createRewardEvent('123', '', '999999999999999999999999999', { from: sponsor1 }).should.be.rejected;
        })

    })
})
