pragma solidity ^0.5.0;

contract MovieSys {
    string public sysName;

    uint256 public constant price = 1 ether;

    struct MovieTicket {
        bool isValidTicket;
        string movieName;
        uint256 customerAge;
        bool hasCheckedIn;
    }

    mapping(address => MovieTicket) public tickets;

    event TicketBooked(
        address ticketOwner,
        bool isValidTicket,
        string movieName,
        uint256 customerAge,
        bool hasCheckedIn,
        uint256 price
    );

    event TicketCheckedIn(
        address ticketOwner,
        bool isValidTicket,
        string movieName,
        uint256 customerAge,
        bool hasCheckedIn
    );

    event TicketCancelled(
        address ticketOwner,
        bool isValidTicket,
        string movieName,
        uint256 customerAge,
        bool hasCheckedIn,
        uint256 refund
    );

    constructor() public {
        sysName = "Online Movie Ticket Service";
    }

    function buyTicket(string memory _movieName, uint256 _age) public payable {
        require(bytes(_movieName).length > 0, "Movie's name is required!");
        require(_age >= 18, "Invalid age, it should be greater than 18.");
        require(
            !tickets[msg.sender].isValidTicket ||
                (tickets[msg.sender].isValidTicket &&
                    tickets[msg.sender].hasCheckedIn),
            "You already bought a ticket before."
        );
        require(msg.value >= price, "Payment should be enough!");
        tickets[msg.sender] = MovieTicket(true, _movieName, _age, false);
        emit TicketBooked(msg.sender, true, _movieName, _age, false, price);
    }

    function checkInTicket() public {
        MovieTicket memory _ticket = tickets[msg.sender];
        require(_ticket.isValidTicket, "You havn't bought a ticket before.");
        require(!_ticket.hasCheckedIn, "You already checked in.");
        _ticket.hasCheckedIn = true;
        tickets[msg.sender] = _ticket;
        emit TicketCheckedIn(
            msg.sender,
            _ticket.isValidTicket,
            _ticket.movieName,
            _ticket.customerAge,
            true
        );
    }

    function cancalTicket() public payable {
        MovieTicket memory _ticket = tickets[msg.sender];
        require(_ticket.isValidTicket, "You havn't bought a ticket before.");
        require(!_ticket.hasCheckedIn, "You already checked in.");
        _ticket.isValidTicket = false;
        tickets[msg.sender] = _ticket;
        msg.sender.transfer(price);
        emit TicketCancelled(
            msg.sender,
            _ticket.isValidTicket,
            _ticket.movieName,
            _ticket.customerAge,
            _ticket.hasCheckedIn,
            price
        );
    }

}
