import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';

export default class extends React.Component {

  render() {
    let itemStyle = {padding:'0.5em 1em'};
    return (
      <div className="ui secondary small pointing yellow menu" style={{margin:'0.25em 0 1.25em'}}>
        <NavLink exact className={"item"} to={"/CDR"} activeClassName="active" style={itemStyle}>
          Home
        </NavLink>
        <div className="right menu">
          <a className={"item"} href={"https://github.com/earthref/CDR/issues"} target="_blank" style={itemStyle}>
            <Icon name='exclamation triangle'/>
            Report an Issue on GitHub
          </a>
          <NavLink className={"item"} to={"/CDR/contact"} activeClassName="active" style={itemStyle}>
            <Icon name='mail'/>
            Contact 
          </NavLink>
        </div>
      </div>
    );
  }

}

