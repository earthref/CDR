import React from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';

import EarthRefRoutes from '/client/modules/er/routes';
import CDRRoutes from '/client/modules/cdr/routes';

const supportsHistory = 'pushState' in window.history;

const App = () => (
  <Router forceRefresh={!supportsHistory}>
    <Switch>
      <Redirect exact from="/" to="/CDR"/>
      <Route path="/CDR" component={CDRRoutes}/>
      <Route             component={EarthRefRoutes}/>
    </Switch>
  </Router>
);

export default App;