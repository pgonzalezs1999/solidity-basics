//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";

interface IMockToken {
    function mintTo(address student) external;
    function mintExtraTo(address student) external;
}

contract Assistance is Ownable {
    IMockToken mockToken;
    uint256 public lessonCounter;
    uint256 public lastLimitTime;
    bytes32 private _lastPassword;
    mapping (address => bool) public students; // student => isStudent
    mapping (uint256 => mapping (address => bool)) public attendance; // lessonID => student => did_attend
    mapping (address => uint256) public attendanceOf; // student => number_of_lessons_attended
    mapping (uint256 => uint256) public lessonAttendance; // lessonID => number_of_students_attended

    event ClassCreated(uint256 indexed lessonId, uint256 createdAt);
    event StudentAttended(uint256 indexed lessonId, address indexed student, uint256 timestamp);

    constructor(IMockToken disrup3Token) {
        owner = msg.sender;
        mockToken = disrup3Token;
    }

    modifier onlyStudent() {
        require(students[msg.sender] == true, "You are not a student");
        _;
    }

    function addStudent(address newStudent) external onlyAdmin() {
        require(newStudent != address(0), "Invalid address");
        require(newStudent != owner, "The owner already has admin privileges");
        require(students[newStudent] == false, "They are already a student");
        students[newStudent] = true;
    }

    function removeStudent(address newStudent) external onlyAdmin() {
        require(newStudent != address(0), "Invalid address");
        require(newStudent != owner, "Can't remove admin privileges to the owner");
        require(students[newStudent] == true, "They are already not a student");
        students[newStudent] = false;
    }

    function addLesson(bytes32 newPassword) external onlyAdmin {
        if(lessonCounter > 0) {
            require(block.timestamp > lastLimitTime, "There is already an active check-in");
        }
        lessonCounter++;
        lastLimitTime = block.timestamp + 10 * 1 seconds;
        _lastPassword = newPassword;
    }

    function attend(string memory tryPassword) external onlyStudent {
        require(lastLimitTime >= block.timestamp, "There are no active checkins right now");
        require(attendance[lessonCounter][msg.sender] == false, "You already checked in");
        require(keccak256(abi.encodePacked(tryPassword)) == _lastPassword, "Wrong password");
        
        attendanceOf[msg.sender]++;
        lessonAttendance[lessonCounter-1]++;
        attendance[lessonCounter][msg.sender] = true;
        _deservesExtraReward(msg.sender) ? mockToken.mintExtraTo(msg.sender) : mockToken.mintTo(msg.sender);
    }

    function _deservesExtraReward(address student) private view returns(bool) {
        if(lessonCounter < 5) {
            return false;
        }
        for(uint256 i=0; i<5; i++) {
            if(attendance[lessonCounter-i][student] == false) {
                return false;
            }
        }
        return true;
    }

    function getStreakOf(address student) external view returns(uint256) {
        require(student != address(0), "Invalid address");
        require(students[student] == true, "They are not a student");
        require(lessonCounter > 0, "No lessons created yet");
        uint256 streak = 0;
        for(uint256 i=0; i<lessonCounter; i++) {
            if(attendance[lessonCounter-i][student] == false) {
                return streak;
            }
            streak++;
        }
        return streak;
    }

    function getAttendanceOf(address student) external view returns(uint256) {
        require(student != address(0), "Invalid address");
        require(students[student] == true, "They are not a student");
        require(lessonCounter > 0, "No lessons created yet");
        require(attendanceOf[student] > 0, "They have not attended any lessons");
        return attendanceOf[student];
    }

    function getNumberOfLessons() external view returns(uint256) {
        return lessonCounter;
    }

    function getLessonAssistance(uint256 lessonId) external view returns(uint256) {
        require(lessonCounter > lessonId, "No lesson found with that id");
        return lessonAttendance[lessonId];
    }

    receive() external payable {}
}