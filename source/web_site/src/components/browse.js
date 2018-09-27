import React, { Component } from 'react';
import Amplify, { API } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { Alert, Container, Row, Col, Form, FormGroup, Input, Button, Modal, ModalHeader, Progress, ModalBody, Pagination, PaginationItem, PaginationLink} from 'reactstrap';
import MediaCard from './mediacard';

class Browse extends Component {
	constructor(props) {
	    super(props);
			this.state = {
				results: [],
				searchterm: "*",
				error: false,
				current_page: 1,
				searching: false,
				noresults: false,
				page_count: 1,
				result_count: 0
			}
	    this.Search = this.Search.bind(this);
			this.Change = this.Change.bind(this);
			this.Dismiss = this.Dismiss.bind(this);
			this.ChangePage = this.ChangePage.bind(this);
	}

	componentDidMount() {
		this.Search({"change_page":1});
	}

	componentDidUpdate() {
  window.scrollTo(0,0);
	}

	Change(e) {
		var self = this;
		self.setState({
			"searchterm": e.target.value,
			"results": [],
			noresults: false
		});
	}

	Search(e) {
		var self = this;
		var path = "";
		var term = "";

		self.setState({
			searching: true
		});

		if ("change_page" in e) {
			term =  encodeURIComponent(self.state.searchterm);
			path = ['/search?','searchterm=',term,'&','page=',(e.change_page)].join('').replace('*','%2A');
		}
		else {
			e.preventDefault();
			e.target.reset();
			this.setState({
				current_page: 1
			});
			term =  encodeURIComponent(self.state.searchterm);
			path = ['/search?','searchterm=',term,'&','page=1'].join('').replace('*','%2A');
		}

		let requestParams = {};

    API.get('MediaAnalysisApi', path, requestParams)
      .then (function(response) {
        //console.log(response);
        if(response.Items !== 0) {
		    	self.setState({
		    		results: response.Items,
						searching:false,
						noresults: false,
						result_count: response.total,
						page_count: Math.ceil(response.total/30)
		    	});
        }
        else {
			    	self.setState({
			    		results: [],
							searching: false,
							noresults: true,
							result_count: 0,
							page_count: 1
			    	});
			    	//console.log("no results found");
		    }
      })
      .catch(function (error) {
				self.setState({
					"error": true,
					searching: false
				});
		    //console.log(error);
		  });
	}

	Dismiss(e) {
    e.preventDefault();
      this.setState({
        error: false,
				noresults: false
      });
  }

	ChangePage(e) {
		e.preventDefault();
		var new_page = e.target.id;
		this.setState({
			results: [],
			current_page: new_page
		}, () => {
			this.Search({"change_page":new_page});
		});
	}

	render(){
		var media_cards = this.state.results.map(item => {
			return(
				<Col md="4" className="py-2">
					<MediaCard item={item} />
				</Col>
			)
		});

		var pages = [];
		for (let p = 1; p <= this.state.page_count; p++) {
			pages.push(p);
		}

		var page_numbers = pages.map(page => {
				return(
					<PaginationItem active={this.state.current_page === {page}.page}>
						<PaginationLink href="#" id={page} onClick={this.ChangePage}>
							{page}
						</PaginationLink>
					</PaginationItem>
				);
		});

		return(
			<Container fluid className="bg-light">
				<div>
					<Alert name="noresults" color="warning" isOpen={this.state.noresults} toggle={this.Dismiss}>
	          Search returned no results
	        </Alert>
					<Alert name="error" color="danger" isOpen={this.state.error} toggle={this.Dismiss}>
						Search Error
					</Alert>
				</div>
				<div>
					<Modal isOpen={this.state.searching}>
						<ModalHeader>Searching</ModalHeader>
						<ModalBody>
							<Progress animated color="warning" value="100" />
						</ModalBody>
					</Modal>
				</div>
				<div>
					<Form inline className="pt-2 pb-2" onSubmit={this.Search}>
						<Button type="submit" >Search</Button>
						<FormGroup className="mr-2 ml-4">
		          <Input name="searchterm" type="text" value={this.searchterm} placeholder="keyword..." onChange={this.Change} />
		        </FormGroup>
					</Form>
					<Pagination className="pb-2 justify-content-end">
						{page_numbers}
					</Pagination>
					<h6 align="right">Viewing {((this.state.current_page - 1) * 30) + media_cards.length} of {this.state.result_count} results</h6>
				</div>
				<div>
					<Container>
						<Row>
							{media_cards}
						</Row>
					</Container>
				</div>
			</Container>

		);
	}
}

export default withAuthenticator(Browse);
