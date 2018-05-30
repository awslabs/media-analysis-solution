'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Lookup = require('./lookup.js');

describe('Lookup', function() {

    describe('#getDetails', function() {

        let owner_id = "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74";
        let object_id = "33451416-a313-4d30-ae23-82da4cb3c89d";

        let list_multiple_response = {
            Contents: [
                {
                    LastModified: "datetime",
                    StorageClass: "STANDARD",
                    Key: "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/results/labels.json",
                    Size: 77055
                },
                {
                    LastModified: "datetime",
                    StorageClass: "STANDARD",
                    Key: "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/results/labels2.json",
                    Size: 87232
                }
            ]
        };

        let list_single_response = {
            Contents: [
                {
                    LastModified: "datetime",
                    StorageClass: "STANDARD",
                    Key: "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/results/labels.json",
                    Size: 77055
                }
            ]
        };

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('S3');
        });

        //Labels
        it('should return a JSON object of image label impressions', function(done) {

            let labels_image_raw = {
              Labels: [{
                Name: "Human",
                Confidence: 99
              }],
              OrientationCorrection: "ROTATE_0"
            };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(labels_image_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_single_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'labels', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.isUndefined(data.Next);
                    assert.equal(data.Labels.length,1);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','labels.json'].join('/'));
                    assert.equal(data.MediaType,'image');
                    done();
                }
            });
        });

        it('should return a JSON object of video label impressions', function(done) {

            let labels_video_raw = {
              JobStatus: "SUCCEEDED",
              VideoMetadata: {
                DurationMillis: 221212
              },
              Labels: [{
                Timestamp: 12,
                Label: {
                  Name: "Football",
                  Confidence: 80
                }
              }, {
                Timestamp: 800,
                Label: {
                  Name: "Football",
                  Confidence: 90
                }
              }, {
                Timestamp: 12412,
                Label: {
                  Name: "People",
                  Confidence: 90
                }
              }]
            };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(labels_video_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_multiple_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'labels', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.Labels.length,2);
                    assert.equal(data.Next,2);
                    assert.equal(data.Labels[0].Impressions.length,2);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','labels.json'].join('/'));
                    assert.equal(data.MediaType,'video');
                    done();
                }
            });
        });

        it('should return error if getObject fails', function(done) {

            let labels_image_raw = {
              Labels: [{
                Name: "Human",
                Confidence: 99
              }],
              OrientationCorrection: "ROTATE_0"
            };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback('error', null);
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_single_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'labels', owner_id, 1, function(err, data) {
                if (err) {
                    expect(err).to.equal("Item does not exist or user does not have access");
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

        //Celebs
        it('should return a JSON object of image celebrity impressions', function(done) {

            let celebs_image_raw = {
                  CelebrityFaces: [{
                    Urls: [],
                    Name: "Famous Person",
                    Id: "0000aa",
                    Face: {
                      BoundingBox: {
                        Width: 1,
                        Height: 2,
                        Left: 3,
                        Top: 4
                      },
                      Confidence: 99,
                      Landmarks: [],
                      Pose: {},
                      Quality: {}
                    },
                    MatchConfidence: 95
                  }],
                  UnrecognizedFaces: [],
                  OrientationCorrection: "ROTATE_0"
                };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(celebs_image_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_single_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'celebs', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.isUndefined(data.Next);
                    assert.equal(data.Celebs.length,1);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','celebs.json'].join('/'));
                    assert.equal(data.MediaType,'image');
                    done();
                }
            });
        });

        it('should return a JSON object of video celebrity impressions', function(done) {

            let celebs_video_raw = {
              JobStatus: "SUCCEEDED",
              VideoMetadata: {
                DurationMillis: 221212
              },
              Celebrities: [{
                Timestamp: 12,
                Celebrity: {
                  Name: "Famous Man",
                  Id: "0000man",
                  Urls: ['www.famousman.com'],
                  Confidence: 80,
                  BoundingBox: {
                    Width: 1,
                    Height: 2,
                    Left: 3,
                    Top: 4
                  }
                }
              }, {
                Timestamp: 800,
                Celebrity: {
                  Name: "Famous Woman",
                  Id: "0000woman",
                  Urls: ['www.famouswoman.com'],
                  Confidence: 90,
                  BoundingBox: {
                    Width: 1,
                    Height: 2,
                    Left: 3,
                    Top: 4
                  }
                }
              }, {
                Timestamp: 12412,
                Celebrity: {
                  Name: "Famous Man",
                  Id: "0000man",
                  Urls: ['www.famousman.com'],
                  Confidence: 90,
                  BoundingBox: {
                    Width: 1,
                    Height: 2,
                    Left: 3,
                    Top: 4
                  }
                }
              }]
            };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(celebs_video_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_multiple_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'celebs', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.Next,2);
                    assert.equal(data.Celebs.length,2);
                    assert.equal(data.Celebs[0].Impressions.length,2);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','celebs.json'].join('/'));
                    assert.equal(data.MediaType,'video');
                    done();
                }
            });
        });

        //Faces
        it('should return a JSON object of image face impressions', function(done) {

            let faces_image_raw = {
                FaceDetails: [{
                  BoundingBox: {
                    Width: 1,
                    Height: 2,
                    Left: 3,
                    Top: 4
                  },
                  AgeRange: {
                    Low: 45,
                    High: 63
                  },
                  Smile: {
                    Value: true,
                    Confidence: 52
                  },
                  Eyeglasses: {
                    Value: true,
                    Confidence: 58
                  },
                  Sunglasses: {
                    Value: true,
                    Confidence: 99
                  },
                  Gender: {
                    Value: "Male",
                    Confidence: 99
                  },
                  Beard: {
                    Value: true,
                    Confidence: 99
                  },
                  Mustache: {
                    Value: true,
                    Confidence: 99
                  },
                  EyesOpen: {
                    Value: true,
                    Confidence: 99
                  },
                  MouthOpen: {
                    Value: true,
                    Confidence: 91
                  },
                  Emotions: [{
                    Type: "CALM",
                    Confidence: 94
                  }, {
                    Type: "HAPPY",
                    Confidence: 33
                  }, {
                    Type: "CONFUSED",
                    Confidence: 6
                  }],
                  Landmarks: [],
                  Pose: {},
                  Quality: {},
                  Confidence: 99
                }],
                OrientationCorrection: "ROTATE_0"
              };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(faces_image_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_single_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'faces', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.isUndefined(data.Next);
                    assert.equal(data.Attributes.length,11);
                    assert.equal(data.Faces.length,1);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','faces.json'].join('/'));
                    assert.equal(data.MediaType,'image');
                    done();
                }
            });
        });

        it('should return a JSON object of video face impressions', function(done) {

            let faces_video_raw = {
                JobStatus: "SUCCEEDED",
                VideoMetadata: {
                  DurationMillis: 221212
                },
                Faces: [
                  {
                    Timestamp: 399,
                    Face: {
                      BoundingBox: {
                        Width: 1,
                        Height: 2,
                        Left: 3,
                        Top: 4
                      },
                      AgeRange: {
                        Low: 23,
                        High: 38
                      },
                      Smile: {
                        Value: true,
                        Confidence: 86
                      },
                      Eyeglasses: {
                        Value: true,
                        Confidence: 99
                      },
                      Sunglasses: {
                        Value: true,
                        Confidence: 99
                      },
                      Gender: {
                        Value: "Male",
                        Confidence: 98
                      },
                      Beard: {
                        Value: true,
                        Confidence: 54
                      },
                      Mustache: {
                        Value: true,
                        Confidence: 95
                      },
                      EyesOpen: {
                        Value: true,
                        Confidence: 86
                      },
                      MouthOpen: {
                        Value: true,
                        Confidence: 94
                      },
                      Emotions: [{
                        Type: "HAPPY",
                        Confidence: 61
                      }, {
                        Type: "SURPRISED",
                        Confidence: 35
                      }, {
                        Type: "SAD",
                        Confidence: 17
                      }],
                      Landmarks: [],
                      Pose: {},
                      Quality: {},
                      Confidence: 99
                    }
                  },
                  {
                    Timestamp: 14000,
                    Face: {
                      BoundingBox: {
                        Width: 1,
                        Height: 2,
                        Left: 3,
                        Top: 4
                      },
                      AgeRange: {
                        Low: 23,
                        High: 38
                      },
                      Smile: {
                        Value: true,
                        Confidence: 86
                      },
                      Eyeglasses: {
                        Value: true,
                        Confidence: 99
                      },
                      Sunglasses: {
                        Value: true,
                        Confidence: 99
                      },
                      Gender: {
                        Value: "Female",
                        Confidence: 98
                      },
                      Beard: {
                        Value: true,
                        Confidence: 54
                      },
                      Mustache: {
                        Value: true,
                        Confidence: 95
                      },
                      EyesOpen: {
                        Value: true,
                        Confidence: 86
                      },
                      MouthOpen: {
                        Value: true,
                        Confidence: 94
                      },
                      Emotions: [{
                        Type: "HAPPY",
                        Confidence: 61
                      }, {
                        Type: "CONFUSED",
                        Confidence: 35
                      }, {
                        Type: "SAD",
                        Confidence: 17
                      }],
                      Landmarks: [],
                      Pose: {},
                      Quality: {},
                      Confidence: 99
                    }
                  }
                ]
              };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(faces_video_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_multiple_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'faces', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.Next,2);
                    assert.equal(data.Attributes.length,13);
                    assert.equal(data.Attributes[0].Impressions.length,2);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','faces.json'].join('/'));
                    assert.equal(data.MediaType,'video');
                    done();
                }
            });
        });

        //Known Faces
        it('should return a JSON object of image known face impressions', function(done) {

            let known_faces_image_raw = {
                SearchedFaceBoundingBox: {
                  Width: 1,
                  Height: 2,
                  Left:3,
                  Top: 4
                },
                SearchedFaceConfidence: 99,
                FaceMatches: [{
                  Similarity: 99,
                  Face: {
                    FaceId: "ce0ba80e-026b-4bec-846c-3d15ddcc8e0f",
                    BoundingBox: {
                      Width: 1,
                      Height: 2,
                      Left: 3,
                      Top: 4
                    },
                    ImageId: "f67449ea-74d4-43d2-a35b-05508deea344",
                    ExternalImageId: "Known Person",
                    Confidence: 99
                  }
                },
                {
                  Similarity: 80,
                  Face: {
                    FaceId: "78903c3b-26c7-4263-a476-c11eca6a0a82",
                    BoundingBox: {
                      Width: 1,
                      Height: 2,
                      Left: 3,
                      Top: 4
                    },
                    ImageId: "047262b2-a3cc-431b-86d0-21177348de12",
                    ExternalImageId: "Another Known Person",
                    Confidence: 79
                  }
                }],
                FaceModelVersion: 3.0
              };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(known_faces_image_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_single_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'face_matches', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.isUndefined(data.Next);
                    assert.equal(data.FaceMatches.length,2);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','face_matches.json'].join('/'));
                    assert.equal(data.MediaType,'image');
                    done();
                }
            });
        });

        it('should return a JSON object of video known face impressions', function(done) {

            let known_faces_video_raw = {
                JobStatus: "SUCCEEDED",
                VideoMetadata: {
                  DurationMillis: 221212
                },
                Persons: [
                  {
                    Timestamp: 266,
                    Person: {
                      Index: 0,
                      BoundingBox: {
                        Width: 1,
                        Height: 2,
                        Left: 3,
                        Top: 4
                      }
                    }
                  },
                  {
                    Timestamp: 1599,
                    Person: {
                      Index: 0,
                      BoundingBox: {
                        Width: 1,
                        Height: 2,
                        Left: 3,
                        Top: 4
                      },
                      Face: {
                        BoundingBox: {
                          Width: 1,
                          Height: 2,
                          Left: 3,
                          Top: 4
                        },
                        Landmarks: [],
                        Pose: {},
                        Quality: {},
                        Confidence: 99
                      }
                    },
                    FaceMatches: [{
                      Similarity: 84,
                      Face: {
                        FaceId: "229bb34d-4d95-43eb-8573-6129b4d6e7df",
                        BoundingBox: {
                          Width: 1,
                          Height: 2,
                          Left: 3,
                          Top: 4
                        },
                        ImageId: "4bd04755-ad18-4ad5-9656-37d6831b2eb7",
                        ExternalImageId: "Known Man",
                        Confidence: 99
                      }
                    }, {
                      Similarity: 84,
                      Face: {
                        FaceId: "2500e2bc-d062-46b3-9b5b-aa267bb2e580",
                        BoundingBox: {
                          Width: 1,
                          Height: 2,
                          Left: 3,
                          Top: 4
                        },
                        ImageId: "b88336fe-25ff-4217-8329-a25f47b841fb",
                        ExternalImageId: "Known Man 2",
                        Confidence: 99
                      }
                    }]
                  },
                  {
                    Timestamp: 2260,
                    Person: {
                      Index: 0,
                      BoundingBox: {
                        Width: 1,
                        Height: 2,
                        Left: 3,
                        Top: 4
                      },
                      Face: {
                        BoundingBox: {
                          Width: 1,
                          Height: 2,
                          Left: 3,
                          Top: 4
                        },
                        Landmarks: [],
                        Pose: {},
                        Quality: {},
                        Confidence: 78
                      }
                    },
                    FaceMatches: [{
                      Similarity: 84,
                      Face: {
                        FaceId: "229bb34d-4d95-43eb-8573-6129b4d6e7df",
                        BoundingBox: {
                          Width: 1,
                          Height: 2,
                          Left: 3,
                          Top: 4
                        },
                        ImageId: "4bd04755-ad18-4ad5-9656-37d6831b2eb7",
                        ExternalImageId: "Known Man",
                        Confidence: 80
                      }
                    }]
                  }
                ]
              };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(known_faces_video_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_multiple_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'face_matches', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.Next,2);
                    assert.equal(data.FaceMatches.length,2);
                    assert.equal(data.FaceMatches[0].Impressions.length,2);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','face_matches.json'].join('/'));
                    assert.equal(data.MediaType,'video');
                    done();
                }
            });
        });

        //Entities
        it('should return a JSON object of detected entities', function(done) {

            let entities_raw = {
                ResultList: [{
                  Index: 0,
                  Entities: [{
                    Score: 0.97,
                    Type: "ORGANIZATION",
                    Text: "Organization",
                    BeginOffset: 630,
                    EndOffset: 636
                  }, {
                    Score: 0.78,
                    Type: "QUANTITY",
                    Text: "One",
                    BeginOffset: 894,
                    EndOffset: 902
                  }]
                }],
                ErrorList: []
              };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(entities_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_single_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'entities', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.isUndefined(data.Next);
                    assert.equal(data.Entities.length,2);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','entities.json'].join('/'));
                    done();
                }
            });
        });

        //Phrases
        it('should return a JSON object of detected phrases', function(done) {

            let phrases_raw = {
                ResultList: [{
                  Index: 0,
                  KeyPhrases: [{
                    Score: 0.90,
                    Text: "the first phrase",
                    BeginOffset: 107,
                    EndOffset: 116
                  }, {
                    Score: 0.99,
                    Text: "the next phrase",
                    BeginOffset: 127,
                    EndOffset: 154
                  }]
                }],
                ErrorList: []
              };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(phrases_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_single_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'phrases', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.isUndefined(data.Next);
                    assert.equal(data.Phrases.length,2);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','phrases.json'].join('/'));
                    done();
                }
            });
        });

        //Transcript
        it('should return a JSON object of transcribed audio', function(done) {

            let transcript_raw = {
                jobName: "33451416-a313-4d30-ae23-82da4cb3c89d_transcription",
                results: {
                  transcripts: [{
                    transcript: "This is a transcript"
                  }],
                  items: [{
                    start_time: 0.230,
                    end_time: 0.600,
                    alternatives: [{
                      confidence: 1.0000,
                      content: "This"
                    }],
                    type: "pronunciation"
                  }, {
                    start_time: 1.490,
                    end_time: 2.610,
                    alternatives: [{
                      confidence: 0.9992,
                      content: "is"
                    }],
                    type: "pronunciation"
                  }, {
                    start_time: 3.160,
                    end_time: 3.480,
                    alternatives: [{
                      confidence: 0.7783,
                      content: "a"
                    }],
                    type: "pronunciation"
                  }, {
                    start_time: 3.480,
                    end_time: 3.580,
                    alternatives: [{
                      confidence: 0.9918,
                      content: "transcript"
                    }],
                    type: "pronunciation"
                  }]
                },
                status: "COMPLETED"
              };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(transcript_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_single_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'transcript', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.isUndefined(data.Next);
                    assert.equal(data.Transcripts[0].Transcript,"This is a transcript");
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','transcript.json'].join('/'));
                    done();
                }
            });
        });

        //Captions
        it('should return a JSON object of subtitle data taken from transcript', function(done) {

            let transcript_raw = {
                jobName: "33451416-a313-4d30-ae23-82da4cb3c89d_transcription",
                results: {
                  transcripts: [{
                    transcript: "This is a transcript"
                  }],
                  items: [{
                    start_time: 0.230,
                    end_time: 0.600,
                    alternatives: [{
                      confidence: 1.0000,
                      content: "This"
                    }],
                    type: "pronunciation"
                  }, {
                    start_time: 1.490,
                    end_time: 2.610,
                    alternatives: [{
                      confidence: 0.9992,
                      content: "is"
                    }],
                    type: "pronunciation"
                  }, {
                    start_time: 3.160,
                    end_time: 3.480,
                    alternatives: [{
                      confidence: 0.7783,
                      content: "a"
                    }],
                    type: "pronunciation"
                  }, {
                    start_time: 3.480,
                    end_time: 3.580,
                    alternatives: [{
                      confidence: 0.9918,
                      content: "transcript"
                    }],
                    type: "pronunciation"
                  }]
                },
                status: "COMPLETED"
              };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(transcript_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_single_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'captions', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.isUndefined(data.Next);
                    assert.equal(data.Captions.length,4);
                    assert.equal(data.Captions[0].Timestamp,230);
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','transcript.json'].join('/'));
                    done();
                }
            });
        });

        //Persons
        it('should return a JSON object of video known face impressions', function(done) {

            let persons_raw = {
                JobStatus: "SUCCEEDED",
                VideoMetadata: {
                  DurationMillis: 221212
                },
                Persons: [
                  {
                  Timestamp: 266,
                  Person: {
                    Index: 0,
                    BoundingBox: {
                      Width: 1,
                      Height: 2,
                      Left: 3,
                      Top: 4
                    }
                  }
                },
                {
                  Timestamp: 399,
                  Person: {
                      Index: 0,
                      BoundingBox: {
                          Width: 1,
                          Height: 2,
                          Left: 3,
                          Top: 4
                      },
                      Face: {
                          BoundingBox: {
                              Width: 1,
                              Height: 2,
                              Left: 3,
                              Top: 4
                          },
                          Landmarks: [],
                          Pose: {},
                          Quality: {},
                          Confidence: 99
                      }
                  }
                }
              ]
            };

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, {Body:JSON.stringify(persons_raw)});
            });

            AWS.mock('S3', 'listObjects', function(params, callback) {
                callback(null, list_multiple_response);
            });

            let _lookup = new Lookup();
            _lookup.getDetails(object_id, 'persons', owner_id, 1, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.Next,2);
                    assert.equal(JSON.stringify(data.Persons),JSON.stringify(persons_raw));
                    assert.equal(data.s3.key,['private',owner_id,'media',object_id,'results','persons.json'].join('/'));
                    done();
                }
            });
        });

    });
});
