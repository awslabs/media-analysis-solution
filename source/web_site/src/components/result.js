import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { Button, Modal, ModalHeader, ModalBody, Progress, UncontrolledTooltip, Alert } from 'reactstrap';
import { Storage, API } from 'aws-amplify';
import preview from '../img/preview.png';
import ImageResults from './imageresults';
import AudioResults from './audioresults';
import VideoResults from './videoresults';
const uuidv4 = require('uuid/v4');


class Result extends Component {
  constructor(props) {
	    super(props);
      this.state = {
        filename: '', //needed
        media_file: preview, //needed
        label_list: [], //needed
        face_list: [], //needed
        face_match_list: [],
        celeb_list: [],
        entity_list: [],
        phrase_list: [],
        transcript: '',
        persons: [],
        file_type: 'jpg', //needed
        celeb_boxes: [],
        face_match_boxes: [],
        face_boxes: [],
        att_list: [], //needed
        celeb_faces: [], //needed
        known_faces: [], //needed
        downloading: false,
        celeb_video: {},
        att_video: {},
        video_face_list: [],
        video_indv_celebs: [],
        video_indv_known_faces: [],
        known_face_video: {},
        captions: {},
        error_status: false

      }
      this.getCelebs = this.getCelebs.bind(this);
      this.getLabels = this.getLabels.bind(this);
      this.getFaces = this.getFaces.bind(this);
      this.getFaceMatches = this.getFaceMatches.bind(this);
      this.getPersons = this.getPersons.bind(this);
      this.getTranscript = this.getTranscript.bind(this);
      this.getEntities = this.getEntities.bind(this);
      this.getPhrases = this.getPhrases.bind(this);
      this.getCaptions = this.getCaptions.bind(this);

    }

  componentDidMount() {
    var self = this;

    var path = ['/details',this.props.match.params.objectid].join('/');
    var requestParams = {};
    self.setState({
        downloading: true
    });
    API.get('MediaAnalysisApi', path, requestParams)
      .then(function(response) {

        var filepath = ['media',response.object_id,'content',response.details.filename].join('/');
        Storage.get(filepath,{level: 'private'})
        .then(function(file) {
          self.setState({
            downloading: false,
            media_file: file,
            error_status: false
          })
        })
        .catch(function(err) {
          //console.log(err);
        });

        self.setState({
            filename: response.details.filename,
            file_type: response.details.file_type
        });

        if (response.details.file_type === 'png' || response.details.file_type === 'jpg' || response.details.file_type === 'jpeg') {
            self.getCelebs();
            self.getLabels();
            self.getFaces();
            self.getFaceMatches();
        }
        //BUGFIX/media-analysis-35 mp4 and mov results are the same, removing if (mov) {}
        else if ( response.details.file_type === 'mp4' || response.details.file_type === 'mov' ) {
            self.getCelebs();
            self.getLabels();
            self.getFaces();
            self.getFaceMatches();
            self.getPersons();
            self.getTranscript();
            self.getEntities();
            self.getPhrases();
            self.getCaptions();
        }
        else if ( response.details.file_type === 'mp3' || response.details.file_type === 'wav' || response.details.file_type === 'flac' || response.details.file_type === 'wave') {
            self.getTranscript();
            self.getEntities();
            self.getPhrases();
            self.getCaptions();
        }

      })
      .catch(function(error) {
        //console.log(error);
        self.setState({
            downloading: false,
            error_status: true
        });
      });
  }

