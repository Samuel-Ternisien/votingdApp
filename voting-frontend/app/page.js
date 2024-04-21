'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { abi, contractAddress } from '@/constants';

import { useAccount } from 'wagmi';
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core';

import { useState, useEffect } from 'react';

const Home = () => {
  const [voterAddress, setVoterAddress] = useState(''); // State for voter address
  const [proposalText, setProposalText] = useState(''); // State for proposal text
  const [workflowStatus, setWorkflowStatus] = useState(''); // State for workflow status
  const [proposals, setProposals] = useState([]); // State to store fetched proposals
  const [voteID, setVoteID] = useState(''); // State for vote ID
  const [getWorkflowStatus, setGetWorkflowStatus] = useState(''); //
  const { address, isConnected } = useAccount();
  const workflowStatusText = (statusCode) => {
    switch (statusCode) {
      case 0:
        return 'Inscription des électeurs';
      case 1:
        return 'Début de la session d\'enregistrement des propositions';
      case 2:
        return 'Fin de la session d\'enregistrement des propositions';
      case 3:
        return 'Début de la session de vote';
      case 4:
        return 'Fin de la session de vote';
      case 5:
        return 'Votes comptabilisés';
      default:
        return 'Unknown Status'; // Handle unexpected values
    }
  };
  

  // Function to register voter
  const registerVoter = async () => {
    try {
      const tx = await prepareWriteContract({
        address: contractAddress,
        abi,
        functionName: 'registerVoter', // Replace with actual function name
        args: [voterAddress],
      });

      await writeContract(tx);
      console.log('Voter added successfully!');
    } catch (error) {
      console.error('Error adding voter:', error);
    }
  };

  // Function to handle workflow change
  const handleWorkflowChange = async () => {
    let functionName;
    
    // Execute the corresponding function based on the selected status
    switch (workflowStatus) {
      case 'ProposalsRegistrationStarted':
        functionName = 'startProposalsRegistration';
        break;
      case 'ProposalsRegistrationEnded':
        functionName = 'endProposalsRegistration';
        break;
      case 'VotingSessionStarted':
        functionName = 'startVotingSession';
        break;
      case 'VotingSessionEnded':
        functionName = 'endVotingSession';
        break;
      case 'VotesTallied':
        functionName = 'endVotingSession';
        break;
      default:
        // No action for other statuses
        break;
    }

    try {
      const tx = await prepareWriteContract({
        address: contractAddress,
        abi,
        functionName: functionName, // Replace with actual function name
      });

      await writeContract(tx);
      console.log('Voter added successfully!');
    } catch (error) {
      console.error('Error adding voter:', error);
    }
  };

  // Function to add a proposal
  const addProposal = async () => {
    try {
      const tx = await prepareWriteContract({
        address: contractAddress,
        abi,
        functionName: 'registerProposal', // Replace with actual function name
        args: [proposalText], // Provide proposal text from user input
      });

      await writeContract(tx);
      console.log('Proposal added successfully!');
      setProposalText(''); // Clear proposal text after submission
    } catch (error) {
      console.error('Error adding proposal:', error);
    }
  };

  const getProposal = async () => {
    try {
      const result = await readContract({
        address: contractAddress,
        abi,
        functionName: 'getAllProposal', // Utilisez le nom de la fonction pour obtenir toutes les propositions
      });
      setProposals(result); // Mettre à jour l'état avec les données récupérées
    } catch (error) {
      console.error('Error fetching proposal:', error);
      setProposals([]); // Réinitialiser les propositions à un tableau vide en cas d'erreur
    }
  };

  const getStatus = async () => {
    try {
      debugger;
      const result = await readContract({
        address: contractAddress,
        abi,
        functionName: 'getStatus', // Utilisez le nom de la fonction pour obtenir le statut de workflow
        args: []
      });
      setGetWorkflowStatus(result); // Mettre à jour l'état avec le statut de workflow
    } catch (error) {
      console.error('Error fetching proposal:', error);
      setGetWorkflowStatus(''); // Réinitialiser le statut de workflow à vide en cas d'erreur
    }
  };

    // Function to handle voting
    const handleVote = async () => {
      try {
        // Perform the voting action here using the `vote` state
        const tx = await prepareWriteContract({
          address: contractAddress,
          abi,
          functionName: 'vote', // Replace with actual function name
          args: [voteID], // Provide the vote from user input
        });
        await writeContract(tx);
        console.log('Voted successfully!');
      } catch (error) {
        console.error('Error voting:', error);
      }
    };
  

  return (
    <>
      <ConnectButton />
      {isConnected ? (
        <div>
          <p>
            <label>Workflow Status:</label>
            <select value={workflowStatus} onChange={(e) => setWorkflowStatus(e.target.value)}>
              <option value="RegisteringVoters">Inscription des électeurs</option>
              <option value="ProposalsRegistrationStarted">Début de la session d'enregistrement des propositions</option>
              <option value="ProposalsRegistrationEnded">Fin de la session d'enregistrement des propositions</option>
              <option value="VotingSessionStarted">Début de la session de vote</option>
              <option value="VotingSessionEnded">Fin de la session de vote</option>
              <option value="VotesTallied">Votes comptabilisés</option>
            </select>
            <button onClick={handleWorkflowChange} disabled={!workflowStatus}>
              Register change
            </button>
            <p></p>
          </p>
          <p>
            <button onClick={getStatus}>Afficher le statut du workflow</button>
            <p>{workflowStatusText(getWorkflowStatus)}</p>
          </p>
          <p>
            <input
              type="text"
              placeholder="Enter Voter Address"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
            />
            <button onClick={registerVoter} disabled={!voterAddress}>
              Register Voter
            </button>
          </p>
          <p>
            <input
              type="text"
              placeholder="Enter Proposal Text"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
            />
            <button onClick={addProposal} disabled={!proposalText}>
              Add Proposal
            </button>
          </p>
          <p>
            <button onClick={getProposal}>Afficher les propositions</button>
            {proposals.length > 0 && (
              <ul>
                {proposals.map((proposal, index) => (
                  <li key={index}>
                    <div>Numéro de propisiton: {index}</div>
                    <div>Description: {proposal.description}</div>
                    <div>Vote Count: {proposal.voteCount}</div>
                  </li>
                ))}
              </ul>
            )}
          </p>
          <p>
            <input
              type="text"
              placeholder="Enter Vote ID"
              value={voteID}
              onChange={(e) => setVoteID(e.target.value)}
            />
            <button onClick={handleVote} disabled={!voteID}>
              Vote
            </button>
          </p>
        </div>
        
      ) : (
        <p>Please connect your Wallet to our DApp.</p>
      )}
    </>
  );
  
};

export default Home;
