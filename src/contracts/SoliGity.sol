
pragma solidity >=0.4.21 <0.7.0;

contract SoliGity {

    string public dappName;
    uint public eventNumber = 0;   // total number of requests
    // event status to keep track of the status of reward event
    /*
    enum explaination
    no_requst - user has no request now
    help_wanted - user need help and sent a reward event
    under_review - user is reviewing the recent help
                -> if review been accepted -> eventstatus: approved
                -> if review been rejected -> eventstatus: help_wanted (rolls back to previous)
    approved - user approved the recent help (and issue been closed)
    */
    enum eventStatus {no_requst, help_wanted, under_review, approved}

    struct RewardEvent {
        uint eventID;                   // event ID to track each event
        // sponsor part - problem initiator
        uint sponsorID;                 // people who sent the request for help or review
        string sponsorName;             // sponsor's name/or github ID name
        address payable sponsorAddress;         // sponsor's ETH address
        // bounty hunter part - contributor
        uint bountyHunterID;            // people who helped the sponsor to solve the problem
        string bountyHunterName;        // bounty hunter's name/or github ID name
        address bountyHunterAddress;    // bounty hunter's ETH address
        // reward part
        uint256 bountyAmount;           // the amount of money that sponsor are willing to pay
        // track event status
        eventStatus status;             // defined in event status
    }

    // mapping adress to reward events - type public
    // use uint => RewardEvent because one user can send multiple reward events
    mapping (uint => RewardEvent) public RewardEvents;

    // constructor initalization
    constructor() public {
        dappName = "SoliGity";
    }

    /*
    events decleration:
    1. request a event
    2. review a event(request/pull request)
    3. approve a event
    4. reject a event
    */

    // event creation broadcast
    event RewardRequest (
        uint eventID,
        // sponsor part - problem initiator
        uint sponsorID,
        string sponsorName,
        address payable sponsorAddress,
        uint256 bountyAmount,       // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // event review broadcast
    // if someone pr first -> broadcast to the network early -> has priority to get the reward
    event RewardUnderReview (
        uint eventID,
        // sponsor part - problem initiator
        uint sponsorID,
        string sponsorName,
        address payable sponsorAddress,
         // bounty hunter part - contributor
        uint bountyHunterID,
        string bountyHunterName,
        address bountyHunterAddress,
        // amount
        uint256 bountyAmount,       // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // unfortunately - your pr is rejected due to some mistakes maybe, try next time
    event RewardRejected (
        uint eventID,
        // sponsor part - problem initiator
        uint sponsorID,
        string sponsorName,
        address payable sponsorAddress,
         // bounty hunter part - contributor
        uint bountyHunterID,
        string bountyHunterName,
        address bountyHunterAddress,
        // amount
        uint256 bountyAmount,       // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

     // unfortunately - your pr is rejected due to some mistakes maybe, try next time
    event RewardApproved (
        uint eventID,
        // sponsor part - problem initiator
        uint sponsorID,
        string sponsorName,
        address payable sponsorAddress,
         // bounty hunter part - contributor
        uint bountyHunterID,
        string bountyHunterName,
        address bountyHunterAddress,
        // amount
        uint256 bountyAmount,       // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // functions declearation
    // create a reward event
    function createRewardEvent(uint _sponsorID, string memory _sponsorName, uint256 _bountyAmount) public {
        require(bytes(_sponsorName).length > 0, 'Sponsor name should not be empty');
        require(_sponsorID != 0, 'Sponsor ID should not be 0');
        require(msg.sender.balance >= _bountyAmount, 'Sponsor should have enough money');
        // accumulate the number of events been requested
        eventNumber++;

        // reward events record
        RewardEvents[eventNumber] = RewardEvent(
            eventNumber,
            _sponsorID,
            _sponsorName,
            msg.sender,
            // no helper now so all null
            0,
            'null',
            address(0x0),
            _bountyAmount,
            eventStatus.help_wanted
        );

        // broadcast event to the network
        emit RewardRequest(
            eventNumber,
            _sponsorID,
            _sponsorName,
            msg.sender,
            _bountyAmount,
            eventStatus.help_wanted
        );
    }

    // review a reward event
    function reviewRewardEvent(uint _eventID, uint _bountyHunterID, string memory _bountyHunterName) public {
        RewardEvent memory _RewardEvent = RewardEvents[_eventID];
        require(bytes(_bountyHunterName).length > 0, 'Bounty hunter name should not be empty');
        require(_bountyHunterID != 0, 'Bounty hunter ID should not be 0');
        require(RewardEvents[_eventID].status == eventStatus.help_wanted, 'Event shold be help-wanted');

        // update bounty hunter info in struct
        _RewardEvent.bountyHunterID = _bountyHunterID;
        _RewardEvent.bountyHunterName = _bountyHunterName;
        _RewardEvent.bountyHunterAddress = msg.sender;
        _RewardEvent.status = eventStatus.under_review;
        // save it to the struct
        RewardEvents[_eventID] = _RewardEvent;

        // broadcast event to the network
        emit RewardUnderReview(
            RewardEvents[_eventID].eventID,
            RewardEvents[_eventID].sponsorID,
            RewardEvents[_eventID].sponsorName,
            RewardEvents[_eventID].sponsorAddress,
            RewardEvents[_eventID].bountyHunterID,
            RewardEvents[_eventID].bountyHunterName,
            RewardEvents[_eventID].bountyHunterAddress,
            RewardEvents[_eventID].bountyAmount,
            RewardEvents[_eventID].status
        );
    }

}
