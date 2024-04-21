// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VotingV2
 * @dev Contrat intelligent pour la gestion d'un système de vote.
 */
contract Voting is Ownable {
    // Structures de données

    // Structure pour représenter un électeur
    struct Voter {
        bool isRegistered; // Indique si l'électeur est inscrit
        bool hasVoted; // Indique si l'électeur a voté
        uint votedProposalId; // ID de la proposition pour laquelle l'électeur a voté
    }

    // Structure pour représenter une proposition
    struct Proposal {
        string description; // Description de la proposition
        uint voteCount; // Nombre de votes reçus
    }

    // Enumération pour gérer les différents états d'un vote
    enum WorkflowStatus {
        RegisteringVoters, // Inscription des électeurs
        ProposalsRegistrationStarted, // Début de la session d'enregistrement des propositions
        ProposalsRegistrationEnded, // Fin de la session d'enregistrement des propositions
        VotingSessionStarted, // Début de la session de vote
        VotingSessionEnded, // Fin de la session de vote
        VotesTallied // Votes comptabilisés
    }

    // Variables de contrat
    WorkflowStatus public workflowStatus; // État actuel du workflow
    mapping(address => Voter) public voters; // Mapping pour stocker les électeurs
    Proposal[] public proposals; // Tableau pour stocker les propositions
    uint public winningProposalId; // ID de la proposition gagnante

    // Événements
    event VoterRegistered(address indexed voterAddress); // Événement émis lorsqu'un électeur est inscrit
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus); // Événement émis lorsqu'il y a un changement d'état du workflow
    event ProposalRegistered(uint indexed proposalId); // Événement émis lorsqu'une proposition est enregistrée
    event Voted(address indexed voter, uint indexed proposalId); // Événement émis lorsqu'un électeur vote pour une proposition

    // Modificateur pour restreindre l'exécution aux différents états de workflow
    modifier onlyDuringWorkflowStatus(WorkflowStatus _expectedStatus) {
        require(workflowStatus == _expectedStatus, "La fonction peut seulement etre appelee durant un statut de workflow specifique");
        _;
    }

    // Constructeur
    constructor() Ownable(msg.sender) {
        workflowStatus = WorkflowStatus.RegisteringVoters;
    }

    // ==================================== Getter ====================================

    function getVoter(address _address) public view returns (Voter memory){
        return voters[_address];
    }

    function getStatus() public view returns (WorkflowStatus){
        return workflowStatus;
    }

    function getProposal(uint _id) public view returns (Proposal memory){
        return proposals[_id];
    }
    function getAllProposal() public view returns(Proposal[] memory){
        return proposals;
    }
    // ==================================== Enregistrement ====================================

    /**
     * @dev Fonction pour inscrire un électeur.
     * @param _voterAddress Adresse de l'électeur à inscrire.
     */
    function registerVoter(address _voterAddress) external onlyOwner onlyDuringWorkflowStatus(WorkflowStatus.RegisteringVoters) {
        require(!voters[_voterAddress].isRegistered, "Le votant est deja enregistre");
        voters[_voterAddress].isRegistered = true;
        emit VoterRegistered(_voterAddress);
    }

    // ==================================== Proposition ====================================

    /**
     * @dev Fonction pour démarrer la session d'enregistrement des propositions.
     */
    function startProposalsRegistration() external onlyOwner onlyDuringWorkflowStatus(WorkflowStatus.RegisteringVoters) {
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @dev Fonction pour enregistrer une proposition.
     * @param _description Description de la proposition à enregistrer.
     */
    function registerProposal(string memory _description) external onlyDuringWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length - 1);
    }

    /**
     * @dev Fonction pour clôturer la session d'enregistrement des propositions.
     */
    function endProposalsRegistration() external onlyOwner onlyDuringWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    // ==================================== Vote ====================================

    /**
     * @dev Fonction pour démarrer la session de vote.
     */
    function startVotingSession() external onlyOwner onlyDuringWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded) {
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @dev Fonction pour voter pour une proposition.
     * @param _proposalId ID de la proposition pour laquelle voter.
     */
    function vote(uint _proposalId) external {
        require(voters[msg.sender].isRegistered, "Le votant n'est pas enregistre");
        require(!voters[msg.sender].hasVoted, "Le votant a deja vote");
        require(_proposalId < proposals.length, "ID de proposition invalide");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        
        emit Voted(msg.sender, _proposalId);
    }

    /**
     * @dev Fonction pour clôturer la session de vote.
     */
    function endVotingSession() external onlyOwner onlyDuringWorkflowStatus(WorkflowStatus.VotingSessionStarted) {
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    // ==================================== Résultat ====================================

    /**
     * @dev Fonction pour comptabiliser les votes et déterminer le gagnant.
     */
    function tallyVotes() external onlyOwner onlyDuringWorkflowStatus(WorkflowStatus.VotingSessionEnded) {
        uint maxVotes = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
        workflowStatus = WorkflowStatus.VotesTallied;
    }

    /**
     * @dev Fonction pour obtenir le gagnant.
     * @return La description de la proposition gagnante.
     */
    function getWinner() external view onlyDuringWorkflowStatus(WorkflowStatus.VotesTallied) returns (string memory) {
        require(winningProposalId < proposals.length, "Pas encore de gagnant");
        return proposals[winningProposalId].description;
    }
}