pragma solidity >=0.4.21 <0.7.0;


contract SoliGity {
    string public dappName;
    uint256 public eventNumber = 0; // total number of requests
    uint256 public projectNumber = 0; // total number of projects

    // event status to keep track of the status of reward event
    /*
    help_wanted - user need help and sent a reward event
    under_review - user is reviewing the recent help
                -> if review been accepted -> eventstatus: approved
                -> if review been rejected -> eventstatus: help_wanted (rolls back to previous)
    approved - user approved the recent help (and issue been closed)
    */
    enum eventStatus {help_wanted, under_review, approved}

    struct RewardEvent {
        uint256 projectId; // link project to the event
        uint256 eventId; // event ID to track each event
        string title;
        uint256 issue;
        uint256 pullRequest;
        // sponsor part - problem initiator
        string sponsorName; // sponsor's name/or github ID name
        address sponsorAddress; // sponsor's ETH address
        uint256 bountyAmount; // the amount of money that sponsor are willing to pay
        // bounty hunter part - contributor
        string bountyHunterName; // bounty hunter's name/or github ID name
        address payable bountyHunterAddress; // bounty hunter's ETH address
        // track event status
        eventStatus status; // defined in event status
    }

    struct Project {
        uint256 id;
        string owner;
        string name;
        string description;
        string url;
    }

    // mapping adress to reward events - type public
    // use uint256 => RewardEvent because one user can send multiple reward events
    mapping(uint256 => RewardEvent) public rewardEvents;
    mapping(uint256 => Project) public projects;

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
    event CreateProjectEvent(
        uint256 id,
        string owner,
        string name,
        string description,
        string url
    );

    // event creation broadcast
    event CreateIssueEvent(
        uint256 projectId,
        uint256 eventId,
        string title,
        uint256 issue,
        // sponsor part - problem initiator
        string sponsorName,
        address sponsorAddress,
        uint256 bountyAmount, // the amount of money that sponsor are willing to pay
        // event status
        eventStatus status
    );

    // event review broadcast
    // if someone pr first -> broadcast to the network early -> has priority to get the reward
    event RequestReviewEvent(
        uint256 projectId,
        uint256 eventId,
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
        uint256 projectId,
        uint256 eventId,
        uint256 pullRequest,
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
        uint256 projectId,
        uint256 eventId,
        uint256 pullRequest,
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
        uint256 _projectId,
        string memory _title,
        string memory _sponsorName,
        uint256 _bountyAmount,
        uint256 _issue
    ) public {
        require(_projectId != 0, "Project Id should not be 0");
        require(bytes(_title).length > 0, "title should not be empty");
        require(
            bytes(_sponsorName).length > 0,
            "Sponsor name should not be empty"
        );
        require(
            msg.sender.balance >= _bountyAmount,
            "Sponsor should have enough money"
        );
        require(_issue != 0, "Issue should not be 0");
        // accumulate the number of events been requested
        eventNumber++;

        // reward events record
        rewardEvents[eventNumber] = RewardEvent(
            _projectId,
            eventNumber,
            _title,
            _issue,
            0, // pull request
            _sponsorName,
            msg.sender,
            _bountyAmount,
            "null", // bountyHunterName
            address(0x0), // bountyHunterAddress
            eventStatus.help_wanted
        );

        // broadcast event to the network
        emit CreateIssueEvent(
            _projectId,
            eventNumber,
            _title,
            _issue,
            _sponsorName,
            msg.sender,
            _bountyAmount,
            eventStatus.help_wanted
        );
    }

    function createProject(
        string memory _owner,
        string memory _name,
        string memory _description,
        string memory _url
    ) public {
        require(bytes(_owner).length > 0, "owner should not be empty");
        require(bytes(_name).length > 0, "name should not be empty");
        require(
            bytes(_description).length > 0,
            "description should not be empty"
        );
        require(bytes(_url).length > 0, "url should not be empty");
        projectNumber++;
        projects[projectNumber] = Project(
            projectNumber,
            _owner,
            _name,
            _description,
            _url
        );

        emit CreateProjectEvent(
            projectNumber,
            _owner,
            _name,
            _description,
            _url
        );
    }

    // review a reward event
    function requestReview(
        uint256 _eventId,
        string memory _bountyHunterName,
        uint256 _pullRequest
    ) public {
        RewardEvent memory _rewardEvent = rewardEvents[_eventId];
        require(
            bytes(_bountyHunterName).length > 0,
            "Bounty hunter name should not be empty"
        );
        require(
            rewardEvents[_eventId].status == eventStatus.help_wanted,
            "Event shold be help-wanted"
        );

        // update bounty hunter info in struct
        _rewardEvent.bountyHunterName = _bountyHunterName;
        _rewardEvent.bountyHunterAddress = msg.sender;
        _rewardEvent.pullRequest = _pullRequest;
        _rewardEvent.status = eventStatus.under_review;
        // save it to the struct
        rewardEvents[_eventId] = _rewardEvent;

        // broadcast event to the network
        emit RequestReviewEvent(
            rewardEvents[_eventId].projectId,
            rewardEvents[_eventId].eventId,
            rewardEvents[_eventId].sponsorName,
            rewardEvents[_eventId].sponsorAddress,
            rewardEvents[_eventId].bountyHunterName,
            rewardEvents[_eventId].bountyHunterAddress,
            rewardEvents[_eventId].bountyAmount,
            rewardEvents[_eventId].status
        );
    }

    // approve a reward event
    function approvePullRequest(uint256 _eventId) public payable {
        RewardEvent memory _rewardEvent = rewardEvents[_eventId];
        address payable _rewardRecevier = _rewardEvent.bountyHunterAddress;
        require(
            rewardEvents[_eventId].status == eventStatus.under_review,
            "Event shold be under-review"
        );
        require(
            msg.sender == _rewardEvent.sponsorAddress,
            "Only issue creator can approve an Pull & Request"
        );
        require(msg.value >= _rewardEvent.bountyAmount, "no sufficient value!");

        // change the status of the reward event to - approved
        _rewardEvent.status = eventStatus.approved;

        // save it to the struct
        rewardEvents[_eventId] = _rewardEvent;
        _rewardRecevier.transfer(_rewardEvent.bountyAmount);

        // broadcast event to the network
        emit RewardApproved(
            rewardEvents[_eventId].projectId,
            rewardEvents[_eventId].eventId,
            rewardEvents[_eventId].pullRequest,
            rewardEvents[_eventId].sponsorName,
            rewardEvents[_eventId].sponsorAddress,
            rewardEvents[_eventId].bountyHunterName,
            rewardEvents[_eventId].bountyHunterAddress,
            rewardEvents[_eventId].bountyAmount,
            rewardEvents[_eventId].status
        );
    }

    // reject a reward event
    function rejectPullRequest(uint256 _eventId) public {
        RewardEvent memory _rewardEvent = rewardEvents[_eventId];
        require(
            rewardEvents[_eventId].status == eventStatus.under_review,
            "Event shold be under-review"
        );
        require(
            msg.sender == _rewardEvent.sponsorAddress,
            "Only issue creator can approve an Pull & Request"
        );

        uint256 _pullRequest = _rewardEvent.pullRequest;
        string memory _bountyHunterName = _rewardEvent.bountyHunterName;
        address payable _bountyHunterAddress = _rewardEvent.bountyHunterAddress;

        // change the status of the reward event to - approved
        _rewardEvent.status = eventStatus.help_wanted;
        _rewardEvent.bountyHunterName = "null";
        _rewardEvent.bountyHunterAddress = address(0x0);
        _rewardEvent.pullRequest = 0;

        // save it to the struct
        rewardEvents[_eventId] = _rewardEvent;

        // broadcast event to the network
        emit RewardRejected(
            rewardEvents[_eventId].projectId,
            rewardEvents[_eventId].eventId,
            _pullRequest,
            rewardEvents[_eventId].sponsorName,
            rewardEvents[_eventId].sponsorAddress,
            _bountyHunterName,
            _bountyHunterAddress,
            rewardEvents[_eventId].bountyAmount,
            rewardEvents[_eventId].status
        );
    }
}
