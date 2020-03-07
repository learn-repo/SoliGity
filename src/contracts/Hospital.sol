pragma solidity ^0.5.0;

contract Hospital {
    // only admin could add doctors
    address payable admin;

    string public hospitalName;
    uint256 public counter = 0;

    struct Appointment {
        uint256 id;
        uint16 year;
        uint8 month;
        uint8 day;
        address patientAddress;
        string patientName;
    }

    mapping(address => Appointment) public appointments;
    mapping(address => bool) public doctors;

    event AppointmentReserved(
        uint256 appointmentId,
        address patientAddress,
        string patientName
    );

    event AppointmenCancelled(
        uint256 appointmentId,
        address patientAddress,
        string patientName
    );

    event AppointmentConfirmed(
        uint256 appointmentId,
        address patientAddress,
        string patientName,
        address doctorAddress
    );

    constructor() public {
        admin = msg.sender;
        hospitalName = "AkiRA Hospital";
    }

    function makeAppointment(
        string memory _name,
        uint16 _year,
        uint8 _month,
        uint8 _day
    ) public {
        require(
            appointments[msg.sender].id == 0,
            "You have made appointment before."
        );
        counter++;
        appointments[msg.sender] = Appointment(
            counter,
            _year,
            _month,
            _day,
            msg.sender,
            _name
        );
        emit AppointmentReserved(counter, msg.sender, _name);
    }

    function cancelAppointment() public {
        require(
            appointments[msg.sender].id != 0,
            "You don't have an appointment"
        );
        Appointment memory _appointment = appointments[msg.sender];
        delete appointments[msg.sender];
        emit AppointmenCancelled(
            _appointment.id,
            msg.sender,
            _appointment.patientName
        );
    }

    function existsAppointment() public view returns (bool) {
        return appointments[msg.sender].id != 0;
    }

    function addDoctor(address doctor) public {
        require(doctor != address(0), "doctor is the zero address");
        require(msg.sender == admin, "You are not admin.");
        doctors[doctor] = true;
    }

    function isDoctor(address doctor) public view returns (bool) {
        require(doctor != address(0), "doctor is the zero address");
        return doctors[doctor];
    }

    function confirmAppointment(address patient) public {
        require(doctors[msg.sender], "You are not a doctor");
        Appointment memory _appointment = appointments[patient];
        delete appointments[msg.sender];
        emit AppointmentConfirmed(
            _appointment.id,
            _appointment.patientAddress,
            _appointment.patientName,
            msg.sender
        );
    }
}
