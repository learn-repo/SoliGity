const SoliGity = artifacts.require("SoliGity");
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract(SoliGity, ([deployer, sponsor1, sponsor2, sponsor3]) => {

    let soliGity;

    before(async () => {
        soliGity = await SoliGity.deployed()
    })

    // deployment test
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

    // create issue tests
    describe('Testing Create Issue', async () => {
        let result;
        let numRequests;

        before(async () => {
            // user Daniel: ID 123 pay 2 ethers - sponsor 1 Project 1
            result = await soliGity.createIssue('1', 'test', '123', 'Daniel', web3.utils.toWei('2', 'Ether'), { from: sponsor1 })
            numRequests = await soliGity.eventNumber()
        })

        // create a request
        it('A customer should create an event successfully', async () => {
            assert.equal(numRequests, 1);
            const event = result.logs[0].args;
            assert.equal(event.projectID.toNumber(), 1, 'Project ID should be 1 since we have only 1 project');
            assert.equal(event.eventID.toNumber(), 1, 'number of events should be equal to 1 since this is the first test');
            assert.equal(event.sponsorID.toNumber(), 123, '1st user ID is 123, the result should be 123');
            assert.equal(event.title, 'test', 'title is test. .... ');
            assert.equal(event.sponsorName, 'Daniel', '1st user Name is Daniel. .... ');
            assert.equal(event.sponsorAddress, sponsor1, '1st user address should be sponsor 1 address');
        })

        // a request should be failed 
        it('Check the customer name and ID', async () => {
            await soliGity.createIssue('1', 'test', '', 'Daniel', '10', { from: sponsor1 }).should.be.rejected;
            await soliGity.createIssue('1', 'test', '123', '', '10', { from: sponsor1 }).should.be.rejected;
        })

        it('Check the request sender has enough money or not', async () => {
            await soliGity.createIssue('123', 'test', '', '999999999999999999999999999', { from: sponsor1 }).should.be.rejected;
        })

    })

    // asking review tests
    describe('Testing Request Review', async () => {
        let result;
        let numRequests;

        before(async () => {
            // bounryHunter submit his work ZhenPeng: ID 1234 - sponsor 2
            result = await soliGity.requestReview('1', '1234', 'ZhenPeng', { from: sponsor2 })
            numRequests = await soliGity.eventNumber()
        })

        it('A bounty hunter should submit his request successfully', async () => {
            assert.equal(numRequests, 1);
            const event = result.logs[0].args;
            assert.equal(event.eventID.toNumber(), 1, 'number of events should be equal to 1 since this is the first test');
            assert.equal(event.bountyHunterID.toNumber(), 1234, 'Bounty hunter user ID is 123, the result should be 123');
            assert.equal(event.bountyHunterName, 'ZhenPeng', 'Bounty hunter name is ZhenPeng . .... ');
            assert.equal(event.bountyHunterAddress, sponsor2, 'Bounty hunter user address should be sponsor 2 address');
            assert.equal(event.bountyAmount, web3.utils.toWei('2', 'Ether'), 'Bounty amount should be set to 10')
        })

        // a request should be rejected 
        it('Check the customer name and ID', async () => {
            await soliGity.requestReview(1, '123', '', { from: sponsor2 }).should.be.rejected;
            await soliGity.requestReview(1, '', 'Daniel', { from: sponsor2 }).should.be.rejected;
        })

        // a request should be rejected
        it('Check the event is help-wanted or not', async () => {
            // request review again for the same issue
            result = await soliGity.requestReview('1', '1234', 'ZhenPeng', { from: sponsor2 }).should.be.rejected;
        })

    })

    // approve PR tests
    describe('Testing Approve Request', async () => {
        let result;
        let numRequests;

        before(async () => {
            // sponsor 1 approve the PR
            result = await soliGity.approvePR('1', { from: sponsor1, value: web3.utils.toWei('3', 'Ether') });
            numRequests = await soliGity.eventNumber()
        })

        // a pr approve should be rejected
        it('approve should be rejected if do it twice', async () => {
            await soliGity.approvePR('1', { from: sponsor1, value: web3.utils.toWei('3', 'Ether') }).should.be.rejected;
        })

        // create issue - sponsor 3 | request review - sponsor 2 | approve spnosr - 1 (rejected)
        it('approve pr not from owner should be rejected', async () => {
            await soliGity.createIssue('1', 'test', '123', 'Daniel', web3.utils.toWei('2', 'Ether'), { from: sponsor3 });
            await soliGity.requestReview('2', '1234', 'ZhenPeng', { from: sponsor2 });
            await soliGity.approvePR('2', { from: sponsor1, value: web3.utils.toWei('3', 'Ether') }).should.be.rejected;
        })

        // should be approved if sponsor 3 send request
        it('approve pr from owner should be accepted', async () => {
            await soliGity.approvePR('2', { from: sponsor3, value: web3.utils.toWei('3', 'Ether') });
        })

        // send approve PR again from the issue already been approved
        it('approve second times should be rejected', async () => {
            await soliGity.approvePR('2', { from: sponsor3, value: web3.utils.toWei('3', 'Ether') }).should.be.rejected;
        })

    })

    // reject PR tests
    describe('Testing Reject Request', async () => {
        let result;
        let numRequests;

        // sponsor 3 - issue  |  sponsor 2 - request review | event - 3
        before(async () => {
            await soliGity.createIssue('1', 'test', '123', 'Daniel', web3.utils.toWei('2', 'Ether'), { from: sponsor3 });
            await soliGity.requestReview('3', '1234', 'ZhenPeng', { from: sponsor2 });
            numRequests = await soliGity.eventNumber()
        })

        // try to reject a PR request
        it('try to rejevt a PR should be accepted', async () => {
            await soliGity.rejectPR('3', { from: sponsor3 });
        })

        // try to reject a PR request 
        it('try to rejevt a PR twice should be rejected', async () => {
            await soliGity.rejectPR('3', { from: sponsor3 }).should.be.rejected;
        })

        // sponsor 3 - issue  |  sponsor 2 - request review | event - 4
        it('reject not from owner should be rejected', async () => {
            await soliGity.createIssue('1', 'test', '123', 'Daniel', web3.utils.toWei('2', 'Ether'), { from: sponsor3 });
            await soliGity.requestReview('4', '1234', 'ZhenPeng', { from: sponsor2 });
            await soliGity.rejectPR('4', { from: sponsor1 }).should.be.rejected;
        })

        // sponsor 3 - issue  | event - 5
        it('reject should not be accepted if issue are not under-review', async () => {
            await soliGity.createIssue('1', 'test', '123', 'Daniel', web3.utils.toWei('2', 'Ether'), { from: sponsor3 });
            await soliGity.rejectPR('5', { from: sponsor3 }).should.be.rejected;
        })


    })

})
