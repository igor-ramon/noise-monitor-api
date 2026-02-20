import dotenv from 'dotenv';
dotenv.config();

export const config = {
  thresholdDb: Number(process.env.THRESHOLD_DB) || -10,
};
