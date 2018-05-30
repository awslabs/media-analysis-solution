import React, { Component } from 'react';
import { Button, Container, Row, Col } from 'reactstrap';
import { withAuthenticator } from 'aws-amplify-react';
import { Auth } from 'aws-amplify';

class Settings extends Component {
  constructor(props) {
	    super(props);
      this.Signout = this.Signout.bind(this);
    }

    Signout() {
      Auth.signOut()
      .then(function(result) {
        //console.log(result);
        window.location.reload();
      })
      .catch(function(err) {
        //console.log(err);
      });
    }

  render() {
    return (
        <Container>
        <Row>
          <Col>
            <Button color="primary" size="lg" block onClick={this.Signout}>Signout</Button>
          </Col>
        </Row>
        </Container>
    );
  }
}

export default withAuthenticator(Settings);
