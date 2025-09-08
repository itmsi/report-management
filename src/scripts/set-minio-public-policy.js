#!/usr/bin/env node

require('dotenv').config();
const { setBucketPublicPolicy, getBucketPolicy } = require('../config/minio');

const bucketName = process.env.MINIO_BUCKET || 'msi';

async function setPublicPolicy() {
  console.log('Setting MinIO bucket policy to public...');
  console.log(`Bucket: ${bucketName}`);

  try {
    // Check current policy
    console.log('\nChecking current bucket policy...');
    const currentPolicy = await getBucketPolicy(bucketName);

    if (currentPolicy) {
      console.log('Current policy:', currentPolicy);
    } else {
      console.log('No current policy found');
    }

    // Set public policy
    console.log('\nSetting public policy...');
    const success = await setBucketPublicPolicy(bucketName);

    if (success) {
      console.log('✅ Bucket policy set successfully!');
      console.log('Files should now be publicly accessible.');
    } else {
      console.log('❌ Failed to set bucket policy');
    }

    // Check new policy
    console.log('\nChecking new bucket policy...');
    const newPolicy = await getBucketPolicy(bucketName);

    if (newPolicy) {
      console.log('New policy:', newPolicy);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

setPublicPolicy();