  getFaces() {
    var self = this;
    var faces_path = ['/lookup',this.props.match.params.objectid,'faces'].join('/');
    var face_list = [];
    var face_boxes = [];
    var att_video = {};
    var att_list = [];
    var face_video = {};

    let _getFaces = function(path, faces, atts) {
        API.get('MediaAnalysisApi', path, {})
          .then(function(result) {
              for (var f in result.Faces) {
                  faces.push(result.Faces[f]);
              }
              for (var a in result.Attributes) {
                  if (atts.hasOwnProperty(result.Attributes[a].Name) == false) {
                      atts[result.Attributes[a].Name] = {'Name': result.Attributes[a].Name, 'Impressions': []};
                      atts[result.Attributes[a].Name].Impressions = atts[result.Attributes[a].Name].Impressions.concat(result.Attributes[a].Impressions);
                  }
                  else {
                      atts[result.Attributes[a].Name].Impressions = atts[result.Attributes[a].Name].Impressions.concat(result.Attributes[a].Impressions);
                  }
              }
              if (result.hasOwnProperty('Next')) {
                  _getFaces([faces_path,result.Next].join('?page='), faces, atts);
              }
              else {
                let data = {'Faces':faces, 'Attributes':[]};
                for (var i in atts) {
                    data.Attributes.push(atts[i]);
                }
                if (self.state.file_type === 'mp4' || self.state.file_type === 'mov') {
                  for (var a in data.Attributes) {
                      att_video[data.Attributes[a].Name] = {"Name":data.Attributes[a].Name,"Impressions":{}};
                      //att_video[data.Attributes[a].Name]["Impressions"] = {};
                      var att_count = 0;
                      for (var i in data.Attributes[a].Impressions) {

                        if (att_video[data.Attributes[a].Name].Impressions.hasOwnProperty(Math.ceil((data.Attributes[a].Impressions[i].Timestamp)/100)*100)) {
                            att_video[data.Attributes[a].Name].Impressions[Math.ceil((data.Attributes[a].Impressions[i].Timestamp)/100)*100][att_count] = {"BoundingBox":data.Attributes[a].Impressions[i].BoundingBox, "Confidence":data.Attributes[a].Impressions[i].Confidence};
                        }
                        else {
                            att_video[data.Attributes[a].Name].Impressions[Math.ceil((data.Attributes[a].Impressions[i].Timestamp)/100)*100] = {};
                            att_video[data.Attributes[a].Name].Impressions[Math.ceil((data.Attributes[a].Impressions[i].Timestamp)/100)*100][att_count] = {"BoundingBox":data.Attributes[a].Impressions[i].BoundingBox, "Confidence":data.Attributes[a].Impressions[i].Confidence};
                        }
                        att_count += 1;
                      }
                  }
                  for (var i in att_video) {
                      att_list.push(att_video[i]);
                  }
                  var face_count = 0;
                  for (var f in data.Faces) {
                      if (face_video.hasOwnProperty(Math.ceil((data.Faces[f].Timestamp)/100)*100)) {
                          face_video[Math.ceil((data.Faces[f].Timestamp)/100)*100][face_count] = {"BoundingBox":data.Faces[f].BoundingBox};
                      }
                      else {
                          face_video[Math.ceil((data.Faces[f].Timestamp)/100)*100] = {};
                          face_video[Math.ceil((data.Faces[f].Timestamp)/100)*100][face_count] = {"BoundingBox":data.Faces[f].BoundingBox};
                      }
                      face_count += 1;
                  }

                  self.setState({
                      "att_list": att_list,
                      "face_video": face_video
                  });
                }
                else {
                  for (var a in data.Attributes) {
                      face_list.push(data.Attributes[a].Name);
                  }
                  for (var f in data.Faces) {
                      face_boxes.push({"BoundingBox":data.Faces[f].BoundingBox});
                  }
                  self.setState({
                      "face_boxes": face_boxes,
                      "att_list": data.Attributes,
                      "face_list": data.Faces
                  });
                }
              }
          })
          .catch(function(err) {
              //console.log(err);
          });
    }
    _getFaces(faces_path, [], {});
  }

