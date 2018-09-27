import React, { Component } from 'react';
import { Alert, Container, Row, Col, Form, Button, FormGroup, Input, FormText, Modal, Progress, ModalHeader, ModalBody, } from 'reactstrap';
import Amplify, { Storage } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import preview from '../img/preview.png';
import audio from '../img/audio.png';
import StatusModal from './statusmodal';

const uuidv4 = require('uuid/v4');

class Upload extends Component {
  constructor(props) {
	    super(props);
      this.state = {
        media_file: preview,
        media_type: 'image',
        uploading: false,
        error: false,
        file: '',
        face_file: preview,
        face_type: 'image',
        face: '',
        facename: '',
        modal_status: false,
        format: '',
        object_id: '',
        error_msg: 'Error'
      }
      this.Change = this.Change.bind(this);
      this.Upload = this.Upload.bind(this);
      this.ChangeFace = this.ChangeFace.bind(this);
      this.UploadFace = this.UploadFace.bind(this);
      this.Dismiss = this.Dismiss.bind(this);
      this.toggle = this.toggle.bind(this);
    }

    UploadFace(e) {
      e.preventDefault();
      var self = this;
      var form = e.target;
      var facename = e.target.facename.value;

      if (this.state.face !== '') {

        let content_map = {
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg'
        };

        let file_ext = this.state.face.name.split('.').pop();
        let content_type = content_map[file_ext];


        let uuid = uuidv4();
        let filename = ['collection',uuid,facename].join("/");

        Storage.put(filename, this.state.face, {
            level: 'private',
            contentType: content_type
        })
            .then (function(result) {
            	//console.log(result);
              self.setState({
                "face_file": preview,
                face: '',
                facename: ''
              });
              form.reset();
            })
            .catch(function(err) {
              //console.log(err);
              this.setState({
                error: true,
                error_msg: "Failed to upload file to Amazon S3"
              });
              form.reset();
            });
      }
      else {
        this.setState({
          error: true,
          error_msg: "Error"
        });
      }
  }

  ChangeFace(e) {
    e.preventDefault();
    let reader = new FileReader();
    let face = e.target.files[0];
    if (face) {
      reader.onloadend = () => {
        this.setState({
          "face": face,
          "face_file": reader.result
        });
      }
      reader.readAsDataURL(face)
    }
  }

    Upload(e) {
      e.preventDefault();
      var self = this;
      var form = e.target;

      if (this.state.file !== '') {

        self.setState({
          uploading: true
        });

        let content_map = {
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'mp3': 'audio/mp3',
          'wav': 'audio/wav',
          'wave': 'audio/wav',
          'flac': 'audio/flac',
          'mp4': 'video/mp4',
          'mov': 'video/quicktime'
        };

        let file_ext = this.state.file.name.split('.').pop().toLowerCase();
        let content_type = content_map[file_ext];


        let uuid = uuidv4();
        let filename = ['media',uuid,'content',[this.state.file.name.split('.').slice(0,-1).join('.'),file_ext].join('.')].join("/");

        Storage.put(filename, this.state.file, {
            level: 'private',
            contentType: content_type
        })
            .then (function(result) {
            	//console.log(result);

              self.setState({
                "media_file": preview,
                "media_type": "image",
                uploading: false,
                modal_status: true,
                file: '',
                format: file_ext,
                object_id: uuid
              });
              form.reset();
            })
            .catch(function(err) {
              //console.log(err);
              self.setState({
                error: true,
                error_msg: "Failed to upload file to Amazon S3"
              });
              form.reset();
            });
      }
      else {
        this.setState({
          error: true,
          error_msg: "Error"
        });
      }
  }

