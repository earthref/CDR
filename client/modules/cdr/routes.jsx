import _ from  'lodash';
import React from 'react';
import queryString from 'query-string'
import {Route, Switch, Redirect} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import {versions} from '/lib/configs/cdr/data_models.js';
import Page from '/client/modules/common/components/page';
import CDRHome from '/client/modules/cdr/components/home';

import CDRMenu from '/client/modules/cdr/components/menu/menu';
import CDRContact from '/client/modules/cdr/components/menu/contact';


import CDRSearch from '/client/modules/cdr/components/search';
import CDRUploadContribution from '/client/modules/cdr/components/upload_contribution';
import CDRPrivateContributions from '/client/modules/cdr/components/private_contributions';
import CDRDataModel from '/client/modules/cdr/components/data_model';

import CDRValidateContribution from '/client/modules/cdr/components/validate_contribution';
import Error from '/client/modules/common/components/error';

const Routes = ({match}) => (
  <Switch>

    {/* Static Pages */}
    <Route exact path="/CDR" render={() =>
      <Page portal="CDR" menu={<CDRMenu/>}>
        <Helmet><title>CDR Home | EarthRef.org</title></Helmet>
        <CDRHome/>
      </Page>
    }/>
    <Route exact path="/CDR/contact" render={() =>
      <Page portal="CDR" menu={<CDRMenu/>}>
        <Helmet><title>Contact CDR | EarthRef.org</title></Helmet>
        <CDRContact/>
      </Page>
    }/>

    {/* Search Interface */}
    <Route exact path="/CDR/search" render={({location}) => {
      let redirectTo;
      if (_.trim(location.hash) !== '') {
        try {
          let oldSearchState = JSON.parse(atob(location.hash.substr(1)));
          if (oldSearchState && oldSearchState.p && oldSearchState.p.length >= 0)
            redirectTo = {
              pathname: "/CDR/search", 
              state: {
                search: `doi:"${oldSearchState.p[0]}"`
              }
            };
        } catch(e) { console.error(e); }
      }
      if (!redirectTo && location.search && location.search.length > 1) {
        redirectTo = {
          pathname: "/CDR/search", 
          state: {
            search: location.search.substring(1)
          }
        };
      }
      return (redirectTo && <Redirect to={redirectTo}/> ||
        <Page fullWidth portal="CDR" menu={<CDRMenu/>}>
          <Helmet><title>CDR Search | EarthRef.org</title></Helmet>
          <CDRSearch search={location.state && location.state.search || ""}/>
        </Page>
      );
    }}/>
    <Route exact path="/CDR/:id(\d+)/:private_key([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})" render={({match, location}) =>
      <Redirect to={{
        pathname: "/CDR/search", 
        state: {
          search: `id:"${match.params.id}" private_key:"${match.params.private_key}" ` + location.search || ""
        }
      }}/>
    }/>
    <Route exact path="/CDR/:id(\d+)" render={({match, location}) =>
      <Redirect to={{
        pathname: "/CDR/search", 
        state: {
          search: `id:"${match.params.id}" ` + location.search || ""
        }
      }}/>
    }/>
    <Route exact path="/CDR/doi/:doi(.+)" render={({match, location}) =>
      <Redirect to={{
        pathname: "/CDR/search", 
        state: {
          search: `doi:"${match.params.doi}" ` + location.search || ""
        }
      }}/>
    }/>
    
    {/* Other Tools */}
    <Route exact path="/CDR/validate" render={() =>
      <Page portal="CDR" title="Validate a CDR contribution:" menu={<CDRMenu/>}>
        <Helmet>
          <title>CDR Validator | EarthRef.org</title>
        </Helmet>
        <CDRValidateContribution/>
      </Page>
    }/>

    <Route exact path="/CDR/upload" render={() =>
      <Page portal="CDR" title="Upload data into your private workspace:" menu={<CDRMenu/>}>
        <Helmet>
          <title>CDR Uploader | EarthRef.org</title>
        </Helmet>
        <CDRUploadContribution/>
      </Page>
    }/>

    <Route exact path="/CDR/private" render={({location}) =>
      <Page portal="CDR" title="Manage your contributions:" menu={<CDRMenu/>}>
        <Helmet>
          <title>CDR Private Workspace | EarthRef.org</title>
        </Helmet>
        <CDRPrivateContributions/>
      </Page>
    }/>

    <Redirect exact from="/CDR/data-models" to={`/CDR/data-models/${_.last(versions)}`}/>
    <Route exact path="/CDR/data-models/:v" render={({match, location}) => {
      if (window.history.replaceState)
        window.history.replaceState({}, 'CDR Data Models | EarthRef.org', '/CDR/data-models/' + match.params.v);    
      return (
        <Page portal="CDR" title="Browse the current and recent CDR Data Models:" menu={<CDRMenu/>}>
          <Helmet>
            <title>CDR Data Models | EarthRef.org</title>
          </Helmet>
          <CDRDataModel version={match.params.v} search={queryString.parse(location.search).q || ""}/>
        </Page>
      );
    }}/>
    
    {/* 404 Not Found */}
    <Route render={() =>
      <Page portal="CDR" menu={<CDRMenu/>}>
        <Helmet>
          <title>CDR Error | EarthRef.org</title>
        </Helmet>
        <Error title="Error 404: Sorry, this page is missing!"/>
      </Page>
    }/>
  </Switch>
);

export default Routes;