  getPersons() {
    var self = this;
    var persons_path = ['/lookup',this.props.match.params.objectid,'persons'].join('/');
    var person_focusing = {};

    let _getPersons = function(path, persons) {
        API.get('MediaAnalysisApi', path, {})
          .then(function(result) {
              persons = persons.concat(result.Persons.Persons);
              if (result.hasOwnProperty('Next')) {
                  _getPersons([persons_path,result.Next].join('?page='), persons);
              }
              else {
                  let data = {'Persons': {'Persons': persons}};
                  for (var p in data.Persons.Persons) {
                    if ('BoundingBox' in data.Persons.Persons[p].Person) {
                        if ((Math.ceil((data.Persons.Persons[p].Timestamp)/100)*100) in person_focusing) {
                          if ((data.Persons.Persons[p].Person.Index in person_focusing[Math.ceil((data.Persons.Persons[p].Timestamp)/100)*100]) === false) {
                              person_focusing[Math.ceil((data.Persons.Persons[p].Timestamp)/100)*100][data.Persons.Persons[p].Person.Index] = {"Index":data.Persons.Persons[p].Person.Index, "BoundingBox":data.Persons.Persons[p].Person.BoundingBox};
                          }
                        }
                        else {
                            person_focusing[Math.ceil((data.Persons.Persons[p].Timestamp)/100)*100] = {};
                            person_focusing[Math.ceil((data.Persons.Persons[p].Timestamp)/100)*100][data.Persons.Persons[p].Person.Index] = {"Index":data.Persons.Persons[p].Person.Index, "BoundingBox":data.Persons.Persons[p].Person.BoundingBox};
                        }
                    }
                  }
                  self.setState({
                      "persons": person_focusing
                  });
              }
          })
          .catch(function(err) {
              //console.log(err);
          });
    }
    _getPersons(persons_path, []);
  }

