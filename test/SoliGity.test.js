const SoliGity = artifacts.require("SoliGity");
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract(SoliGity, ([deployer, customer1, customer2, customer3]) => {

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

   
});
