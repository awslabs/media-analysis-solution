import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from 'reactstrap';
//import play from '../img/play.png';
//import pause from '../img/pause.png';
//import restart from '../img/restart.png';

class VideoResults extends Component {
  constructor(props) {
	    super(props);
      this.state = {
        activeTab: 'labels',
        tracking: "nothing",
        boxes: [],
        captions: false
      }
      this.tabToggle = this.tabToggle.bind(this);
      this.draw = this.draw.bind(this);
      this.videoControl = this.videoControl.bind(this);
    }


  tabToggle(tab) {
    if (this.state.activeTab !== tab) {
        this.setState({
          activeTab: tab
        });
    }
  }

  videoControl(action) {
      var video = document.getElementById("resultvid");
      var self = this;
      if (action === "play") {
          if (video.paused || video.ended || video.currentTime === 0){
              video.play();
              self.draw();
          }
      }
      else if (action === "pause") {
          video.pause();
      }
      else if (action === "restart") {
          video.pause();
          setTimeout(function(){
              video.currentTime = 0;
              video.play();
              self.draw();
          }, 20);
      }
  }

  draw() {
      var self = this;
      var div = document.getElementById("resultview");
      var video = document.getElementById("resultvid");
      var canvas = document.getElementById("resultcanvas");

      if (canvas == null) {

          //Create canvas
          canvas = document.createElement('canvas');

          //Configure canvas
          canvas.id = "resultcanvas";
          canvas.width=video.videoWidth;
          canvas.height=video.videoHeight;
          canvas.style.maxWidth="750px";
          canvas.style.maxHeight="400px";
          canvas.style.position = "relative";
          video.style.display='none';

          //Append canvas to div
          div.appendChild(canvas);

          //Draw image
          var context = canvas.getContext('2d');
          //Hide image

          var interval = setInterval(function(){ drawBoxes() },10);
          function drawBoxes() {
              context.drawImage(video,0,0,canvas.width,canvas.height);
              if (self.state.captions) {
                  context.beginPath();
                  context.fillStyle = "black";
                  context.fillRect(0,0,canvas.width,60);
                  context.closePath();
                  if ((Math.ceil((video.currentTime*1000)/100)*100) in self.props.captions) {
                      context.beginPath();
                      context.font = "30px Comic Sans MS";
                      context.fillStyle = "white";
                      context.fillText(self.props.captions[Math.ceil((video.currentTime*1000)/100)*100].Captions,10,40)
                      context.closePath();
                  }
              }
              let items = self.state.boxes;
              if ((Math.ceil((video.currentTime*1000)/100)*100) in items) {
                Object.keys(items[Math.ceil((video.currentTime*1000)/100)*100]).forEach(function(key) {
                    let h = canvas.height * items[Math.ceil((video.currentTime*1000)/100)*100][key].BoundingBox.Height;
                    let w = canvas.width * items[Math.ceil((video.currentTime*1000)/100)*100][key].BoundingBox.Width;
                    let l = canvas.width * items[Math.ceil((video.currentTime*1000)/100)*100][key].BoundingBox.Left;
                    let t = canvas.height * items[Math.ceil((video.currentTime*1000)/100)*100][key].BoundingBox.Top;
                    context.beginPath();
                    context.rect(l, t, w, h);
                    context.lineWidth = 3;
                    context.strokeStyle = 'red';
                    context.stroke();
                    if (items[Math.ceil((video.currentTime*1000)/100)*100][key].hasOwnProperty("Name")) {
                        context.font = "15px Comic Sans MS";
                        context.fillStyle = "red";
                        context.fillText(items[Math.ceil((video.currentTime*1000)/100)*100][key].Name, l, t-2);
                    }
                    else if (items[Math.ceil((video.currentTime*1000)/100)*100][key].hasOwnProperty("Index")) {
                        context.font = "15px Comic Sans MS";
                        context.fillStyle = "red";
                        context.fillText(items[Math.ceil((video.currentTime*1000)/100)*100][key].Index, l, t-2);
                    }
                    else if (items[Math.ceil((video.currentTime*1000)/100)*100][key].hasOwnProperty("Confidence")) {
                        context.font = "15px Comic Sans MS";
                        context.fillStyle = "red";
                        context.fillText(items[Math.ceil((video.currentTime*1000)/100)*100][key].Confidence.toFixed(3), l, t-2);
                    }
                    context.closePath();
                });
              }
              if (video.ended || video.paused) {
                  clearInterval(interval);
              }
          }
      }

      else {
          //Canvas already exists

          var context = canvas.getContext('2d');

          var interval = setInterval(function(){ drawBoxes() },10);
          function drawBoxes() {
              context.drawImage(video,0,0,canvas.width,canvas.height);
              if (self.state.captions) {
                  context.beginPath();
                  context.fillStyle = "black";
                  context.fillRect(0,0,canvas.width,60);
                  context.closePath();
                  if ((Math.ceil((video.currentTime*1000)/100)*100) in self.props.captions) {
                      context.beginPath();
                      context.font = "30px Comic Sans MS";
                      context.fillStyle = "white";
                      context.fillText(self.props.captions[Math.ceil((video.currentTime*1000)/100)*100].Captions,10,40)
                      context.closePath();
                  }
              }
              let items = self.state.boxes;
              if ((Math.ceil((video.currentTime*1000)/100)*100) in items) {
                Object.keys(items[Math.ceil((video.currentTime*1000)/100)*100]).forEach(function(key) {
                    let h = canvas.height * items[Math.ceil((video.currentTime*1000)/100)*100][key].BoundingBox.Height;
                    let w = canvas.width * items[Math.ceil((video.currentTime*1000)/100)*100][key].BoundingBox.Width;
                    let l = canvas.width * items[Math.ceil((video.currentTime*1000)/100)*100][key].BoundingBox.Left;
                    let t = canvas.height * items[Math.ceil((video.currentTime*1000)/100)*100][key].BoundingBox.Top;
                    context.beginPath();
                    context.rect(l, t, w, h);
                    context.lineWidth = 3;
                    context.strokeStyle = 'red';
                    context.stroke();
                    if (items[Math.ceil((video.currentTime*1000)/100)*100][key].hasOwnProperty("Name")) {
                        context.font = "15px Comic Sans MS";
                        context.fillStyle = "red";
                        context.fillText(items[Math.ceil((video.currentTime*1000)/100)*100][key].Name, l, t-2);
                    }
                    else if (items[Math.ceil((video.currentTime*1000)/100)*100][key].hasOwnProperty("Index")) {
                        context.font = "15px Comic Sans MS";
                        context.fillStyle = "red";
                        context.fillText(items[Math.ceil((video.currentTime*1000)/100)*100][key].Index, l, t-2);
                    }
                    else if (items[Math.ceil((video.currentTime*1000)/100)*100][key].hasOwnProperty("Confidence")) {
                        context.font = "15px Comic Sans MS";
                        context.fillStyle = "red";
                        context.fillText(items[Math.ceil((video.currentTime*1000)/100)*100][key].Confidence.toFixed(3), l, t-2);
                    }
                    context.closePath();
                });
              }
              if (video.ended || video.paused) {
                  clearInterval(interval);
              }
          }
      }
  }

