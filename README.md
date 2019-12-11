# Media Analysis Solution
The increasing maturity and growing availability of machine learning (ML) algorithms and artificial intelligence (AI) services have unlocked new frontiers in analytics across several forms of media. Through the use of AI tools and services, it is possible to detect objects, recognize faces, transcribe and analyze audio, and much more. Advancements in deep learning algorithms and AI tooling have enabled developers and analysts to efficiently extract valuable data from multimedia sources, but can still require a great deal of time and effort to train ML models as well as maintain supporting infrastructure.

AWS offers several managed AI services, such as Amazon Rekognition, Amazon Transcribe, and Amazon Comprehend, that offer immediate insights into image, video, and audio files. By combining these services with Amazon's managed storage and compute services, customers can quickly and easily build intelligent applications that inform and enable many use cases across a variety of fields, including public safety and security, media and entertainment, advertising and social media, etc.

The Media Analysis Solution is a turnkey reference implementation that helps customers start analyzing their media files using serverless, managed AI services. The Media Analysis Solution uses highly available, highly scalable, and highly accurate AWS-native services to automatically extract valuable metadata from audio, image, and video files.

For more information and a detailed deployment guide visit the Media Analysis Solution at https://aws.amazon.com/solutions/media-analysis-solution/.

## Running unit tests for customization
* Clone the repository, then make the desired code changes
* Next, run unit tests to make sure added customization passes the tests
```
cd ./deployment
chmod +x ./run-unit-tests.sh
./run-unit-tests.sh
```
## Building distributable for customization
* Create an Amazon S3 Bucket
```
aws s3 mb s3://my-bucket-us-east-1 --region us-east-1
```

* Navigate to the deployment folder and build the distributable
```bash
chmod +x ./build-s3-dist.sh
./build-s3-dist.sh my-bucket media-analysis-solution my-version
```

> Note: The build-s3-dist script expects the bucket name as one of its parameters, and this value should not include the region suffix.

* Deploy the distributable to an Amazon S3 bucket in your account (you must have the AWS CLI installed)
```bash
aws s3 cp ./regional-s3-assets/ s3://my-bucket-us-east-1/media-analysis-solution/my-version --recursive --acl bucket-owner-full-control
```

* Get the link of the media-analysis-deploy.template uploaded to your Amazon S3 bucket.
* Deploy the Media Analysis Solution to your account by launching a new AWS CloudFormation stack using the link of the media-analysis-deploy.template.

## File Structure
The Media Analysis Solution consists of a demo website, an analysis orchestration layer, a search and storage layer, and an API layer.
* The demo website is a React application that leverages AWS Amplify to interact with Amazon S3, Amazon API Gateway, and Amazon Cognito.
* The analysis orchestration layer is an AWS Step Functions state machine that coordinates metadata extraction from Amazon AI services.
* The search and storage layer uses Amazon Elasticsearch to index extracted metadata and handle search requests.
* The API layer handles requests for details of media files.
* The microservices are deployed to a serverless environment in AWS Lambda.

```
|-deployment/
  |-buildspecs/                             [ solutions builder pipeline build specifications ]
  |-build-s3-dist.sh                        [ shell script for packaging distribution assets ]
  |-run-unit-tests.sh                       [ shell script for executing unit tests ]
  |-media-analysis-deploy.yaml              [ solution CloudFormation deployment template ]
  |-media-analysis-api-stack.yaml           [ solution CloudFormation template for deploying API services ]
  |-media-analysis-storage-stack.yaml       [ solution CloudFormation template for deploying storage services ]
  |-media-analysis-state-machine-stack.yaml [ solution CloudFormation template for deploying state machine ]
|-source/
  |-analysis/                               [ microservices for orchestrating media analysis ]
    |-lib/
      |-collection/                         [ microservice for indexing a new face in a Amazon Rekognition collection ]
      |-comprehend/                         [ microservice for orchestrating natural language comprehension tasks ]
      |-elasticsearch/                      [ microservice for indexing extracted metadata in Amazon Elasticsearch cluster ]
      |-image/                              [ microservice for orchestrating image analysis ]
      |-metricsHelper/                      [ microservice for capturing anonymous metrics pertinent for feedback on the solution ]
      |-steps/                              [ microservice for starting the state machine ]
      |-transcribe/                         [ microservice for orchestrating audio transcription ]
      |-upload/                             [ microservice for uploading metadata to Amazon S3 ]
      |-video/                              [ microservice for orchestrating video analysis ]
    |-index.js
    |-package.json
  |-api/                                    [ microservice for handling requests from Amazon API Gateway ]
    |-lib/
      |-index.js                            [ injection point for microservice ]
      |-details.js                          [ returns details for a requested media file ]
      |-lookup.js                           [ returns metadata for a requested media file ]
      |-search.js                           [ performs a search on Amazon Elasticsearch cluster ]
      |-status.js                           [ returns status of media analysis state machine ]
      |-[service unit tests]
    |-index.js
    |-package.json
  |-helper/                                 [ AWS CloudFormation custom resource for aiding the deployment of the solution ]
    |-lib/
      |-index.js                            [ injection point for microservice ]
      |-esHelper.js                         [ helper for interacting with Amazon Elasticsearch cluster ]
      |-metricsHelper.js                    [ helper for capturing anonymous metrics pertinent for feedback on the solution ]
      |-s3helper.js                         [ helper for interacting with Amazon S3 ]
    |-index.js
    |-package.json
  |-web_site/                               [ ReactJS demo website for the solution ]
    |-public/
    |-src/
      |-components/
      |-img/
      |-styles/
    |-package.json
```

Each microservice in analysis/lib/ follows the structure of:

```
|-service-name/
  |-index.js [injection point for microservice]
  |-[service-specific code]
  |-[service-name].js
```

***

Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
