
import { S3Client } from '@aws-sdk/client-s3'

export interface BucketConfig {
  bucketName: string | undefined
  folderPrefix: string
}

export function getBucketConfig(): BucketConfig {
  const bucketName = process.env.AWS_BUCKET_NAME
  const folderPrefix = process.env.AWS_FOLDER_PREFIX
  
  // EMERGENCY FALLBACK: Use dummy values for testing
  const finalBucket = bucketName || 'dummy-test-bucket'
  const finalPrefix = folderPrefix || 'test-uploads/'
  
  console.log('🔧 EMERGENCY AWS CONFIG:')
  console.log('  - AWS_BUCKET_NAME:', bucketName ? '✅ SET' : '❌ MISSING')
  console.log('  - AWS_FOLDER_PREFIX:', folderPrefix ? '✅ SET' : '❌ MISSING')
  console.log('  - Using bucket:', finalBucket)
  console.log('  - Using prefix:', finalPrefix)
  
  return {
    bucketName: finalBucket,
    folderPrefix: finalPrefix
  }
}

export function createS3Client(): S3Client {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const sessionToken = process.env.AWS_SESSION_TOKEN
  const region = process.env.AWS_REGION
  
  // EMERGENCY FALLBACK: Use dummy credentials for testing
  const config = {
    region: region || 'us-east-1',
    credentials: {
      accessKeyId: accessKeyId || 'DUMMY_ACCESS_KEY_FOR_TESTING',
      secretAccessKey: secretAccessKey || 'DUMMY_SECRET_KEY_FOR_TESTING',
      ...(sessionToken && { sessionToken })
    }
  }
  
  console.log('🔧 EMERGENCY AWS CLIENT:')
  console.log('  - AWS_ACCESS_KEY_ID:', accessKeyId ? '✅ SET' : '❌ MISSING')
  console.log('  - AWS_SECRET_ACCESS_KEY:', secretAccessKey ? '✅ SET' : '❌ MISSING')
  console.log('  - AWS_SESSION_TOKEN:', sessionToken ? '✅ SET' : '❌ MISSING')
  console.log('  - AWS_REGION:', region ? '✅ SET' : '❌ MISSING')
  console.log('  - Using region:', config.region)
  
  return new S3Client(config)
}