  render() {

    var file_type = this.props.filetype;

    if (file_type === 'mov') {
      //var self = this;
      var file_name = this.props.filename;
      var media_source = this.props.mediafile;
      var labels = this.props.labels;
      //var faces = this.props.faces;
      //var face_matches = this.props.facematches;
      //var celebs = this.props.celebs;

      var atts = this.props.attributes.map(att => {
          return(<Button color="primary" className="ml-1 mr-1 mb-1 mt-1" onClick={() => {this.setState({tracking:att.Name, boxes: att.Impressions});}}>{att.Name}</Button>)
      });

      var celebs = this.props.individualcelebs.map(celeb => {
          return(<Button color="primary" className="ml-1 mr-1 mb-1 mt-1" onClick={() => {this.setState({tracking:celeb.Name, boxes: celeb.Impressions});}}>{celeb.Name}</Button>)
      });

      var face_matches = this.props.individualknownfaces.map(face => {
          return(<Button color="primary" className="ml-1 mr-1 mb-1 mt-1" onClick={() => {this.setState({tracking:face.Name, boxes: face.Impressions});}}>{face.Name}</Button>)
      });



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
                <video id="resultvid" src={media_source} className="img-fluid"/>
              </div>
            </Col>
            <Col md="4">
              <div>
                <h5>Currently tracking:</h5>
                <h6 align="center">{this.state.tracking}</h6>
                <hr className="mt-2 mb-6" />
              </div>
              <div>
                <h5>Controls:</h5>
                <hr className="my-2" />
              </div>
              <div align="center">
                <Button className="mr-2 my-2" color="info" onClick={() => {this.videoControl('play'); }}>Play</Button>
                <Button className="mr-2 my-2" color="info" onClick={() => {this.videoControl('pause'); }}>Pause</Button>
                <Button className="mr-2 my-2" color="info" onClick={() => {this.videoControl('restart'); }}>Restart</Button>
              </div>
              <div>
                <h5>Click to track:</h5>
                <hr className="my-2" />
              </div>
              <div align="center">
                <Button color="primary" className="mr-2 mt-2" onClick={() => { this.setState({tracking:"Persons", boxes: this.props.persons}); }}>Persons</Button>
                <Button color="primary" className="mr-2 mt-2" onClick={() => { this.setState({tracking:"Faces", boxes: this.props.allfaces}); }}>Faces</Button>
                <Button color="primary" className="mr-2 mt-2" onClick={() => { this.setState({tracking:"Celebrities", boxes: this.props.celebvideo}); }}>Celebrities</Button>
                <Button color="primary" className="mr-2 mt-2" onClick={() => { this.setState({tracking:"Known Faces", boxes: this.props.allknownfaces}); }}>Known Faces</Button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div>
                <Nav tabs className="mb-3">
                  <NavItem>
                    <NavLink active={this.state.activeTab === "labels"} onClick={() => { this.tabToggle('labels'); }}>Labels</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink active={this.state.activeTab === "faces"} onClick={() => { this.tabToggle('faces'); }}>Facial Attributes</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink active={this.state.activeTab === "face_matches"} onClick={() => { this.tabToggle('face_matches'); }}>Known Faces</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink active={this.state.activeTab === "celebs"} onClick={() => { this.tabToggle('celebs'); }}>Celebrities</NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                  <TabPane tabId="labels">
                    <Row>
                      <Col align="center">
                        {labels}
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="faces">
                    <Row>
                      <Col align="center">
                        {atts}
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="face_matches">
                    <Row>
                      <Col align="center">
                        {face_matches}
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="celebs">
                    <Row>
                      <Col align="center">
                        {celebs}
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

    else if (file_type === 'mp4') {
      //var self = this;
      var file_name = this.props.filename;
      var media_source = this.props.mediafile;
      var labels = this.props.labels;
      //var faces = this.props.faces;
      //var face_matches = this.props.facematches;
      //var celebs = this.props.celebs;
      var phrases = this.props.phrases;
      var entities = this.props.entities;
      var transcript = this.props.transcript;



      var atts = this.props.attributes.map(att => {
          return(<Button color="primary" className="ml-1 mr-1 mb-1 mt-1" onClick={() => {this.setState({tracking:att.Name, boxes: att.Impressions});}}>{att.Name}</Button>)
      });

      var celebs = this.props.individualcelebs.map(celeb => {
          return(<Button color="primary" className="ml-1 mr-1 mb-1 mt-1" onClick={() => {this.setState({tracking:celeb.Name, boxes: celeb.Impressions});}}>{celeb.Name}</Button>)
      });

      var face_matches = this.props.individualknownfaces.map(face => {
          return(<Button color="primary" className="ml-1 mr-1 mb-1 mt-1" onClick={() => {this.setState({tracking:face.Name, boxes: face.Impressions});}}>{face.Name}</Button>)
      });

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
                <video id="resultvid" src={media_source} className="img-fluid"/>
              </div>
            </Col>
            <Col md="4">
              <div>
                <h5>Currently tracking:</h5>
                <h6 align="center">{this.state.tracking}</h6>
                <hr className="mt-2 mb-6" />
              </div>
              <div>
                <h5>Controls:</h5>
                <hr className="my-2" />
              </div>
              <div align="center">
                <Button className="mr-2 my-2" color="info" onClick={() => {this.videoControl('play'); }}>Play</Button>
                <Button className="mr-2 my-2" color="info" onClick={() => {this.videoControl('pause'); }}>Pause</Button>
                <Button className="mr-2 my-2" color="info" onClick={() => {this.videoControl('restart'); }}>Restart</Button>
                <Button className="mr-2 my-2" color="info" active={this.state.captions} onClick={() => {this.setState({captions: !this.state.captions}); }}>Captions</Button>
              </div>
              <div>
                <h5>Click to track:</h5>
                <hr className="my-2" />
              </div>
              <div align="center">
                <Button color="primary" className="mr-2 mt-2" onClick={() => { this.setState({tracking:"Persons", boxes: this.props.persons}); }}>Persons</Button>
                <Button color="primary" className="mr-2 mt-2" onClick={() => { this.setState({tracking:"Faces", boxes: this.props.allfaces}); }}>Faces</Button>
                <Button color="primary" className="mr-2 mt-2" onClick={() => { this.setState({tracking:"Celebrities", boxes: this.props.celebvideo}); }}>Celebrities</Button>
                <Button color="primary" className="mr-2 mt-2" onClick={() => { this.setState({tracking:"Known Faces", boxes: this.props.allknownfaces}); }}>Known Faces</Button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div>
                <Nav tabs className="mb-3">
                  <NavItem>
                    <NavLink active={this.state.activeTab === "labels"} onClick={() => { this.tabToggle('labels'); }}>Labels</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink active={this.state.activeTab === "faces"} onClick={() => { this.tabToggle('faces'); }}>Facial Attributes</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink active={this.state.activeTab === "face_matches"} onClick={() => { this.tabToggle('face_matches'); }}>Known Faces</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink active={this.state.activeTab === "celebs"} onClick={() => { this.tabToggle('celebs'); }}>Celebrities</NavLink>
                  </NavItem>
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
                  <TabPane tabId="labels">
                    <Row>
                      <Col align="center">
                        {labels}
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="faces">
                    <Row>
                      <Col align="center">
                        {atts}
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="face_matches">
                    <Row>
                      <Col align="center">
                        {face_matches}
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="celebs">
                    <Row>
                      <Col align="center">
                        {celebs}
                      </Col>
                    </Row>
                  </TabPane>
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
}

export default withAuthenticator(VideoResults);
