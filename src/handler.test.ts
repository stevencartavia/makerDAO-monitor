import { getJobDetails, checkJobs, monitorJobs } from './handler';
import axios from 'axios';
const ethers = require('ethers');

jest.mock('axios');
jest.mock('ethers');

const mockProvider = {
  getBlockNumber: jest.fn()
};

const mockSequencerContract = {
  jobAt: jest.fn(),
  numJobs: jest.fn()
};

ethers.providers.JsonRpcProvider.mockImplementation(() => mockProvider);
ethers.Contract.mockImplementation(() => mockSequencerContract);

describe('getJobDetails', () => {
  it('should return job details for a given job ID', async () => {
    mockSequencerContract.jobAt.mockResolvedValueOnce({ lastWorkedBlock: 100 });

    const jobDetails = await getJobDetails(1);

    expect(jobDetails).toEqual({ id: 1, lastWorkedBlock: 100 });
    expect(mockSequencerContract.jobAt).toHaveBeenCalledWith(1);
  });
});

describe('checkJobs', () => {
  it('should return a list of jobs', async () => {
    mockSequencerContract.numJobs.mockResolvedValueOnce(2);
    mockSequencerContract.jobAt.mockResolvedValueOnce({ lastWorkedBlock: 100 });
    mockSequencerContract.jobAt.mockResolvedValueOnce({ lastWorkedBlock: 105 });

    const jobs = await checkJobs();

    expect(jobs).toEqual([
      { id: 0, lastWorkedBlock: 100 },
      { id: 1, lastWorkedBlock: 105 }
    ]);
    expect(mockSequencerContract.numJobs).toHaveBeenCalled();
    expect(mockSequencerContract.jobAt).toHaveBeenCalledWith(0);
    expect(mockSequencerContract.jobAt).toHaveBeenCalledWith(1);
  });
});

describe('monitorJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send an alert if there are problematic jobs', async () => {
    const jobs = [
      { id: 0, lastWorkedBlock: 90 },
      { id: 1, lastWorkedBlock: 85 }
    ];
    const latestBlock = 100;

    mockSequencerContract.numJobs.mockResolvedValueOnce(2);
    mockSequencerContract.jobAt
      .mockResolvedValueOnce(jobs[0])
      .mockResolvedValueOnce(jobs[1]);
    mockProvider.getBlockNumber.mockResolvedValueOnce(latestBlock);
    // axios.post.mockResolvedValueOnce({});

    await monitorJobs();

    expect(axios.post).toHaveBeenCalledWith(expect.any(String), { content: 'Alert: 2 jobs haven\'t been worked for the past 10 blocks.' });
  });

  it('should not send an alert if there are no problematic jobs', async () => {
    const jobs = [
      { id: 0, lastWorkedBlock: 95 },
      { id: 1, lastWorkedBlock: 96 }
    ];
    const latestBlock = 100;

    mockSequencerContract.numJobs.mockResolvedValueOnce(2);
    mockSequencerContract.jobAt
      .mockResolvedValueOnce(jobs[0])
      .mockResolvedValueOnce(jobs[1]);
    mockProvider.getBlockNumber.mockResolvedValueOnce(latestBlock);

    await monitorJobs();

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should send an alert if an error occurs', async () => {
    const error = new Error('Test error');
    mockSequencerContract.numJobs.mockRejectedValueOnce(error);
    // axios.post.mockResolvedValueOnce({});

    await monitorJobs();

    expect(axios.post).toHaveBeenCalledWith(expect.any(String), { content: 'Error monitoring jobs: Error: Test error' });
  });
});
