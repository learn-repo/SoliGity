
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
                -> if review been rejected -> eventstatus: under_review (rolls back to previous)
    approved - user approved the recent help (and issue been closed)
    */
    enum eventStatus {no_requst, help_wanted, under_review, approved}

    struct RewardEvenet {
        uint eventID;                   // event ID to track each event
        // sponsor part - problem initiator
        uint sponsorID;                 // people who sent the request for help or review
        string sponsorName;             // sponsor's name/or github ID name
        address sponsorAddress;         // sponsor's ETH address
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
    mapping (uint => RewardEvenet) public RewardEvenets;

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
    event RewardEventRequest (
        uint eventID,
        // sponsor part - problem initiator
        uint sponsorID,
        string sponsorName,
        address sponsorAddress,
        uint256 bountyAmount,       // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // event review broadcast
    // if someone pr first -> broadcast to the network early -> has priority to get the reward
    event RewardEventUnderReview (
        uint eventID,
        // sponsor part - problem initiator
        uint sponsorID,
        string sponsorName,
        address sponsorAddress,
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
    event RewardEventRejected (
         uint eventID,
        // sponsor part - problem initiator
        uint sponsorID,
        string sponsorName,
        address sponsorAddress,
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
    event RewardEventApproved (
         uint eventID,
        // sponsor part - problem initiator
        uint sponsorID,
        string sponsorName,
        address sponsorAddress,
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
    function createRewardEvent(string memory _sponsorName, uint _sponsorID, uint256 _bountyAmount) public {
        require(bytes(_sponsorName).length > 0, 'Sponsor Name should not be empty');
        require(_sponsorID != 0, 'Sponsor ID should not be 0');
        require(msg.sender.balance >= _bountyAmount, 'Sponsor should have enough money');
        // accumulate the number of events been requested
        eventNumber++;

        // reward events record
        RewardEvenets[eventNumber] = RewardEvenet(
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

        // emit event to the network
        emit RewardEventRequest(
            eventNumber,
            _sponsorID,
            _sponsorName,
            msg.sender,
            _bountyAmount,
            eventStatus.help_wanted
        );
    }

    
    /*
    function featureRequest() public payable {
        // TODO:
    }

    function createIssue() public {
        // TODO:
    }
    */
}
