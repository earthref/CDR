import React from 'react';
import {Link} from 'react-router-dom';
import {Image, Message} from 'semantic-ui-react';

import {portals} from '/lib/configs/portals.js';

export default class extends React.Component {

  render() {
    return (
      <div style={{textAlign: "justify"}}>
        <h3>
          <Image size="mini" src="/CDR/FIESTA small.png" floated="left"/>
          {` EarthRef FIESTA`}
        </h3>
        <p>
          The EarthRef.org Digital Archive (CDR) has been upgraded to use 
          EarthRef's new <b><a href="https://earthref.org/FIESTA">FIESTA software</a></b> to 
          support <b><a href="/CDR/private">private workspace</a></b> versioned 
          uploads validated against the CDR <b><a href="/CDR/data-models">data model</a></b> and a  
          full-text <b><a href="/CDR/search">search interface</a></b> with filters and compilation 
          downloads.
        </p>
      </div>
    );
  }

}