  getFaceMatches() {
    var self = this;
    var face_match_path = ['/lookup',this.props.match.params.objectid,'face_matches'].join('/');
    var face_match_list = [];
    var face_match_boxes = [];
    var video_face_matches = {};
    var video_known_faces = {};
    var video_known_face_list = [];

    let _getFaceMatches = function(path, face_matches) {
        API.get('MediaAnalysisApi', path, {})
          .then(function(result) {
              for (var f in result.FaceMatches) {
                  if (face_matches.hasOwnProperty(result.FaceMatches[f].ExternalImageId) == false) {
                      face_matches[result.FaceMatches[f].ExternalImageId] = {'ExternalImageId': result.FaceMatches[f].ExternalImageId, 'Impressions': []};
                      face_matches[result.FaceMatches[f].ExternalImageId].Impressions = face_matches[result.FaceMatches[f].ExternalImageId].Impressions.concat(result.FaceMatches[f].Impressions);
                  }
                  else {
                      face_matches[result.FaceMatches[f].ExternalImageId].Impressions = face_matches[result.FaceMatches[f].ExternalImageId].Impressions.concat(result.FaceMatches[f].Impressions);
                  }
              }
              if (result.hasOwnProperty('Next')) {
                  _getFaceMatches([face_match_path,result.Next].join('?page='), face_matches);
              }
              else {
                  let data = {'FaceMatches':[]};
                  for (var i in face_matches) {
                      data.FaceMatches.push(face_matches[i]);
                  }
                  if (self.state.file_type === 'mp4' || self.state.file_type === 'mov') {
                      for (var m in data.FaceMatches) {
                          video_face_matches[data.FaceMatches[m].ExternalImageId] = {"Name":data.FaceMatches[m].ExternalImageId, "Impressions":{}};
                          //video_celeb_faces[data.Celebs[c].Id] = {"Name":data.Celebs[c].Name, "Impressions":{}};
                          for (var i in data.FaceMatches[m].Impressions) {
                              if (data.FaceMatches[m].Impressions[i].Face.hasOwnProperty("BoundingBox")){
                                  if (video_face_matches[data.FaceMatches[m].ExternalImageId].Impressions.hasOwnProperty(Math.ceil((data.FaceMatches[m].Impressions[i].Timestamp)/100)*100)){
                                      video_face_matches[data.FaceMatches[m].ExternalImageId].Impressions[Math.ceil((data.FaceMatches[m].Impressions[i].Timestamp)/100)*100][data.FaceMatches[m].ExternalImageId] = {"Name":data.FaceMatches[m].ExternalImageId, "BoundingBox":data.FaceMatches[m].Impressions[i].Face.BoundingBox};
                                  }
                                  else {
                                      video_face_matches[data.FaceMatches[m].ExternalImageId].Impressions[Math.ceil((data.FaceMatches[m].Impressions[i].Timestamp)/100)*100] = {};
                                      video_face_matches[data.FaceMatches[m].ExternalImageId].Impressions[Math.ceil((data.FaceMatches[m].Impressions[i].Timestamp)/100)*100][data.FaceMatches[m].ExternalImageId] = {"Name":data.FaceMatches[m].ExternalImageId, "BoundingBox":data.FaceMatches[m].Impressions[i].Face.BoundingBox};
                                  }
                                  if ((Math.ceil((data.FaceMatches[m].Impressions[i].Timestamp)/100)*100) in video_known_faces) {
                                      if ((data.FaceMatches[m].ExternalImageId in video_known_faces[Math.ceil((data.FaceMatches[m].Impressions[i].Timestamp)/100)*100]) === false) {
                                          video_known_faces[Math.ceil((data.FaceMatches[m].Impressions[i].Timestamp)/100)*100][data.FaceMatches[m].ExternalImageId] = {"Name":data.FaceMatches[m].ExternalImageId, "BoundingBox":data.FaceMatches[m].Impressions[i].Face.BoundingBox};
                                      }
                                  }
                                  else {
                                      video_known_faces[Math.ceil((data.FaceMatches[m].Impressions[i].Timestamp)/100)*100] = {};
                                      video_known_faces[Math.ceil((data.FaceMatches[m].Impressions[i].Timestamp)/100)*100][data.FaceMatches[m].ExternalImageId] = {"Name":data.FaceMatches[m].ExternalImageId, "BoundingBox":data.FaceMatches[m].Impressions[i].Face.BoundingBox};
                                  }
                              }
                          }
                      }
                      for (var i in video_face_matches){
                          video_known_face_list.push(video_face_matches[i]);
                      }
                  }
                  else {
                    for (var f in data.FaceMatches) {
                        face_match_list.push(data.FaceMatches[f].ExternalImageId);
                        for (var i in data.FaceMatches[f].Impressions) {
                            face_match_boxes.push({"ExternalImageId":data.FaceMatches[f].ExternalImageId,"FaceId":data.FaceMatches[f].Impressions[i].Face.FaceId,"BoundingBox":data.FaceMatches[f].Impressions[i].Face.BoundingBox})
                        }
                    }
                  }
                  self.setState({
                      "face_match_list": face_match_list,
                      "face_match_boxes": face_match_boxes,
                      "known_faces": data.FaceMatches,
                      "known_face_video": video_known_faces,
                      "video_indv_known_faces": video_known_face_list
                  });
              }
        })
          .catch(function(err) {
              //console.log(err);
          });
    }
    _getFaceMatches(face_match_path, {});
  }

  getLabels() {
    var self = this;
    var labels_path = ['/lookup',this.props.match.params.objectid,'labels'].join('/');
    var label_list = [];

    let _getLabels = function(path, labels) {
        API.get('MediaAnalysisApi', path, {})
          .then(function(result) {
              for (var l in result.Labels) {
                    if (labels.hasOwnProperty(result.Labels[l].Name) == false) {
                        labels[result.Labels[l].Name] = {'Name': result.Labels[l].Name, 'Impressions': []};
                        labels[result.Labels[l].Name].Impressions = labels[result.Labels[l].Name].Impressions.concat(result.Labels[l].Impressions);
                    }
                    else {
                        labels[result.Labels[l].Name].Impressions = labels[result.Labels[l].Name].Impressions.concat(result.Labels[l].Impressions);
                    }
                }
                if (result.hasOwnProperty('Next')) {
                    _getLabels([labels_path,result.Next].join('?page='), labels);
                }
                else {
                    let data = {'Labels': []};
                    for (var i in labels) {
                        data.Labels.push(labels[i]);
                    }
                    for (var l in data.Labels) {
                        let confidence = 0;
                        for (var i in data.Labels[l].Impressions) {
                            if (data.Labels[l].Impressions[i].Confidence >= confidence) {
                                confidence = data.Labels[l].Impressions[i].Confidence.toFixed(3);
                            }
                        }
                        label_list.push({"Name":data.Labels[l].Name,"Confidence":confidence,"Id":[data.Labels[l].Name.replace(/[^\w\s]|_/g, " ").replace(/\s+/g, " "),uuidv4()].join('-')});
                    }
                    self.setState({
                        "label_list": label_list
                    });
                }
          })
          .catch(function(err) {
              //console.log(err);
          });
    }
    _getLabels(labels_path, {});
  }

