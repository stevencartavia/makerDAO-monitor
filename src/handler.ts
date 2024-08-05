import axios from 'axios';
const ethers = require('ethers');

const SEQUENCER_ADDRESS = '0x238b4E35dAed6100C6162fAE4510261f88996EC9';
// Your Infura Project ID
const PROVIDER_URL = '';
// Your Discord Webhook URL
const DISCORD_WEBHOOK_URL = '';

const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

const sequencerAbi = [
  // ABI fragments of the required functions
  "function numNetworks() view returns (uint256)",
  "function networkAt(uint256 _index) view returns (bytes32)",
  "function windows(bytes32 _network) view returns (uint256 start, uint256 length)",
  "function numJobs() view returns (uint256)",
  "function jobAt(uint256 _index) view returns (address)",
  "function getNextJobs(uint256 fromIndex, uint256 toIndex, bytes32 network) view returns (address[] jobs, bool[] workable, bytes[] args)"
];
  
const sequencerContract = new ethers.Contract(SEQUENCER_ADDRESS, sequencerAbi, provider);

interface Job {
  id: number;
  lastWorkedBlock: number;
}

export const getJobDetails = async (jobId: number): Promise<Job> => {
  const job = await sequencerContract.jobAt(jobId);
  return {
    id: jobId,
    lastWorkedBlock: job.lastWorkedBlock
  };
};

export const checkJobs = async () => {
  const numJobs = await sequencerContract.numJobs();
  const jobs: Job[] = [];

  for (let i = 0; i < numJobs; i++) {
    const job = await getJobDetails(i);
    jobs.push(job);
  }

  return jobs;
};

const sendDiscordAlert = async (message: string) => {
  await axios.post(DISCORD_WEBHOOK_URL, { content: message });
};

export const monitorJobs = async () => {
  try {
    const jobs = await checkJobs();
    const latestBlock = await provider.getBlockNumber();
    const jobsNotWorked = jobs.filter(job => (latestBlock - job.lastWorkedBlock) > 10);

    if (jobsNotWorked.length > 0) {
      const message = `Alert: ${jobsNotWorked.length} jobs haven't been worked for the past 10 blocks.`;
      await sendDiscordAlert(message);
    }
  } catch (error) {
    console.error(`Error ${error}`);
    await sendDiscordAlert(`Error ${error}`);
  }
};
