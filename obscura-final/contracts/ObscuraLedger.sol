// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================================
// OBSCURA Ledger — pencatat keputusan agent di Mantle
// Memenuhi requirement inti hackathon: setiap keputusan AI
// agent direkam permanen on-chain, dapat diverifikasi siapa pun.
// ============================================================

contract ObscuraLedger {
    enum SignalType { SmartMoney, Anomaly, WhaleMove }

    struct Decision {
        uint256 timestamp;
        SignalType signalType;
        uint8 confidence;     // 0-100
        string subject;       // mis. wallet/token yang dinilai
        bool resolved;
        bool wasCorrect;
    }

    address public agent;          // alamat agent (operator)
    Decision[] public decisions;

    // Reputasi sederhana (basis untuk ERC-8004 identity)
    uint256 public totalResolved;
    uint256 public totalCorrect;

    event DecisionLogged(uint256 indexed id, SignalType signalType, uint8 confidence, string subject);
    event DecisionResolved(uint256 indexed id, bool wasCorrect);

    modifier onlyAgent() {
        require(msg.sender == agent, "OBSCURA: bukan agent");
        _;
    }

    constructor() {
        agent = msg.sender;
    }

    // Agent mencatat keputusan baru
    function logDecision(SignalType t, uint8 c, string calldata subject) external onlyAgent returns (uint256) {
        require(c <= 100, "confidence 0-100");
        decisions.push(Decision(block.timestamp, t, c, subject, false, false));
        uint256 id = decisions.length - 1;
        emit DecisionLogged(id, t, c, subject);
        return id;
    }

    // Kemudian, hasil prediksi dikonfirmasi (benar/salah)
    function resolveDecision(uint256 id, bool correct) external onlyAgent {
        Decision storage d = decisions[id];
        require(!d.resolved, "sudah diselesaikan");
        d.resolved = true;
        d.wasCorrect = correct;
        totalResolved += 1;
        if (correct) totalCorrect += 1;
        emit DecisionResolved(id, correct);
    }

    // Skor akurasi (basis poin: 7942 = 79.42%)
    function accuracyBps() external view returns (uint256) {
        if (totalResolved == 0) return 0;
        return (totalCorrect * 10000) / totalResolved;
    }

    function decisionCount() external view returns (uint256) {
        return decisions.length;
    }
}