  getCaptions() {
    var self = this;
    var video_captions = {};
    var captions_path = ['/lookup',this.props.match.params.objectid,'captions'].join('/');
    API.get('MediaAnalysisApi', captions_path, {})
      .then(function(data) {
          var ts = 0;
          for (var c in data.Captions) {
              if (data.Captions[c].hasOwnProperty("Content")) {
                for (ts = (Math.floor((data.Captions[c].Timestamp)/100)*100) - 200; ts <= (Math.floor((data.Captions[c].Timestamp)/100)*100) + 2000; ts += 100) {
                    if (video_captions.hasOwnProperty(ts)) {
                        video_captions[ts].Captions += (" "+data.Captions[c].Content);
                    }
                    else {
                        video_captions[ts] = {"Captions":data.Captions[c].Content};
                    }
                }
              }
          }
          self.setState({
              "captions": video_captions
          });
      })
      .catch(function(err) {
          //console.log(err);
      });
  }

  getCelebs() {
    var self = this;
    var celebs_path = ['/lookup',this.props.match.params.objectid,'celebs'].join('/');
    var celeb_list = [];
    var celeb_boxes = [];
    var celeb_video = {};
    var celeb_face_list = [];
    var video_celeb_faces = {};

    let _getCelebs = function(path, celebs) {
        API.get('MediaAnalysisApi', path, {})
          .then(function(result) {
              for (var c in result.Celebs) {
                  if (celebs.hasOwnProperty(result.Celebs[c].Id) == false) {
                      celebs[result.Celebs[c].Id] = {'Id': result.Celebs[c].Id, 'Name': result.Celebs[c].Name, 'Impressions': []};
                      celebs[result.Celebs[c].Id].Impressions = celebs[result.Celebs[c].Id].Impressions.concat(result.Celebs[c].Impressions);
                  }
                  else {
                      celebs[result.Celebs[c].Id].Impressions = celebs[result.Celebs[c].Id].Impressions.concat(result.Celebs[c].Impressions);
                  }
              }
              if (result.hasOwnProperty('Next')) {
                  _getCelebs([celebs_path,result.Next].join('?page='), celebs);
              }
              else {
                  let data = {'Celebs':[]};
                  for (var l in celebs) {
                      data.Celebs.push(celebs[l]);
                  }
                  if (self.state.file_type === 'mp4' || self.state.file_type === 'mov') {
                      for (var c in data.Celebs) {
                          video_celeb_faces[data.Celebs[c].Id] = {"Name":data.Celebs[c].Name, "Impressions":{}};
                          for (var i in data.Celebs[c].Impressions) {
                              if (data.Celebs[c].Impressions[i].hasOwnProperty("BoundingBox")){
                                  if (video_celeb_faces[data.Celebs[c].Id].Impressions.hasOwnProperty(Math.ceil((data.Celebs[c].Impressions[i].Timestamp)/100)*100)){
                                      video_celeb_faces[data.Celebs[c].Id].Impressions[Math.ceil((data.Celebs[c].Impressions[i].Timestamp)/100)*100][data.Celebs[c].Id] = {"Name":data.Celebs[c].Name, "BoundingBox":data.Celebs[c].Impressions[i].BoundingBox};
                                  }
                                  else {
                                      video_celeb_faces[data.Celebs[c].Id].Impressions[Math.ceil((data.Celebs[c].Impressions[i].Timestamp)/100)*100] = {};
                                      video_celeb_faces[data.Celebs[c].Id].Impressions[Math.ceil((data.Celebs[c].Impressions[i].Timestamp)/100)*100][data.Celebs[c].Id] = {"Name":data.Celebs[c].Name, "BoundingBox":data.Celebs[c].Impressions[i].BoundingBox};
                                  }
                                  if ((Math.ceil((data.Celebs[c].Impressions[i].Timestamp)/100)*100) in celeb_video) {
                                      if ((data.Celebs[c].Name in celeb_video[Math.ceil((data.Celebs[c].Impressions[i].Timestamp)/100)*100]) === false) {
                                          celeb_video[Math.ceil((data.Celebs[c].Impressions[i].Timestamp)/100)*100][data.Celebs[c].Name] = {"Name":data.Celebs[c].Name, "BoundingBox":data.Celebs[c].Impressions[i].BoundingBox};
                                      }
                                  }
                                  else {
                                      celeb_video[Math.ceil((data.Celebs[c].Impressions[i].Timestamp)/100)*100] = {};
                                      celeb_video[Math.ceil((data.Celebs[c].Impressions[i].Timestamp)/100)*100][data.Celebs[c].Name] = {"Name":data.Celebs[c].Name, "BoundingBox":data.Celebs[c].Impressions[i].BoundingBox};
                                  }
                              }
                          }
                      }
                      for (var i in video_celeb_faces){
                          celeb_face_list.push(video_celeb_faces[i]);
                      }
                  }
                  self.setState({
                      "celeb_list": celeb_list,
                      "celeb_boxes": celeb_boxes,
                      "celeb_faces": data.Celebs,
                      "celeb_video": celeb_video,
                      "video_indv_celebs": celeb_face_list
                  });
              }
          })
          .catch(function(err) {
              //console.log(err);
          });
    }
    _getCelebs(celebs_path, {});
  }

