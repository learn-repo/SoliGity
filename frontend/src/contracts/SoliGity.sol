pragma solidity >=0.4.21 <0.7.0;

contract SoliGity {
    string public dappName;
    uint256 public eventNumber = 0; // total number of requests
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
        uint256 projectID;     // link project to the event
        uint256 eventID;       // event ID to track each event
        // sponsor part - problem initiator
        uint256 sponsorID;         // people who sent the request for help or review
        string  sponsorName;    // sponsor's name/or github ID name
        address sponsorAddress; // sponsor's ETH address
        // bounty hunter part - contributor
        uint256 bountyHunterID;        // people who helped the sponsor to solve the problem
        string  bountyHunterName;   // bounty hunter's name/or github ID name
        address payable bountyHunterAddress; // bounty hunter's ETH address
        // reward part
        uint256 bountyAmount; // the amount of money that sponsor are willing to pay
        // track event status
        eventStatus status; // defined in event status
    }

    // mapping adress to reward events - type public
    // use uint256 => RewardEvent because one user can send multiple reward events
    mapping(uint256 => RewardEvent) public RewardEvents;

    // constructor initalization
    constructor() public {
        dappName = "SoliGity";
    }

    /*
    events decleration:
    1. create an issue
    2. request a review
    3. approve an issue
    4. reject an issue
    */

    // event creation broadcast
    event createIssueEvent(
        uint256 projectID,
        uint256 eventID,
        // sponsor part - problem initiator
        uint256 sponsorID,
        string  sponsorName,
        address sponsorAddress,
        uint256 bountyAmount, // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // event review broadcast
    // if someone pr first -> broadcast to the network early -> has priority to get the reward
    event createIssueEvent(
        uint256 projectID,
        uint256 eventID,
        // sponsor part - problem initiator
        uint256 sponsorID,
        string  sponsorName,
        address sponsorAddress,
        // bounty hunter part - contributor
        uint256 bountyHunterID,
        string  bountyHunterName,
        address payable bountyHunterAddress,
        // amount
        uint256 bountyAmount, // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // unfortunately - your pr is rejected due to some mistakes maybe, try next time
    event RewardRejected(
        uint256 projectID,
        uint256 eventID,
        // sponsor part - problem initiator
        uint256 sponsorID,
        string  sponsorName,
        address sponsorAddress,
        // bounty hunter part - contributor
        uint256 bountyHunterID,
        string  bountyHunterName,
        address payable bountyHunterAddress,
        // amount
        uint256 bountyAmount, // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // unfortunately - your pr is rejected due to some mistakes maybe, try next time
    event RewardApproved(
        uint256 projectID,
        uint256 eventID,
        // sponsor part - problem initiator
        uint256 sponsorID,
        string  sponsorName,
        address sponsorAddress,
        // bounty hunter part - contributor
        uint256 bountyHunterID,
        string  bountyHunterName,
        address payable bountyHunterAddress,
        // amount
        uint256 bountyAmount, // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // functions declearation
    // create a reward event
    function createIssue(uint256 _projectID, uint256 _sponsorID, string memory _sponsorName, uint256 _bountyAmount) public {
        require(bytes(_sponsorName).length > 0, "Sponsor name should not be empty");
        require(_sponsorID != 0, "Sponsor ID should not be 0");
        require(_projectID != 0, "Project ID should not be 0");
        require(msg.sender.balance >= _bountyAmount, "Sponsor should have enough money");
        // accumulate the number of events been requested
        eventNumber++;

        // reward events record
        RewardEvents[eventNumber] = RewardEvent(
            _projectID,
            eventNumber,
            _sponsorID,
            _sponsorName,
            msg.sender,
            // no helper now so all null
            0,
            "null",
            address(0x0),
            _bountyAmount,
            eventStatus.help_wanted
        );

        // broadcast event to the network
        emit createIssueEvent(
            _projectID,
            eventNumber,
            _sponsorID,
            _sponsorName,
            msg.sender,
            _bountyAmount,
            eventStatus.help_wanted
        );
    }

    // review a reward event
    function requestReview( uint256 _eventID, uint256 _bountyHunterID, string memory _bountyHunterName) public {
        RewardEvent memory _RewardEvent = RewardEvents[_eventID];
        require(bytes(_bountyHunterName).length > 0, "Bounty hunter name should not be empty");
        require(_bountyHunterID != 0, "Bounty hunter ID should not be 0");
        require(RewardEvents[_eventID].status == eventStatus.help_wanted,"Event shold be help-wanted");

        // update bounty hunter info in struct
        _RewardEvent.bountyHunterID = _bountyHunterID;
        _RewardEvent.bountyHunterName = _bountyHunterName;
        _RewardEvent.bountyHunterAddress = msg.sender;
        _RewardEvent.status = eventStatus.under_review;
        // save it to the struct
        RewardEvents[_eventID] = _RewardEvent;

        // broadcast event to the network
        emit createIssueEvent(
            RewardEvents[_eventID].projectID,
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

    // approve a reward event
    function approvePR( uint256 _eventID) public payable {
        RewardEvent memory _RewardEvent = RewardEvents[_eventID];
        address payable _rewardRecevier = _RewardEvent.bountyHunterAddress;
        require(RewardEvents[_eventID].status == eventStatus.under_review, "Event shold be under-review");
        require(msg.sender == _RewardEvent.sponsorAddress, "Only issue creator can approve an PR");

        // change the status of the reward event to - approved
        _RewardEvent.status = eventStatus.approved;

        // save it to the struct
        RewardEvents[_eventID] = _RewardEvent;
        _rewardRecevier.transfer(_RewardEvent.bountyAmount);
        // broadcast event to the network
        emit RewardApproved(
            RewardEvents[_eventID].projectID,
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

    // reject a reward event
    function rejectPR( uint256 _eventID) public payable {
        RewardEvent memory _RewardEvent = RewardEvents[_eventID];
        require(RewardEvents[_eventID].status == eventStatus.under_review, "Event shold be under-review");
        require(msg.sender == _RewardEvent.sponsorAddress, "Only issue creator can approve an PR");

        // change the status of the reward event to - approved
        _RewardEvent.status = eventStatus.help_wanted;

        // save it to the struct
        RewardEvents[_eventID] = _RewardEvent;

        // broadcast event to the network
        emit RewardApproved(
            RewardEvents[_eventID].projectID,
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
