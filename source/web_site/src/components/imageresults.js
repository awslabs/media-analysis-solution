import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from 'reactstrap';

class ImageResults extends Component {
  constructor(props) {
	    super(props);
      this.state = {
        activeTab: 'labels'
      }
      this.tabToggle = this.tabToggle.bind(this);
      this.draw = this.draw.bind(this);
    }


  componentDidMount() {
  }

  tabToggle(tab) {
    if (this.state.activeTab !== tab) {
        this.setState({
          activeTab: tab
        });
    }
  }

  draw(items) {
    var div = document.getElementById("resultview");
    var image = document.getElementById("resultimage");
    var canvas = document.getElementById("resultcanvas");

    if (canvas == null) {
        //Canvas does not yet exist

        //Create canvas
        canvas = document.createElement('canvas');

        //Configure canvas
        canvas.id = "resultcanvas";
        canvas.width = image.width;
        canvas.height = image.height;
        //canvas.style.maxWidth="750px";
        //canvas.style.maxHeight="400px";
        canvas.style.position = "relative";

        //Draw image
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        for (var i in items) {
            let h = canvas.height * items[i].Face.BoundingBox.Height;
            let w = canvas.width * items[i].Face.BoundingBox.Width;
            let l = canvas.width * items[i].Face.BoundingBox.Left;
            let t = canvas.height * items[i].Face.BoundingBox.Top;

            context.beginPath();
            context.rect(l, t, w, h);
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.stroke();

            if ("Confidence" in items[i]) {
              context.font = "15px Comic Sans MS";
              context.fillStyle = "red";
              context.fillText(items[i].Confidence.toFixed(3), l, t-2);
            }
        }

        //Hide image
        image.style.display='none';

        //Append canvas to div
        div.appendChild(canvas);


    }
    else {
        //Canvas already exists

        //Clear canvas
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        //Draw image
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        //Draw rectangle

        for (var i in items) {
            let h = canvas.height * items[i].Face.BoundingBox.Height;
            let w = canvas.width * items[i].Face.BoundingBox.Width;
            let l = canvas.width * items[i].Face.BoundingBox.Left;
            let t = canvas.height * items[i].Face.BoundingBox.Top;

            context.beginPath();
            context.rect(l, t, w, h);
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.stroke();
            if ("Confidence" in items[i]) {
              context.font = "15px Comic Sans MS";
              context.fillStyle = "red";
              context.fillText(items[i].Confidence.toFixed(3), l, t-2);
            }
        }
    }
  }

  render() {

    //var file_type = this.props.filetype;
    var file_name = this.props.filename;
    var media_source = this.props.mediafile;
    var labels = this.props.labels;


    let atts = this.props.attlist.map(att => {
        return(<Button color="primary" className="ml-1 mr-1 mb-1 mt-1" onClick={() => { this.draw(att.Impressions); }}>{att.Name}</Button>)
    });

    let celeb_faces = this.props.celebfaces.map(celeb => {
        return(<Button color="primary" className="ml-1 mr-1 mb-1 mt-1" onClick={() => { this.draw(celeb.Impressions); }}>{celeb.Name}</Button>)
    });

    let known_faces = this.props.knownfaces.map(face => {
        return(<Button color="primary" className="ml-1 mr-1 mb-1 mt-1" onClick={() => { this.draw(face.Impressions); }}>{face.ExternalImageId}</Button>)
    });

    var all_celebs = [];
    for (var c in this.props.celebfaces) {
      for (var i in this.props.celebfaces[c].Impressions) {
          all_celebs.push(this.props.celebfaces[c].Impressions[i]);
      }
    }

    var all_known_faces = [];
    for (var f in this.props.knownfaces) {
        for (var i in this.props.knownfaces[f].Impressions) {
            all_known_faces.push(this.props.knownfaces[f].Impressions[i]);
        }
    }


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
                    <img alt="preview" id="resultimage" src={media_source} className="img-fluid"/>
                </div>
              </Col>
              <Col md="4">
                <div>
                  <h5>Click to highlight faces:</h5>
                  <hr className="my-2" />
                </div>
                <div align="center">
                  <Button color="primary" className="mr-2 mt-3" active onClick={() => { this.draw(all_known_faces); }}>Show Known Faces</Button>
                  <Button color="primary" className="mr-2 mt-3" active onClick={() => { this.draw(this.props.allfaces); }}>Show All Faces</Button>
                  <Button color="primary" className="mr-2 mt-3" active onClick={() => { this.draw(all_celebs); }}>Show Celebrities</Button>
                </div>
                <div align="center">
                  <Button color="secondary" className="mt-3" onClick={() => { this.draw([]); }}>Clear All</Button>
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
                          {known_faces}
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="celebs">
                      <Row>
                        <Col align="center">
                          {celeb_faces}
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

export default withAuthenticator(ImageResults);
