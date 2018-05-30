import React, { Component } from 'react';
import Amplify, { Auth, Storage, API } from 'aws-amplify';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { NavbarBrand, Navbar, Nav, NavItem, NavLink } from 'reactstrap';
import Home from './home';
import Upload from './upload';
import Browse from './browse';
import Settings from './settings';
import Result from './result';
declare var media_analysis_config;

Amplify.configure({
  Auth: {
    region: media_analysis_config.SOLUTION_REGION,
    userPoolId: media_analysis_config.SOLUTION_USERPOOLID,
    userPoolWebClientId: media_analysis_config.SOLUTION_USERPOOLWEBCLIENTID,
    identityPoolId: media_analysis_config.SOLUTION_IDENTITYPOOLID
  },
  Storage: {
        bucket: media_analysis_config.SOLUTION_BUCKET,
        region: media_analysis_config.SOLUTION_REGION,
        identityPoolId: media_analysis_config.SOLUTION_IDENTITYPOOLID
    },
  API: {
      endpoints: [
        {
            name: "MediaAnalysisApi",
            region: media_analysis_config.SOLUTION_REGION,
            endpoint: media_analysis_config.SOLUTION_ENDPOINT
        }
      ]
  }
});

class App extends Component {

  constructor() {
    super();
    this.state = {};
  }


  render() {
    return (
      <div>
        <Router>
          <div>
            <Navbar color="dark">
              <NavbarBrand tag={Link} to="/home">Media Analysis Solution</NavbarBrand>
              <Nav className="ml-auto">
                <NavItem color="white">
                  <NavLink tag={Link} to="/upload" className="text-light">Upload</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/browse" className="text-light">Browse</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/settings" className="text-light">Settings</NavLink>
                </NavItem>
              </Nav>
            </Navbar>
            <hr />
            <Switch>
                <Route exact path='/' component={Home} />
                <Route path='/home' component={Home} />
                <Route path='/upload' component={Upload} />
                <Route path='/browse' component={Browse} />
                <Route path='/settings' component={Settings} />
                <Route path='/result/:objectid' component={Result} />
            </Switch>
          </div>
        </Router>
        <hr />
      </div>
    );
  }
}

export default App;
