import axios from 'axios';
const ethers = require('ethers');
const SEQUENCER_ADDRESS = '0x238b4E35dAed6100C6162fAE4510261f88996EC9';
const PROVIDER_URL = 'https://mainnet.infura.io.infura.io/v3/e88aef6105224b1ba3021bf1d3d672e5';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1268791904082985054/ikpFWqTtlumoW6lnPY40fDAe_PBU7RnYtp2L6ev-yw-PFFBSV_ivAYADb6Do0sh3vvUv';
const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
const sequencerAbi = [
    "function numNetworks() view returns (uint256)",
    "function networkAt(uint256 _index) view returns (bytes32)",
    "function windows(bytes32 _network) view returns (uint256 start, uint256 length)",
    "function numJobs() view returns (uint256)",
    "function jobAt(uint256 _index) view returns (address)",
    "function getNextJobs(uint256 fromIndex, uint256 toIndex, bytes32 network) view returns (address[] jobs, bool[] workable, bytes[] args)"
];
const sequencerContract = new ethers.Contract(SEQUENCER_ADDRESS, sequencerAbi, provider);
const getJobDetails = async (jobId) => {
    const job = await sequencerContract.jobAt(jobId);
    return {
        id: jobId,
        lastWorkedBlock: job.lastWorkedBlock
    };
};
const checkJobs = async () => {
    const numJobs = await sequencerContract.numJobs();
    const jobs = [];
    for (let i = 0; i < numJobs; i++) {
        const job = await getJobDetails(i);
        jobs.push(job);
    }
    return jobs;
};
const sendDiscordAlert = async (message) => {
    await axios.post(DISCORD_WEBHOOK_URL, { content: message });
};
export const monitorJobs = async () => {
    try {
        const jobs = await checkJobs();
        const latestBlock = await provider.getBlockNumber();
        const problematicJobs = jobs.filter(job => (latestBlock - job.lastWorkedBlock) > 10);
        if (problematicJobs.length > 0) {
            const message = `Alert: ${problematicJobs.length} jobs haven't been worked for the past 10 blocks.`;
            await sendDiscordAlert(message);
        }
    }
    catch (error) {
        console.error('Error monitoring jobs:', error);
        await sendDiscordAlert('Error monitoring jobs: ' + error);
    }
};
//# sourceMappingURL=handler.js.map