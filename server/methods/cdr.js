import {Meteor} from 'meteor/meteor';
import {HTTP} from 'meteor/http';

import _ from 'lodash';
import moment from 'moment';
import request from 'request';

import {Collections, collectionDefinitions} from '/lib/collections';

export default function () {

  Meteor.methods({

    'createImportSettingsTemplate': function (user, name, settings) {
      //console.log('create import', user, name, settings);
      return Collections['cdr.import.settings.templates'].insert({
        _user: user,
        _name: name,
        _inserted: moment().utc().toISOString(),
        settings: settings
      }, (error) => { console.log('create import', error)});
    },

    'saveImportSettingsTemplate': function (user, ID, settings) {
      //console.log('save import', user, ID, settings);
      Collections['cdr.import.settings.templates'].update({
        _id: ID,
        _user: user
      }, {
        $set: { settings: settings }
      }, (error) => { console.log('save import', error)});
    },

    'renameImportSettingsTemplate': function (user, ID, name) {
      //console.log('rename import', user, ID, name);
      Collections['cdr.import.settings.templates'].update({
        _id: ID,
        _user: user
      }, {
        $set: { _name: name }
      }, (error) => { console.log('rename import', error)});
    },

    'deleteImportSettingsTemplate': function (user, ID) {
      //console.log('delete import', user, ID);
      Collections['cdr.import.settings.templates'].remove({
        _id: ID,
        _user: user
      }, (error) => { console.log('delete import', error)});
    },

    'getImportSettingsTemplates': function (user) {
      console.log('getImportSettingsTemplates', user);
      let templates = Collections['cdr.import.settings.templates'].find(
        {_user: user},
        {sort: {'_inserted': -1}}).fetch();
      console.log('getImportSettingsTemplates', user, templates);
      return templates;
    },

    'getImportSettingsTemplate': function (ID) {
      return Collections['cdr.import.settings.templates'].findOne(ID);
    },

    async cdrGetPrivateContribution(id, user, attempt = 0) {
      this.unblock();
      console.log("cdrGetPrivateContribution", id, user, attempt);

      try {
        return await Meteor.call("s3GetObject", { 
          bucket: `cdr-private-contributions/${id}`,
          key: `cdr_contribution_${id}.txt`,
          encoding: 'utf-8'
        });
      } catch (e) {
        // console.error("cdrGetPrivateContribution", `Failed to retrieve private contribution for ${id}`, e);
        throw new Meteor.Error("cdrGetPrivateContribution", `Failed to retrieve private contribution for ${id}`);
      }
    },

    async cdrGetPrivateContributionZip(id, user, attempt = 0) {
      this.unblock();
      console.log("cdrGetPrivateContributionZip", id, user, attempt);

      try {
        return await Meteor.call("s3GetObject", { 
          bucket: `cdr-private-contributions/${id}`,
          key: `cdr_contribution_${id}.zip`
        });
      } catch (e) {
        // console.error("cdrGetPrivateContributionZip", `Failed to retrieve private contribution for ${id}`, e);
        throw new Meteor.Error("cdrGetPrivateContributionZip", `Failed to retrieve private contribution for ${id}`);
      }
    },

    async cdrGetPublicContributions(ids, fileName, user, attempt = 0) {
      this.unblock();
      console.log("cdrGetPublicContributions", ids, fileName, user, attempt);

      try {
        return await Meteor.call("s3GetObjectsZip", {
          fileName,
          objects: ids.map(id => { 
            return { 
              bucket: `cdr-activated-contributions/${id}`,
              key: `cdr_contribution_${id}.txt`
            };
          })
        });
      } catch (e) {
        console.error("cdrGetPublicContributions", `Failed to retrieve private contributions for IDs ${ids.join(', ')}`, e);
        // throw new Meteor.Error("cdrGetPublicContributions", `Failed to retrieve private contributions for IDs ${ids.join(', ')}`);
      }
    }

  });

};