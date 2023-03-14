//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";

interface IMockToken {
    function totalSupply() external;
    function balanceOf(address user) external;
    function allowance(address owner, address spender) external;
    function approve(address spender, uint256 amount) external; // allow()
    function transfer(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external;
}

struct Lesson {
    uint256 limitTime;
    uint256 attenders;
}

contract Assistance is Ownable {
    IMockToken mockToken;
    Lesson[] public lessons; // Array of last-times-to-ckeckin
    mapping (address => bool) public students; // student => isStudent
    mapping (uint256 => mapping (address => bool)) public attendance; // lessonID => student => did_attend

    constructor(IMockToken disrup3Token) {
        owner = msg.sender;
        mockToken = disrup3Token;
    }

    modifier onlyStudent() {
        require(students[msg.sender] == true, "You are not a student");
        _;
    }

    function addStudent(address newStudent) external onlyAdmin() {
        require(students[newStudent] == false, "They are already a student");
        students[newStudent] = true;
    }

    function removeStudent(address newStudent) external onlyAdmin() {
        require(students[newStudent] == true, "They are already not a student");
        students[newStudent] = false;
    }

    function addLesson() external onlyAdmin {
        if(lessons.length > 0) {
            require(block.timestamp > lessons[lessons.length-1].limitTime, "There is already an active check-in");
        }
        lessons.push(
            Lesson(
                /*limitTime:*/ block.timestamp + 10 * 1 minutes,
                /*attenders:*/ 0
            )
        );
    }

    function attend(string memory password) external onlyStudent {
        require(lessons[lessons.length-1].limitTime >= block.timestamp, "There are no active checkins right now");
        require(attendance[lessons.length][msg.sender] == false, "You already checked in");

        string memory correctPass = "Disrup3"; // Falta que la contraseña se cree como quieren
        require(keccak256(abi.encodePacked((password))) == keccak256(abi.encodePacked((correctPass))), "Wrong password");
        
        lessons[lessons.length-1].attenders++;
        attendance[lessons.length-1][msg.sender] = true;
        mockToken.transfer(msg.sender, _deservesExtraReward(msg.sender) ? 50 : 10);
    }

    function _deservesExtraReward(address student) private view returns(bool) {
        if(lessons.length < 5) {
            return false;
        }
        for(uint256 i=0; i<5; i++) {
            if(attendance[lessons.length-1-i][student] == false) {
                return false;
            }
        }
        return true;
    }

    function getStreak() external view onlyStudent returns(uint256) {
        require(lessons.length > 0, "No lessons created yet");
        uint256 streak = 0;
        for(uint256 i=0; i<lessons.length; i++) {
            if(attendance[lessons.length-1-i][msg.sender] == false) {
                return streak;
            }
            streak++;
        }
        return streak;
    }

    function getStudentAssistance() external view onlyStudent returns(uint256) {
        require(lessons.length > 0, "No lessons created yet");
        uint256 assistance = 0;
        for(uint256 i=0; i<lessons.length; i++) {
            if(attendance[i][msg.sender] == true) {
                assistance++;
            }
        }
        return assistance * 100 / (lessons.length);
    }

    function getLessonAssistance(uint256 lessonId) external view returns(uint256) {
        require(lessons.length > lessonId, "No lesson found with that id");
        return lessons[lessonId].attenders;
    }

    function getNumberOfLessons() external view returns(uint256) {
        return lessons.length;
    }

    receive() external payable {}
}