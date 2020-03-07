const MovieSys = artifacts.require("MovieSys");
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract(MovieSys, ([deployer, customer1, customer2, customer3]) => {

    let movieSys;

    before(async () => {
        movieSys = await MovieSys.deployed()
    })

    describe('Deployment', async () => {
        it('The deployment should be done successfully', async () => {
            const address = await movieSys.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('The deployed smart contract has the correct name', async () => {
            const name = await movieSys.sysName();
            assert.equal(name, "Online Movie Ticket Service");
        })
    })

    describe('Testing', async () => {
        let result;
        let oldBalance;

        before(async () => {
            oldBalance = await web3.eth.getBalance(customer1);
            oldBalance = new web3.utils.BN(oldBalance);
            result = await movieSys.buyTicket("AKIRA", 22, { from: customer1, value: web3.utils.toWei('1', 'Ether') })
        })

        it('If everything is OK, a customer should make a booking successfully', async () => {
            const event = result.logs[0].args;
            assert.equal(event.ticketOwner, customer1, 'ticketOwner address is correct');
            assert.isTrue(event.isValidTicket, "isValidTicket is correct");
            assert.equal(event.movieName, "AKIRA", 'ticketOwner address is correct');
            assert.equal(event.customerAge, 22, "customerAge is correct");
            assert.isFalse(event.hasCheckedIn, "hasCheckedIn is correct");
            assert.equal(event.price, "1000000000000000000", "price is correct");

            let newBalance = await web3.eth.getBalance(customer1);
            newBalance = await new web3.utils.BN(newBalance);

            let price;
            price = web3.utils.toWei('1', 'Ether');
            price = new web3.utils.BN(price);

            const expectedBalacne = oldBalance.sub(price);
            assert.isTrue(newBalance.lt(expectedBalacne));
            assert.isTrue(oldBalance.gt(newBalance));
        })

        it('A customer can check in if everything is good', async () => {
            let checkin = await movieSys.checkInTicket({ from: customer1 });
            const event = checkin.logs[0].args;
            assert.equal(event.ticketOwner, customer1, 'ticketOwner address is correct');
            assert.isTrue(event.isValidTicket, "isValidTicket is correct");
            assert.equal(event.movieName, "AKIRA", 'ticketOwner address is correct');
            assert.equal(event.customerAge, 22, "customerAge is correct");
            assert.isTrue(event.hasCheckedIn, "hasCheckedIn is correct");
        })

        it('A customer cannot book a ticket is either the movieName is an empty string or the customer Age is less than 18', async () => {
            await movieSys.buyTicket("", 22, { from: customer1, value: web3.utils.toWei('1', 'Ether') })
                .should.be.rejected;
            await movieSys.buyTicket("AKIRA", 12, { from: customer1, value: web3.utils.toWei('1', 'Ether') })
                .should.be.rejected;
        })

        it('A customer cannot check in if the ticket is not valid', async () => {
            // customer3 haven't booked a ticket before
            await movieSys.checkInTicket({ from: customer3 }).should.be.rejected;
            // customer1 have booked, but have already checkied in 
            await movieSys.checkInTicket({ from: customer1 }).should.be.rejected;
        })

        it('A customer cannot refund the ticket if the customer has checked in', async () => {
            await movieSys.cancalTicket({ from: customer1 }).should.be.rejected;
        })

        it('A customer cannot buy another ticket before she/he has checked in the movie show or canceled the movie ticket', async () => {
            // customer1 buy a ticket, but haven't checked in
            await movieSys.buyTicket("AKIRA", 22, { from: customer1, value: web3.utils.toWei('1', 'Ether') })
            // customer1 buy a ticket again
            await movieSys.buyTicket("AKIRA", 22, { from: customer1, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        })

        it("A customer cannot make a booking if he/she doesn't send enough to the smart contract", async () => {
            await movieSys.buyTicket("AKIRA", 22, { from: customer1, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
        })

        it('A customer should receive the money when she/he cancel the booking successfully', async () => {
            await movieSys.buyTicket("AKIRA", 22, { from: customer2, value: web3.utils.toWei('1', 'Ether') })
            let oldBalanceCancel = await web3.eth.getBalance(customer2);
            oldBalanceCancel = new web3.utils.BN(oldBalanceCancel);
            let cancel = await movieSys.cancalTicket({ from: customer2 });
            const event = cancel.logs[0].args;
            assert.equal(event.ticketOwner, customer2, 'ticketOwner address is correct');
            assert.isFalse(event.isValidTicket, "isValidTicket is correct");
            assert.equal(event.movieName, "AKIRA", 'ticketOwner address is correct');
            assert.equal(event.customerAge, 22, "customerAge is correct");
            assert.isFalse(event.hasCheckedIn, "hasCheckedIn is correct");
            assert.equal(event.refund, "1000000000000000000", "price is correct");

            let newBalanceCancel = await web3.eth.getBalance(customer2);
            newBalanceCancel = await new web3.utils.BN(newBalanceCancel);

            let price;
            price = web3.utils.toWei('1', 'Ether');
            price = new web3.utils.BN(price);

            const expectedBalacne = oldBalanceCancel.add(price);
            assert.isTrue(expectedBalacne.gt(newBalanceCancel));
            assert.isTrue(oldBalanceCancel.lt(newBalanceCancel));
        })
    })
});