  getTranscript() {
    var self = this;
    var transcript_path = ['/lookup',this.props.match.params.objectid,'transcript'].join('/');
    API.get('MediaAnalysisApi', transcript_path, {})
      .then(function(data) {
          self.setState({
              "transcript": data.Transcripts[0].Transcript
          });
      })
      .catch(function(err) {
          //console.log(err);
      });
  }

  getEntities() {
    var self = this;
    var entities_path = ['/lookup',this.props.match.params.objectid,'entities'].join('/');
    var entity_list = [];
    API.get('MediaAnalysisApi', entities_path, {})
      .then(function(data) {
          for (var e in data.Entities) {
              entity_list.push({"Name":data.Entities[e].Name, "Confidence":data.Entities[e].Impressions[0].Score*100, "Id":[data.Entities[e].Name.replace(/[^\w\s]|_/g, " ").replace(/\s+/g, " "),uuidv4()].join('-')});
          }
          self.setState({
              "entity_list": entity_list
          });
      })
      .catch(function(err) {
          //console.log(err);
      });
  }

  getPhrases() {
    var self = this;
    var phrases_path = ['/lookup',this.props.match.params.objectid,'phrases'].join('/');
    var phrase_list = [];
    API.get('MediaAnalysisApi', phrases_path, {})
      .then(function(data) {
          for (var p in data.Phrases) {
              phrase_list.push({"Name":data.Phrases[p].Name, "Confidence":data.Phrases[p].Impressions[0].Score*100, "Id":[data.Phrases[p].Name.replace(/[^\w\s]|_/g, " ").replace(/\s+/g, " "),uuidv4()].join('-')});
          }
          self.setState({
              "phrase_list": phrase_list
          });
      })
      .catch(function(err) {
          //console.log(err);
      });
  }

