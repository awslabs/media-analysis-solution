import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { Container, Row, Col } from 'reactstrap';
import diagram from '../img/diagram.png';

class Home extends Component {

  render() {
    return (
      <div>
        <Container>
          <Col>
              <h1 className="display-3"  align="center">Media Analysis Solution demo</h1>
              <hr className="my-2" />
              <p className="lead" align="center">This solution leverages Amazon-native serverless services to automatically analyze, extract, index, and search on valuable metadata from your own image, video, and audio files</p>
          </Col>
          <Col>
              <h3 className="display-5">Getting Started</h3>
              <hr />
                <ol>
                  <li className="lead">Upload video, audio, or image file in the 'Upload' tab</li>
                  <li className="lead">Browse for uploaded media files in the 'Browse' tab and click to view results</li>
                  <li className="lead">View and higlight labels, faces, persons, celebrities, known faces, transcripts, phrases, and entities in the result page</li>
                </ol>
          </Col>
          <Col>
              <h3 className="display-5">Architecture</h3>
              <hr />
              <img src={diagram} className="img-fluid" alt="diagram"/>
              <hr />
              <p>The Media Analysis Solution is deployed to your AWS account using AWS CloudFormation. The AWS CloudFormation template deploys an AWS Step Functions state machine that coordinates analysis processes by orchestrating an AWS Lambda function that interfaces with managed artificial intelligence (AI) services such as Amazon Rekogntion, Amazon Transcribe, and Amazon Comprehend. The template also creates an Amazon S3 bucket and an Amazon Elasticsearch cluster to store raw media files as well as metadata extracted by the media analysis processes. Additionally, the solution deploys an Amazon API Gateway REST API and an Amazon Cognito User Pool that you can use to securely interact with media files and metadata. You can use this demo website to immediately start analyzing small video, audio, and image files.</p>
          </Col>
        </Container>
      </div>

    );
  }
}

export default withAuthenticator(Home);
