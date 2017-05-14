import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import request from 'superagent';
import jsonp from 'superagent-jsonp';
(function(){

function SearchResult (props) {
	let lists = props.resultData.map((item, i) => (
		<div key={i}>
			<h2>{item.title}</h2>
			<a href="{item.url}" target="_brank">{item.url}</a>
		</div>
	));
	return <div>{lists}</div>;
}

class SearchForm extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			keyword: '',
			url: 'http://wikipedia.simpleapi.net/api?&output=json&keyword=',
			resultData : []
		};
		this.onChange = this.onChange.bind(this);
	}

	onChange(e, key) {
		this.setState({ [key]: e.target.value });
		const changeBlock = (err, res) => {
			if (!err && res.body) {
				this.setState({ resultData: res.body });
			}
		}
		request.get(this.state.url + encodeURIComponent(e.target.value)).use(jsonp).end(changeBlock);
	}

	render() {
		return (
			<div>
				<h1>Wikipedia Search</h1>
				<form>
					<input type="search" value={this.state.keyword} onChange={(e) => this.onChange(e, 'keyword')} />
					<input type="hidden" value={this.state.url} />
				</form>
				<SearchResult resultData={this.state.resultData} />
			</div>
		);
	}
}

ReactDOM.render(
	<SearchForm />,
	document.getElementById('container')
);

})();
