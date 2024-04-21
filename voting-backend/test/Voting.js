// Import necessary modules from Hardhat
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Start by describing the test suite
describe("Voting", function () {
    // Declare variables to hold contract instances
    let votingContract;
    let owner;
    let addr1;
    let addr2;




    // Test case for registering voters
    it("Should register voters", async function () {

        [owner, addr1, addr2] = await ethers.getSigners();
        console.log("Deploying contract...");
        const votingContract = await ethers.deployContract("Voting");
        console.log(votingContract);
        await votingContract.connect(owner).registerVoter(addr1.address);
        console.log(votingContract.address);

        expect(votingContract.voters[addr1.address]).to.equal(true);
    });
    // // Test case for registering proposals
    // it("Should register proposals", async function () {
    //     await votingContract.connect(owner).startProposalsRegistration();
    //     await votingContract.connect(owner).registerProposal("Proposal 1");
    //     expect(await votingContract.proposals(0)).to.include({ description: "Proposal 1" });
    // });

    // // Test case for voting
    // it("Should allow registered voters to vote", async function () {
    //     await votingContract.connect(owner).registerVoter(addr1.address);
    //     await votingContract.connect(owner).startProposalsRegistration();
    //     await votingContract.connect(owner).registerProposal("Proposal 1");
    //     await votingContract.connect(owner).endProposalsRegistration();
    //     await votingContract.connect(addr1).vote(0);
    //     expect(await votingContract.voters(addr1.address)).to.include({ hasVoted: true });
    // });

    // // Test case for tallying votes and getting the winner
    // it("Should tally votes and determine the winner", async function () {
    //     await votingContract.connect(owner).registerVoter(addr1.address);
    //     await votingContract.connect(owner).startProposalsRegistration();
    //     await votingContract.connect(owner).registerProposal("Proposal 1");
    //     await votingContract.connect(owner).registerProposal("Proposal 2");
    //     await votingContract.connect(owner).endProposalsRegistration();
    //     await votingContract.connect(addr1).vote(0);
    //     await votingContract.connect(owner).endVotingSession();
    //     await votingContract.connect(owner).tallyVotes();
    //     const winner = await votingContract.getWinner();
    //     expect(winner).to.equal("Proposal 1");
// });
});
