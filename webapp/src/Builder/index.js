import React from 'react';
import firebase from 'firebase';
import { toast } from 'react-toastify';

import { translate } from 'i18n/locale';
import { getApiHostname } from 'utils/getHostname';
import gravitaesql from 'utils/gravitaesql'

import Builder from './Builder';

const defaultCv = {
  header: {
    name: '',
  },
  work: [],
  academic: [],
  project: [],
  achievement: [],
  education: [],
  language: [],
};

const defaultUser = {
  cv: defaultCv,
  user_cv_model: 'awesome',
  params: {},
  autosave: false,
  cv_order: [
    'work',
    'education',
    'achievement',
    'project',
    'academic',
    'language',
    'skill',
  ],
};

const formatLegacyJson = stringyfiedJson => ({
  ...JSON.parse(stringyfiedJson),
  user_cv_model: 'awesome',
  params: {},
})

class BuilderContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: defaultUser,
      cv_models: [],
      user: null,
    };

    this.setUserData = this.setUserData.bind(this);
  }

  componentDidMount() {
    firebase
      .auth()
      .getRedirectResult()
      .then(() => {
        const user = firebase.auth().currentUser;

        this.setState({ user });
        if (user) {
          const loadingToast = toast.info(`${translate('loading')}...`, { autoClose: false });

          gravitaesql(user.email, `
            query LegacyJSON {
              currentUser
            }
          `).then(data => {
            if (!data) {
              gravitaesql(user.email, `
                mutation CreateUser {
                  createUser
                }
              `).then(mutationData => {
                this.setState({
                  userData: formatLegacyJson(mutationData.createUser),
                });
                toast.dismiss(loadingToast);
              });
            } else {
              this.setState({
                userData: formatLegacyJson(data.currentUser),
              });
              toast.dismiss(loadingToast);
            }
          });
        }
      });

    fetch(`${window.location.protocol}//${getApiHostname()}/template/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      if (response.ok) {
        const jsonPromise = response.json();
        jsonPromise.then((json) => {
          this.setState({ cv_models: json });
        });
      } else {
        const textPromise = response.text();
        textPromise.then(text => toast.error(`${translate('error')}: ${text}`));
      }
    });
  }

  setUserData(userData) {
    this.setState({ userData });
  }

  render() {
    return (
      <React.Fragment>
        <Builder
          cv_models={this.state.cv_models}
          user={this.state.user}
          userData={this.state.userData}
          userDataSetter={this.setUserData}
        />
      </React.Fragment>
    );
  }
}

export default BuilderContainer;
