'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let MediaConvert = require('./media-convert.js');

describe('MediaConvert', function() {

  let state = {
    Records: [{"eventSource":"media-analysis"}],
    key: "private/us-east-1:xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/media/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/content/example.mp4",
    file_type: "mp4",
    owner_id: "us-east-1:xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    object_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  };

  let describe_endpoints_response = {
    Endpoints: [{
      Url: 'https://xxxxxxxx.mediaconvert.us-east-1.amazonaws.com'
    }]
  };

  let create_job_response = {
    "Job": {
      "Arn": "arn:aws:mediaconvert:us-east-1:11111111111:jobs/1111111111-xxxxxxx",
      "CreatedAt": "2018-08-12T12:00:00.000Z",
      "Id": "1111111111-xxxxxxx",
      "Queue": "arn:aws:mediaconvert:us-east-1:11111111111:queues/Default",
      "Role": "arn:aws:iam::11111111111:role/MediaConvertRole",
      "Settings": {
        "OutputGroups": [{
          "Outputs": [{
            "NameModifier": "_audio",
            "Extension": "mp4"
          }]
        }]
      },
      "Status": "SUBMITTED",
      "Timing": {},
      "UserMetadata": {}
    }
  }

  let get_job_response_progressing = {
      "Job": {
          "Arn": "arn:aws:mediaconvert:us-east-1:11111111111:jobs/1111111111-xxxxxxx",
          "CreatedAt": "2018-08-12T12:00:00.000Z",
          "Id": "1111111111-xxxxxxx",
          "Queue": "arn:aws:mediaconvert:us-east-1:11111111111:queues/Default",
          "Role": "arn:aws:iam::11111111111:role/MediaConvertRole",
          "Settings": {
            "OutputGroups": [{
              "Outputs": [{
                "NameModifier": "_audio",
                "Extension": "mp4"
              }]
            }]
          },
          "Status": "PROGRESSING",
          "Timing": {},
          "UserMetadata": {}
      }
  };

  let get_job_response_complete = {
      "Job": {
          "Arn": "arn:aws:mediaconvert:us-east-1:11111111111:jobs/1111111111-xxxxxxx",
          "CreatedAt": "2018-08-12T12:00:00.000Z",
          "Id": "1111111111-xxxxxxx",
          "Queue": "arn:aws:mediaconvert:us-east-1:11111111111:queues/Default",
          "Role": "arn:aws:iam::11111111111:role/MediaConvertRole",
          "Settings": {
            "OutputGroups": [{
              "Outputs": [{
                "NameModifier": "_audio",
                "Extension": "mp4"
              }]
            }]
          },
          "Status": "COMPLETE",
          "Timing": {},
          "UserMetadata": {}
      }
  };

  describe('#createJob', function() {

    beforeEach(() => {});

    afterEach(() => {
      AWS.restore('MediaConvert');
    });

    it('should return information about the MediaConvert job if successful', (done) => {

      AWS.mock('MediaConvert', 'describeEndpoints', Promise.resolve(describe_endpoints_response));
      AWS.mock('MediaConvert', 'createJob', Promise.resolve(create_job_response));

      let _mediaConvert = new MediaConvert();

      _mediaConvert.createJob(state, (err, data) => {
        if (err) done(err);
        else {
          expect(data.jobDidStart).to.equal(true);
          expect(data.data.Job.Status).to.equal('SUBMITTED');
          done();
        }
      })
    });

    it('should return an error if MediaConvert job fails to start', (done) => {

      AWS.mock('MediaConvert', 'describeEndpoints', Promise.resolve(describe_endpoints_response));
      AWS.mock('MediaConvert', 'createJob', Promise.reject('error'));

      let _mediaConvert = new MediaConvert();

      _mediaConvert.createJob(state, (err, data) => {
        if (err) {
          expect(err).to.equal('error');
          done();
        }
      })
    });
  });

  describe('#getJobStatus', () => {
    beforeEach(() => {});

    afterEach(() => {
      AWS.restore('MediaConvert');
    });

    it('should update the MediaConvert job status on the state object', (done) => {

      AWS.mock('MediaConvert', 'describeEndpoints', Promise.resolve(describe_endpoints_response));
      AWS.mock('MediaConvert', 'getJob', Promise.resolve(get_job_response_progressing));

      let state_after_mediaconvert_start = {
        Records: [{"eventSource":"media-analysis"}],
        key: "private/us-east-1:xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/media/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/content/example.mp4",
        file_type: "mp4",
        owner_id: "us-east-1:xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        object_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        mediaConvert: {
          jobDidStart: true,
          data: get_job_response_progressing
        }
      }

      let _mediaConvert = new MediaConvert();

      _mediaConvert.getJobStatus(state_after_mediaconvert_start, (err, data) => {
        if (err) done(err);
        else {
          expect(data.mediaConvert.status).to.equal('PROGRESSING');
          //expect(data.key).to.equal(state.key);
          done();
        }
      })
    });

    it('should replace the file key with the new audio file if the job has completed', (done) => {

      AWS.mock('MediaConvert', 'describeEndpoints', Promise.resolve(describe_endpoints_response));
      AWS.mock('MediaConvert', 'getJob', Promise.resolve(get_job_response_complete));

      let state_after_mediaconvert_complete = {
        Records: [{"eventSource":"media-analysis"}],
        key: "private/us-east-1:xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/media/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/content/example.mp4",
        file_type: "mp4",
        owner_id: "us-east-1:xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        object_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        mediaConvert: {
          jobDidStart: true,
          data: get_job_response_complete
        }
      }

      let _mediaConvert = new MediaConvert();

      _mediaConvert.getJobStatus(state_after_mediaconvert_complete, (err, data) => {
        if (err) done(err);
        else {
          expect(data.mediaConvert.status).to.equal('COMPLETE');
          //expect(data.key).to.not.equal(state.key);
          expect(data.key).to.equal("mediaconvert/private/us-east-1:xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/media/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/content/example_audio.mp4");
          done();
        }
      })
    });

  });
});
