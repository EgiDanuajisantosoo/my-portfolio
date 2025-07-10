import couchbase from 'couchbase';

const connectionString = process.env.COUCHBASE_CONNECTION_STRING;
const username = process.env.COUCHBASE_USERNAME;
const password = process.env.COUCHBASE_PASSWORD;
const bucketName = process.env.COUCHBASE_BUCKET;

let cluster;
let bucket;
let collection;

async function getCouchbaseCollection() {
  if (!collection) {
    cluster = await couchbase.connect(connectionString, {
      username: username,
      password: password,
      // Opsi tambahan untuk production di Vercel
      configProfile: 'wanDevelopment', 
    });
    bucket = cluster.bucket(bucketName);
    // Gunakan scope dan collection default atau yang sudah Anda buat
    collection = bucket.defaultCollection(); 
    console.log('Connected to Couchbase');
  }
  return { cluster, bucket, collection };
}

export { getCouchbaseCollection };