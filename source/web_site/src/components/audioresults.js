import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from 'reactstrap';
import audio_img from '../img/audio.png';

class AudioResults extends Component {
  constructor(props) {
	    super(props);
      this.state = {
        activeTab: 'transcript',
        captions: false
      }
      this.tabToggle = this.tabToggle.bind(this);
      this.draw = this.draw.bind(this);
      this.audioControl = this.audioControl.bind(this);
    }


  tabToggle(tab) {
    if (this.state.activeTab !== tab) {
        this.setState({
          activeTab: tab
        });
    }
  }

  draw() {

      var self = this;
      var div = document.getElementById("resultview");
      var audio = document.getElementById("resultaudio");
      var audio_image = document.getElementById("resultaudio_img");
      var canvas = document.getElementById("resultcanvas");

      if (canvas == null) {

          //Create canvas
          canvas = document.createElement('canvas');

          //Configure canvas
          canvas.id = "resultcanvas";
          canvas.width=audio_image.width;
          canvas.height=audio_image.height;
          canvas.style.maxWidth="750px";
          canvas.style.maxHeight="400px";
          canvas.style.position = "relative";
          //audio.style.display='none';
          audio_image.style.display='none';


          //Append canvas to div
          div.appendChild(canvas);

          //Draw image
          var context = canvas.getContext('2d');
          //Hide image

          var interval = setInterval(function(){ drawCaptions() },10);
          function drawCaptions() {
              context.drawImage(audio_image,0,0,canvas.width,canvas.height);
              if (self.state.captions) {
                  context.beginPath();
                  context.fillStyle = "black";
                  context.fillRect(0,0,canvas.width,60);
                  context.closePath();
                  if ((Math.ceil((audio.currentTime*1000)/100)*100) in self.props.captions) {
                      context.beginPath();
                      context.font = "15px Comic Sans MS";
                      context.fillStyle = "white";
                      context.fillText(self.props.captions[Math.ceil((audio.currentTime*1000)/100)*100].Captions,10,40)
                      context.closePath();
                  }
              }

              if (audio.ended || audio.paused) {
                  clearInterval(interval);
              }
          }
      }

      else {
          //Canvas already exists

          //Clear canvas
          var context = canvas.getContext('2d');

          var interval = setInterval(function(){ drawCaptions() },10);
          function drawCaptions() {

              context.drawImage(audio_image,0,0,canvas.width,canvas.height);
              if (self.state.captions) {
                  context.beginPath();
                  context.fillStyle = "black";
                  context.fillRect(0,0,canvas.width,60);
                  context.closePath();
                  if ((Math.ceil((audio.currentTime*1000)/100)*100) in self.props.captions) {
                      context.beginPath();
                      context.font = "15px Comic Sans MS";
                      context.fillStyle = "white";
                      context.fillText(self.props.captions[Math.ceil((audio.currentTime*1000)/100)*100].Captions,10,40)
                      context.closePath();
                  }
              }

              if (audio.ended || audio.paused) {
                  clearInterval(interval);
              }
          }
      }
  }

  audioControl(action) {
      var audio = document.getElementById("resultaudio");
      var self = this;
      if (action === "play") {
          if (audio.paused || audio.ended || audio.currentTime === 0){
              audio.play();
              self.draw();
          }
      }
      else if (action === "pause") {
          audio.pause();
      }
      else if (action === "restart") {
          audio.pause();
          setTimeout(function(){
              audio.currentTime = 0;
              audio.play();
              audio.draw();
          }, 20);
      }
  }

  render() {

    //var file_type = this.props.filetype;
    var file_name = this.props.filename;
    var media_source = this.props.mediafile;
    var transcript = this.props.transcript;
    var entities = this.props.entities;
    var phrases = this.props.phrases;

        return (
          <Container>
            <Row>
              <Col>
                <div>
                  <h1 align="center">{file_name}</h1>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md="8">
                <div id="resultview" align="center" className='mb-3' style={{"overflow":"scroll", "maxWidth":"750px", "maxHeight": "400px"}}>
                  <img alt="preview" id="resultaudio_img" src={audio_img} style={{"overflow":"scroll", "maxWidth":"750px", "maxHeight": "400px"}} />
                  <audio id="resultaudio" src={media_source}/>
                </div>
              </Col>
              <Col md="4">
                <div>
                  <h5>Controls:</h5>
                  <hr className="my-2" />
                </div>
                <div align="center">
                  <Button className="mr-2 my-2" color="info" onClick={() => {this.audioControl('play'); }}>Play</Button>
                  <Button className="mr-2 my-2" color="info" onClick={() => {this.audioControl('pause'); }}>Pause</Button>
                  <Button className="mr-2 my-2" color="info" onClick={() => {this.audioControl('restart'); }}>Restart</Button>
                  <Button className="mr-2 my-2" color="info" active={this.state.captions} onClick={() => {this.setState({captions: !this.state.captions}); }}>Captions</Button>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div>
                  <Nav tabs className="mb-3">
                    <NavItem>
                      <NavLink active={this.state.activeTab === "transcript"} onClick={() => { this.tabToggle('transcript'); }}>Transcript</NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink active={this.state.activeTab === "entities"} onClick={() => { this.tabToggle('entities'); }}>Entities</NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink active={this.state.activeTab === "phrases"} onClick={() => { this.tabToggle('phrases'); }}>Phrases</NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="phrases">
                      <Row>
                        <Col align="center">
                          {phrases}
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="entities">
                      <Row>
                        <Col align="center">
                          {entities}
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="transcript">
                      <Row>
                        <Col align="center">
                          {transcript}
                        </Col>
                      </Row>
                    </TabPane>
                  </TabContent>
                </div>
              </Col>
            </Row>
          </Container>
        );
  }
}

export default withAuthenticator(AudioResults);
