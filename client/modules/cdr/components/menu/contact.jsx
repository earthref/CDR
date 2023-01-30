import React from 'react';
import {Item} from 'semantic-ui-react';

import UserItem from '/client/modules/common/components/user_item';

export default class extends React.Component {

  render() {
    return (
      <div>
        <Item.Group divided>
          <UserItem portal="CDR" id="njarboe"/>
          <UserItem portal="CDR" id="rminnett"/>
          <UserItem portal="CDR" id="ljonestrask"/>
          <UserItem portal="CDR" id="cconstable"/>
          <UserItem portal="CDR" id="akoppers"/>
          <UserItem portal="CDR" id="ltauxe"/>
        </Item.Group>
      </div>
	  );
  }

}