  Change(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      if (file.size <= 100000000) {
          let file_type = file.type.split('/')[0];
          reader.onloadend = () => {
            this.setState({
              "file": file,
              "media_file": reader.result,
              "media_type": file_type,
              "error": false
            });
          }
          reader.readAsDataURL(file)
      }
      else {
        this.setState({
          "file": '',
          "media_file": preview,
          "media_type": "image",
          'error': true,
          'error_msg': 'File previews are limited to 100MB or less for this demo page. Please upload file direclty to media analysis S3 bucket using the following naming convention: private/<Cognito Identity ID>/media/<UUID v4>/content/filename.ext'
        });
      }
    }
  }

  Dismiss(e) {
    e.preventDefault();
      this.setState({
        error: false,
        "media_file": preview,
        "media_type": "image",
      });
  }

  toggle() {
    this.setState({
      modal_status: false,
      object_id: '',
      format: ''
    });
  }


  render() {
    var media_file = this.state.media_file;
    var media_type = this.state.media_type;
    var face_file = this.state.face_file;

    return (
      <Container>
        <Alert name="error" color="danger" isOpen={this.state.error} toggle={this.Dismiss}>{this.state.error_msg}</Alert>
        <Modal isOpen={this.state.modal_status} toggle={this.toggle}>
          <StatusModal format={this.state.format} objectid={this.state.object_id}/>
        </Modal>
        <Modal isOpen={this.state.uploading}>
          <ModalHeader>Upload Progress</ModalHeader>
          <ModalBody>
            <div>Uploading</div>
            <Progress animated color="warning" value="100" />
          </ModalBody>
        </Modal>
        <Row>
          <Col xs="6">
              <h1 className="display-6" align="center">Analyze new Media</h1>
              <hr className="my-2" />
              <p className="lead" align="center">Upload new image, video, or audio file to be analyzed by the Media Analysis Solution</p>
              <div>
                {media_type === "image" &&
                  <img src={media_file} className="img-fluid border" alt="preview"/>
                }
                {media_type === "video" &&
                  <video src={media_file} controls autoPlay className="img-fluid border"/>
                }
                {media_type === "audio" &&
                  <div>
                    <img src={audio} className="img-fluid border" alt="preview"/>
                    <audio id="audio_preview" src={media_file} controls autoPlay style={{"width":audio.width}}/>
                  </div>
                }
              </div>
              <div className="mt-3 mb-3">
                <Form onSubmit={this.Upload}>
                  <div className="form-inline">
                    <Button type="submit" disabled={this.state.file === ''}>Upload Media</Button>
                      <FormGroup className="mr-sm-2 ml-sm-4">
                        <Input name="mediafilename" type="text" disabled placeholder={this.state.file.name} />
                      </FormGroup>
                  </div>
                  <FormText color="muted">
                    Media will be uploaded with the same name
                  </FormText>
                  <FormGroup className="mt-3">
                      <Input type="file" accept="image/png, image/jpeg, audio/mp3, audio/flac, audio/wav, video/quicktime, video/mp4" name="file" value={this.file} onChange={this.Change} />
                  </FormGroup>
                </Form>
              </div>
          </Col>
          <Col xs="6">
            <h1 className="display-6"  align="center">Add to Collection</h1>
            <hr className="my-2" />
            <p className="lead" align="center">Upload new images of faces to be indexed in your Amazon Rekognition collection</p>
            <div>
              <img src={face_file} className="img-fluid border" alt="preview"/>
            </div>
              <div className="mt-3 mb-3">
                <Form onSubmit={this.UploadFace}>
                  <div className="form-inline">
                    <Button type="submit" disabled={this.state.face === ''}>Upload Face</Button>
                      <FormGroup className="mr-sm-2 ml-sm-4">
          		          <Input name="facename" type="text" value={this.facename} pattern="[a-zA-Z0-9_.-]+" required placeholder="who's this?" />
          		        </FormGroup>
                  </div>
                  <FormText color="muted">
                    Please provide a name for this face ('[a-zA-Z0-9_.-]+')
                  </FormText>
                  <FormGroup className="mt-3">
                      <Input type="file" name="face" accept="image/png, image/jpeg" value={this.face} onChange={this.ChangeFace} />
                  </FormGroup>
                </Form>
              </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withAuthenticator(Upload);