  render() {

    if (this.state) {
        //var self = this;
        var labels = this.state.label_list.map(label => {
            return(
              <div style={{"display":"inline-block"}}>
                <Button id={label.Id.replace(/\s+/g, '-').toLowerCase()} color="secondary" className="ml-1 mr-1 mb-1 mt-1">{label.Name}</Button>
                <UncontrolledTooltip placement="top" target={label.Id.replace(/\s+/g, '-').toLowerCase()}>
                  {label.Confidence}
                </UncontrolledTooltip>
              </div>
            )
        });

        var phrases = this.state.phrase_list.map(phrase => {
            return(
              <div style={{"display":"inline-block"}}>
                <Button id={phrase.Id.replace(/\s+/g, '-').toLowerCase()} color="secondary" className="ml-1 mr-1 mb-1 mt-1">{phrase.Name}</Button>
                <UncontrolledTooltip placement="top" target={phrase.Id.replace(/\s+/g, '-').toLowerCase()}>
                  {phrase.Confidence.toFixed(3)}
                </UncontrolledTooltip>
              </div>
            )
        });

        var entities = this.state.entity_list.map(entity => {
            return(
              <div style={{"display":"inline-block"}}>
                <Button id={entity.Id.replace(/\s+/g, '-').toLowerCase()} color="secondary" className="ml-1 mr-1 mb-1 mt-1">{entity.Name}</Button>
                <UncontrolledTooltip placement="top" target={entity.Id.replace(/\s+/g, '-').toLowerCase()}>
                  {entity.Confidence.toFixed(3)}
                </UncontrolledTooltip>
              </div>
            )
        });

        //let persons = this.state.persons;
        let transcript = this.state.transcript;

        if (this.state.file_type === 'png' || this.state.file_type === 'jpg' || this.state.file_type === 'jpeg') {
          return (
            <div>
              <Alert name="error" color="danger" isOpen={this.state.error_status} toggle={this.Dismiss}>
                Error
              </Alert>
              <Modal isOpen={this.state.downloading}>
                <ModalHeader>Retrieving Media File</ModalHeader>
                <ModalBody>
                  <div>Downloading</div>
                  <Progress animated color="warning" value="100" />
                </ModalBody>
              </Modal>
              <ImageResults allfaces={this.state.face_list} knownfaces={this.state.known_faces} mediafile={this.state.media_file} filename={this.state.filename} filetype={this.state.file_type} labels={labels} celebfaces={this.state.celeb_faces} attlist={this.state.att_list} />
            </div>

          );
        }
        else if (this.state.file_type === 'wav' || this.state.file_type === 'wave' || this.state.file_type === 'flac' || this.state.file_type === 'mp3') {
          return (
            <div>
              <Alert name="error" color="danger" isOpen={this.state.error_status} toggle={this.Dismiss}>
                Error
              </Alert>
              <Modal isOpen={this.state.downloading}>
                <ModalHeader>Retrieving Media File</ModalHeader>
                <ModalBody>
                  <div>Downloading</div>
                  <Progress animated color="warning" value="100" />
                </ModalBody>
              </Modal>
                <AudioResults mediafile={this.state.media_file} filename={this.state.filename} filetype={this.state.file_type} transcript={transcript} captions={this.state.captions} phrases={phrases} entities={entities}/>
            </div>

          );
        }
        else if (this.state.file_type === 'mp4' || this.state.file_type === 'mov') {
          return (
            <div>
              <Alert name="error" color="danger" isOpen={this.state.error_status} toggle={this.Dismiss}>
                Error
              </Alert>
              <Modal isOpen={this.state.downloading}>
                <ModalHeader>Retrieving Media File</ModalHeader>
                <ModalBody>
                  <div>Downloading</div>
                  <Progress animated color="warning" value="100" />
                </ModalBody>
              </Modal>
              <VideoResults phrases={phrases} entities={entities} captions={this.state.captions} transcript={this.state.transcript} individualcelebs={this.state.video_indv_celebs} allfaces={this.state.face_video} attributes={this.state.att_list} celebvideo={this.state.celeb_video} mediafile={this.state.media_file} filename={this.state.filename} filetype={this.state.file_type} persons={this.state.persons} labels={labels} individualknownfaces={this.state.video_indv_known_faces} allknownfaces={this.state.known_face_video}/>
            </div>
          );
        }
    }
  }
}

export default withAuthenticator(Result);
