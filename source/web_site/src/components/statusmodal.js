import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API } from 'aws-amplify';
import { ModalHeader, ModalBody, ModalFooter, Progress, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
declare var media_analysis_config;

class StatusModal extends Component {
    constructor(props) {
  	    super(props);
        this.state = {
          state_machine_color: "warning",
          state_machine_value: "75",
          labels_color: "warning",
          labels_value: "50",
          faces_color: "warning",
          faces_value: "50",
          face_matches_color: "warning",
          face_matches_value: "50",
          celebs_color: "warning",
          celebs_value: "50",
          persons_color: "warning",
          persons_value: "50",
          transcript_color: "warning",
          transcript_value: "50",
          entities_color: "warning",
          entities_value: "50",
          phrases_color: "warning",
          phrases_value: "50",
          button: true
        }
        this.getStatus = this.getStatus.bind(this);
  	}

    componentDidMount() {
      this.getStatus();
  	}

    componentWillUnmount() {
    clearInterval(this.interval);
    }

    getStatus() {
      var self = this;
      var requestParams = {};
      var path = ['/status',this.props.objectid].join('/');

      var interval = setInterval(function(){ getStateMachineStatus() },5000);
      function getStateMachineStatus() {
          API.get('MediaAnalysisApi', path, requestParams)
            .then(function(response) {
              //console.log(response);

              if ("analysis" in response) {
                  if ("labels" in response.analysis) {
                      if (response.analysis.labels === "COMPLETE") {
                          self.setState({
                            labels_color: "success",
                            labels_value: "100"
                          });
                      }
                  }
                  if ("celebs" in response.analysis) {
                      if (response.analysis.celebs === "COMPLETE") {
                          self.setState({
                            celebs_color: "success",
                            celebs_value: "100"
                          });
                      }
                  }
                  if ("faces" in response.analysis) {
                      if (response.analysis.faces === "COMPLETE") {
                          self.setState({
                            faces_color: "success",
                            faces_value: "100"
                          });
                      }
                  }
                  if ("face_matches" in response.analysis) {
                      if (response.analysis.face_matches === "COMPLETE") {
                          self.setState({
                            face_matches_color: "success",
                            face_matches_value: "100"
                          });
                      }
                  }
                  if ("persons" in response.analysis) {
                      if (response.analysis.persons === "COMPLETE") {
                          self.setState({
                            persons_color: "success",
                            persons_value: "100"
                          });
                      }
                  }
                  if ("transcript" in response.analysis) {
                      if (response.analysis.transcript === "COMPLETE") {
                          self.setState({
                            transcript_color: "success",
                            transcript_value: "100"
                          });
                      }
                  }
                  if ("phrases" in response.analysis) {
                      if (response.analysis.phrases === "COMPLETE") {
                          self.setState({
                            phrases_color: "success",
                            phrases_value: "100"
                          });
                      }
                  }
                  if ("entities" in response.analysis) {
                      if (response.analysis.entities === "COMPLETE") {
                          self.setState({
                            entities_color: "success",
                            entities_value: "100"
                          });
                      }
                  }
              }
              if (response.state_machine_status === "SUCCEEDED") {
                  self.setState({
                    state_machine_color: "success",
                    state_machine_value: "100",
                    button: false
                  });
                  clearInterval(interval);
              }
              if (response.state_machine_status === "FAILED" || response.state_machine_status === "TIMED_OUT" || response.state_machine_status === "ABORTED") {
                  self.setState({
                    state_machine_color: "danger",
                    state_machine_value: "100"
                  });
                  clearInterval(interval);
              }
            })
            .catch(function(error) {
              //console.log(error);
            });
        }

    }

    render() {
      let console_link = [media_analysis_config.SOLUTION_CONSOLE_LINK,this.props.objectid].join(':');
      let result_link = ["/result",this.props.objectid].join('/');

      if (this.props.format === '') {
          return(null);
      }
      else if (this.props.format === "png" || this.props.format === "jpg" || this.props.format === "jpeg") {
          return(
            <div>
              <ModalHeader toggle={this.toggle}>Media Analysis Progress</ModalHeader>
              <ModalBody>
                <div>State Machine Progress</div>
                <Progress animated color={this.state.state_machine_color} value={this.state.state_machine_value} />
                <hr className="my-2" />
                <div>Labels</div>
                <Progress animated color={this.state.labels_color} value={this.state.labels_value} />
                <div>Face Detection</div>
                <Progress animated color={this.state.faces_color} value={this.state.faces_value} />
                <div>Face Matching</div>
                <Progress animated color={this.state.face_matches_color} value={this.state.face_matches_value} />
                <div>Celebrities</div>
                <Progress animated color={this.state.celebs_color} value={this.state.celebs_value} />
              </ModalBody>
              <ModalFooter>
                <a href={console_link}>View progress in your AWS Console</a>
                <div>
                  <Link to={result_link}>
                    <Button color="primary" disabled={this.state.button}>View Results</Button>
                  </Link>
                </div>
              </ModalFooter>
            </div>
          );
      }
      else if (this.props.format === "mp3" || this.props.format === "wav" || this.props.format === "wave" || this.props.format === "flac") {
          return(
            <div>
              <ModalHeader toggle={this.toggle}>Media Analysis Progress</ModalHeader>
              <ModalBody>
                <div>State Machine Progress</div>
                <Progress animated color={this.state.state_machine_color} value={this.state.state_machine_value} />
                <hr className="my-2" />
                <div>Transcript</div>
                <Progress animated color={this.state.transcript_color} value={this.state.transcript_value} />
                <div>Key Entities</div>
                <Progress animated color={this.state.entities_color} value={this.state.entities_value} />
                <div>Key Phrases</div>
                <Progress animated color={this.state.phrases_color} value={this.state.phrases_value} />
              </ModalBody>
              <ModalFooter>
                <a href={console_link}>View progress in your AWS Console</a>
                <div>
                  <Link to={result_link}>
                    <Button color="primary" disabled={this.state.button}>View Results</Button>
                  </Link>
                </div>
              </ModalFooter>
            </div>
          );
      }
      //BUGFIX/media-analysis-35 mov and mp4 resoults are the same removing if (mp4) {}
      else if (this.props.format === "mp4" || this.props.format === "mov" ) {
          return(
            <div>
              <ModalHeader toggle={this.toggle}>Media Analysis Progress</ModalHeader>
              <ModalBody>
                <div>State Machine Progress</div>
                <Progress animated color={this.state.state_machine_color} value={this.state.state_machine_value} />
                <hr className="my-2" />
                <div>Labels</div>
                <Progress animated color={this.state.labels_color} value={this.state.labels_value} />
                <div>Face Detection</div>
                <Progress animated color={this.state.faces_color} value={this.state.faces_value} />
                <div>Face Matching</div>
                <Progress animated color={this.state.face_matches_color} value={this.state.face_matches_value} />
                <div>Person Tracking</div>
                <Progress animated color={this.state.persons_color} value={this.state.persons_value} />
                <div>Celebrities</div>
                <Progress animated color={this.state.celebs_color} value={this.state.celebs_value} />
                <div>Transcript</div>
                <Progress animated color={this.state.transcript_color} value={this.state.transcript_value} />
                <div>Key Entities</div>
                <Progress animated color={this.state.entities_color} value={this.state.entities_value} />
                <div>Key Phrases</div>
                <Progress animated color={this.state.phrases_color} value={this.state.phrases_value} />
              </ModalBody>
              <ModalFooter>
                <a href={console_link}>View progress in your AWS Console</a>
                <div>
                  <Link to={result_link}>
                    <Button color="primary" disabled={this.state.button}>View Results</Button>
                  </Link>
                </div>
              </ModalFooter>
            </div>
          );
      }

    }
}

export default withAuthenticator(StatusModal);
