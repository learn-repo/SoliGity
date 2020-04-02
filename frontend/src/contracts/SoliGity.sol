pragma solidity >=0.4.21 <0.7.0;


contract SoliGity {
    string public dappName;
    uint256 public eventNumber = 0; // total number of requests
    // event status to keep track of the status of reward event
    uint256 public projectNumber = 0;
    /*
    enum explaination
    no_requst - user has no request now
    help_wanted - user need help and sent a reward event
    under_review - user is reviewing the recent help
                -> if review been accepted -> eventstatus: approved
                -> if review been rejected -> eventstatus: help_wanted (rolls back to previous)
    approved - user approved the recent help (and issue been closed)
    */
    enum eventStatus {help_wanted, under_review, approved}

    struct RewardEvent {
        uint256 projectID; // link project to the event
        uint256 eventID; // event ID to track each event
        string title;
        // sponsor part - problem initiator
        string sponsorName; // sponsor's name/or github ID name
        address sponsorAddress; // sponsor's ETH address
        // bounty hunter part - contributor
        string bountyHunterName; // bounty hunter's name/or github ID name
        address payable bountyHunterAddress; // bounty hunter's ETH address
        uint256 PR;
        // reward part
        uint256 bountyAmount; // the amount of money that sponsor are willing to pay
        // track event status
        eventStatus status; // defined in event status
    }

    struct Project {
        uint256 ProjectID;
        string owner;
        string name;
        string description;
        string url;
    }

    // mapping adress to reward events - type public
    // use uint256 => RewardEvent because one user can send multiple reward events
    mapping(uint256 => RewardEvent) public RewardEvents;
    mapping(uint256 => Project) public Projects;

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

    event createProjectEvent(
        uint256 ProjectID,
        string owner,
        string name,
        string description,
        string url
    );

    // event creation broadcast
    event createIssueEvent(
        uint256 projectID,
        uint256 eventID,
        string title,
        // sponsor part - problem initiator
        string sponsorName,
        address sponsorAddress,
        uint256 bountyAmount, // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // event review broadcast
    // if someone pr first -> broadcast to the network early -> has priority to get the reward
    event requestReviewEvent(
        uint256 projectID,
        uint256 eventID,
        // sponsor part - problem initiator
        string sponsorName,
        address sponsorAddress,
        // bounty hunter part - contributor
        string bountyHunterName,
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
        string sponsorName,
        address sponsorAddress,
        // bounty hunter part - contributor
        string bountyHunterName,
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
        string sponsorName,
        address sponsorAddress,
        // bounty hunter part - contributor
        string bountyHunterName,
        address payable bountyHunterAddress,
        // amount
        uint256 bountyAmount, // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // functions declearation
    // create a reward event
    function createIssue(
        uint256 _projectID,
        string memory _title,
        string memory _sponsorName,
        uint256 _bountyAmount
    ) public {
        require(
            bytes(_sponsorName).length > 0,
            "Sponsor name should not be empty"
        );
        require(bytes(_title).length > 0, "title should not be empty");
        require(_projectID != 0, "Project ID should not be 0");
        require(
            msg.sender.balance >= _bountyAmount,
            "Sponsor should have enough money"
        );
        // accumulate the number of events been requested
        eventNumber++;

        // reward events record
        RewardEvents[eventNumber] = RewardEvent(
            _projectID,
            eventNumber,
            _title,
            _sponsorName,
            msg.sender,
            // no helper now so all null
            "null",
            address(0x0),
            0,
            _bountyAmount,
            eventStatus.help_wanted
        );

        // broadcast event to the network
        emit createIssueEvent(
            _projectID,
            eventNumber,
            _title,
            _sponsorName,
            msg.sender,
            _bountyAmount,
            eventStatus.help_wanted
        );
    }

    function createProject(
        string memory owner,
        string memory name,
        string memory description,
        string memory url
    ) public {
        require(bytes(owner).length > 0, "owner should not be empty");
        require(bytes(name).length > 0, "name should not be empty");
        require(
            bytes(description).length > 0,
            "description should not be empty"
        );
        require(bytes(url).length > 0, "url should not be empty");
        projectNumber++;
        Projects[projectNumber] = Project(
            projectNumber,
            owner,
            name,
            description,
            url
        );

        emit createProjectEvent(projectNumber, owner, name, description, url);
    }

    // review a reward event
    function requestReview(
        uint256 _eventID,
        string memory _bountyHunterName,
        uint256 _PR
    ) public {
        RewardEvent memory _RewardEvent = RewardEvents[_eventID];
        require(
            bytes(_bountyHunterName).length > 0,
            "Bounty hunter name should not be empty"
        );
        require(
            RewardEvents[_eventID].status == eventStatus.help_wanted,
            "Event shold be help-wanted"
        );

        // update bounty hunter info in struct
        _RewardEvent.bountyHunterName = _bountyHunterName;
        _RewardEvent.bountyHunterAddress = msg.sender;
        _RewardEvent.PR = _PR;
        _RewardEvent.status = eventStatus.under_review;
        // save it to the struct
        RewardEvents[_eventID] = _RewardEvent;

        // broadcast event to the network
        emit requestReviewEvent(
            RewardEvents[_eventID].projectID,
            RewardEvents[_eventID].eventID,
            RewardEvents[_eventID].sponsorName,
            RewardEvents[_eventID].sponsorAddress,
            RewardEvents[_eventID].bountyHunterName,
            RewardEvents[_eventID].bountyHunterAddress,
            RewardEvents[_eventID].bountyAmount,
            RewardEvents[_eventID].status
        );
    }

    // approve a reward event
    function approvePR(uint256 _eventID) public payable {
        RewardEvent memory _RewardEvent = RewardEvents[_eventID];
        address payable _rewardRecevier = _RewardEvent.bountyHunterAddress;
        require(
            RewardEvents[_eventID].status == eventStatus.under_review,
            "Event shold be under-review"
        );
        require(
            msg.sender == _RewardEvent.sponsorAddress,
            "Only issue creator can approve an PR"
        );
        require(msg.value >= _RewardEvent.bountyAmount, "no sufficient value!");

        // change the status of the reward event to - approved
        _RewardEvent.status = eventStatus.approved;

        // save it to the struct
        RewardEvents[_eventID] = _RewardEvent;
        _rewardRecevier.transfer(_RewardEvent.bountyAmount);
        // broadcast event to the network
        emit RewardApproved(
            RewardEvents[_eventID].projectID,
            RewardEvents[_eventID].eventID,
            RewardEvents[_eventID].sponsorName,
            RewardEvents[_eventID].sponsorAddress,
            RewardEvents[_eventID].bountyHunterName,
            RewardEvents[_eventID].bountyHunterAddress,
            RewardEvents[_eventID].bountyAmount,
            RewardEvents[_eventID].status
        );
    }

    // reject a reward event
    function rejectPR(uint256 _eventID) public {
        RewardEvent memory _RewardEvent = RewardEvents[_eventID];
        require(
            RewardEvents[_eventID].status == eventStatus.under_review,
            "Event shold be under-review"
        );
        require(
            msg.sender == _RewardEvent.sponsorAddress,
            "Only issue creator can approve an PR"
        );

        // change the status of the reward event to - approved
        _RewardEvent.status = eventStatus.help_wanted;
        _RewardEvent.bountyHunterName = "null";
        _RewardEvent.bountyHunterAddress = address(0x0);
        _RewardEvent.PR = 0;

        // save it to the struct
        RewardEvents[_eventID] = _RewardEvent;

        // broadcast event to the network
        emit RewardRejected(
            RewardEvents[_eventID].projectID,
            RewardEvents[_eventID].eventID,
            RewardEvents[_eventID].sponsorName,
            RewardEvents[_eventID].sponsorAddress,
            RewardEvents[_eventID].bountyHunterName,
            RewardEvents[_eventID].bountyHunterAddress,
            RewardEvents[_eventID].bountyAmount,
            RewardEvents[_eventID].status
        );
    }
}
