import React, { Component } from 'react';
import arrayMove from 'array-move';
import fetch from 'fetch-retry';
import { toast } from 'react-toastify';
import _ from 'lodash';
import {
  Button, Form, Col, Row, 
  DropdownButton, ButtonGroup, Dropdown
} from 'react-bootstrap';
import Dropzone from 'react-dropzone';

import BugReporter from 'BugReporter';
import { translate, getActiveLocale } from 'i18n/locale';
import capitalize from 'utils/capitalize';
import gravitaesql from 'utils/gravitaesql';
import { getApiHostname, getStorageHostname } from 'utils/getHostname';
import hashCv from 'utils/hashCv';
import logger from 'utils/logger';
import removeDisabled from 'utils/removeDisabled';
import validateEmail from 'utils/validateEmail';
import validateDate from 'utils/validateDate';

import { Segment } from 'semantic-ui-react';
import CvOrder from './CvOrder';
import CvHeaderField from './CvHeaderField';
import CvItemForm from './CvItemForm';
import {headerFields, updateHeaderFields} from './headerFields';
import { cvFormFields, updateFormFields } from './cvFormFields';
import cvDownloadFormats from './cvDownloadFormats';
import ReactPixel from 'react-facebook-pixel';

const autoSaveTime = 15000;

class Builder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      downloading: false,
      showBugUi: false,
      chosenLabel: '',
      lastSaved: '',
    };
    this.handleChangeHeader = this.handleChangeHeader.bind(this);
    this.downloadCv = this.downloadCv.bind(this);
    this.saveOnAccount = this.saveOnAccount.bind(this);
    this.autoSave = this.autoSave.bind(this);
    this.setCv = this.setCv.bind(this);
    this.updateUserData = this.updateUserData.bind(this);
    this.setLabel = this.setLabel.bind(this);
    this.uploadJSON = this.uploadJSON.bind(this);

    this.autoSave();
  }

  setCv(cv) {
    const { userData } = this.props;
    userData.cv = cv;
    this.props.userDataSetter(userData);
  }

  setLabel(label) {
    this.setState({ chosenLabel: label });
  }

  updateUserData(data) {
    const { userData } = this.props;
    this.props.userDataSetter(_.assign(userData, data));
  }
  
  downloadCv(format, mimeContentType, fileFormat) {
    if (this.state.downloading) {
      return;
    }
    if (!validateEmail(this.props.userData.cv.header.email)) {
      toast.error(translate('invalid_email_format'));
      return;
    }
    if (this.props.userData.cv.header.name === '') {
      toast.error(translate('invalid_name_format'));
      return;
    }
    if (this.props.userData.cv.header.birthday) {
      if (!validateDate(this.props.userData.cv.header.birthday)) {
        toast.error(translate('invalid_birthday_format'));
        return;
      }
    }

    const cv = removeDisabled(this.props.userData.cv);

    // TODO this should be receiving full locale
    let { params } = this.props.userData;
    params = params || {};
    params.lang = getActiveLocale();

    const requestCv = {
      curriculum_vitae: cv,
      section_order: this.props.userData.cv_order,
      render_key: this.props.userData.user_cv_model,
      render_format: {
        internal: format,
        file: fileFormat,
      },
      params,
    };
    requestCv.path = hashCv(requestCv);

    const email = requestCv.curriculum_vitae.header.email;
    const path = requestCv.path;
    logger(email, path, 'FRONT_REQUEST', JSON.stringify(requestCv));
    this.setState({ downloading: true });

    const startTime = window.performance.now();
    fetch(`${window.location.protocol}//${getApiHostname()}/cv/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestCv),
    }).then((response) => {
      if (response.ok) {
        const idPromise = response.text();
        toast(`${translate('loading')}...`, { autoClose: false, toastId: 'downloading' });
        idPromise.then((id) => {
          fetch(
            `${window.location.protocol}//${getStorageHostname()}/${id}/${this.props.userData.cv.header.email}/?mime_content_type=${mimeContentType}`,
            {
              method: 'GET',
              retries: 20,
              retryDelay: 1000,
              retryOn: [404],
            },
          ).then((cvresponse) => {
            if (cvresponse.ok) {
              const fileBlob = cvresponse.blob();
              fileBlob.then((file) => {
                const element = document.createElement('a');
                element.href = URL.createObjectURL(file);
                element.download = `cv.${fileFormat}`;
                element.click();
              });
              const serveTime = window.performance.now();
              logger(email, path, 'SERVED_FOR_DOWNLOAD', serveTime - startTime);
              toast.update('downloading', { render: `${translate('ready')}!`, autoClose: 5000, type: toast.TYPE.INFO });
              this.setState({ downloading: false });
            } else {
              logger(email, path, 'FAILURE_NOTIFIED');
              toast.update('downloading', { render: translate('error_processing_file'), autoClose: 5000, type: toast.TYPE.ERROR });
              this.setState({ showBugUi: true, downloading: false });
            }
          });
        });
      } else {
        const textPromise = response.text();
        textPromise.then(text => toast.error(`${translate('error')}: ${text}`));
      }
    });
  }

  saveOnAccount() {
    const { user } = this.props;
    if (user !== null) {
      gravitaesql(this.props.userData.cv.header.email, `
        mutation UpdateUser($legacyJson: String!) {
          updateUser(legacyJson: $legacyJson)
        }
      `, {
        legacyJson: JSON.stringify(this.props.userData)
      }).then(_ => {
        this.setState({ lastSaved: JSON.stringify(this.props.userData) });
        toast.success(translate('saved'), {
          toastId: 'autosv',
        });
      });
    }
  }

  autoSave() {
    setInterval(() => {
      if (this.props.userData.autosave
         && JSON.stringify(this.props.userData) !== this.state.lastSaved) {
        this.saveOnAccount();
      }
    }, autoSaveTime);
  }

  handleChangeHeader(event) {
    const aux = this.props.userData.cv;
    aux.header[event.target.name] = event.target.value;
    if (aux.header[event.target.name] === '') {
      delete aux.header[event.target.name];
    }
    this.setCv(aux);
  }

  uploadJSON(selectorFiles) {
    const fr = new FileReader();
    // eslint-disable-next-line func-names
    fr.onload = function () {
      var json = JSON.parse(fr.result);
      if (json.hasOwnProperty('curriculum_vitae')) {
        json = json['curriculum_vitae'];
      }
      this.setCv(json);
    }.bind(this);
    fr.readAsText(selectorFiles[0]);
  }

  componentDidMount() {
    ReactPixel.init('898969540474999');
    ReactPixel.pageView(); 
  }

  render() {
    updateFormFields();
    updateHeaderFields();
    const cvModelOptions = [];
    for (const cvModelName in this.props.cv_models) {
      const cvModel = this.props.cv_models[cvModelName];
      cvModelOptions.push(
        <option key={cvModel.name} value={cvModel.name}>
          {capitalize(cvModel.name)}
        </option>,
      );
    }
    const cvModelSuboptions = [];
    if (this.props.cv_models !== undefined
      && this.props.cv_models[this.props.userData.user_cv_model] !== undefined) {
      for (const cvSuboption of this.props.cv_models[this.props.userData.user_cv_model].params) {
        const cvModelSuboptionsItems = [];
        for (const opt in cvSuboption.mapped_options) {
          cvModelSuboptionsItems.push(
            <option key={opt} value={cvSuboption.mapped_options[opt]}>
              {capitalize(opt)}
            </option>,
          );
        }
        cvModelSuboptions.push(
          <Form.Group
            key={cvSuboption.name}
            as={Row}
          >
            <Form.Label column sm="2">
              {cvSuboption.pretty_name}
              :
            </Form.Label>
            <Col sm="10">
              <Form.Control
                as="select"
                value={this.props.userData.user_cv_model[cvSuboption.name]}
                onChange={(e) => {
                  let { params } = this.props.userData;
                  params = params || {};
                  params[cvSuboption.name] = e.target.value;
                  this.updateUserData({ params });
                }}
              >
                {cvModelSuboptionsItems}
              </Form.Control>
            </Col>
          </Form.Group>,
        );
      }
    }
    return (
      <Segment secondary style={{ paddingBottom: 30, marginBottom: 10 }}>
        <Button
          variant="secondary"
          style={{ float: 'right' }}
          sm="2"
          onClick={() => this.setState({ showBugUi: true })}
        >
          {translate('report_a_bug')}
        </Button>
        <h2>Curriculum Vitae:</h2>
        <br />
        <h3>
          {translate('header')}
          :
        </h3>
        <br />
        <Form>
          {_.map(headerFields, field => (
            <CvHeaderField
              key={field.id}
              stateChanger={this.handleChangeHeader}
              curriculum={this.props.userData.cv}
              label={field.label}
              id={field.id}
              mandatory={field.mandatory}
              placeholder={field.placeholder}
            />
          ))
          }
        </Form>
        {_.map(cvFormFields, form => (
          <CvItemForm
            key={form.cvkey}
            chosenLabel={this.state.chosenLabel}
            label={form.label}
            cvkey={form.cvkey}
            curriculum={this.props.userData.cv}
            stateChanger={this.setCv}
            labelChanger={this.setLabel}
            fields={form.fields}
            optFields={form.optFields}
          />
        ))
        }
        <hr />
        <h3>
          {`${translate('reorder_cvareas')}:`}
        </h3>
        <br />
        <CvOrder
          setOrder={({ oldIndex, newIndex }) => this.updateUserData({
            cv_order: arrayMove(this.props.userData.cv_order, oldIndex, newIndex),
          })}
          cvOrder={this.props.userData.cv_order}
        />
        <br />
        <Form.Group as={Row}>
          <Form.Label column sm="2">
            {translate('model')}
            :
          </Form.Label>
          <Col sm="10">
            <Form.Control
              as="select"
              value={this.props.userData.user_cv_model}
              onChange={(e) => {
                this.updateUserData({
                  user_cv_model: e.target.value,
                  params: this.props.cv_models[e.target.value].fixed_params,
                });
              }}
            >
              {cvModelOptions}
            </Form.Control>
          </Col>
        </Form.Group>
        {cvModelSuboptions}
        <br />
        <br />
        <DropdownButton
          disabled={this.state.downloading}
          as={ButtonGroup}
          title={translate('download_as')}
          variant="secondary"
          size="sm"
          style={{ marginLeft: 5, float: 'right' }}
        >
        {_.map(cvDownloadFormats, downloadFormat => (
          <Dropdown.Item 
            key={downloadFormat.id}
            onClick={() => this.downloadCv(
              downloadFormat.id,
              downloadFormat.mimeContentType,
              downloadFormat.fileFormat
            )}
          >
            {downloadFormat.descriptor}
          </Dropdown.Item>
        ))}
        </DropdownButton>
        <Dropzone onDrop={files => this.uploadJSON(files)}>
          {({ getRootProps, getInputProps }) => (
            <Button
              {...getRootProps()}
              variant="secondary"
              size="sm"
              style={{ marginLeft: 5, float: 'right' }}
            >
              <input
                {...getInputProps()}
                type="file"
                id="file"
                style={{ display: 'none' }}
              />
              {translate('upload_json')}
            </Button>
          )}
        </Dropzone>
        {this.props.user !== null ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={this.saveOnAccount}
            style={{ marginLeft: 5, float: 'right' }}
          >
            {translate('save_cv_on_account')}
          </Button>
        ) : null}
        {this.props.user !== null ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => this.updateUserData({ autosave: !this.props.userData.autosave })}
            style={{ marginLeft: 5, float: 'right' }}
          >
            {this.props.userData.autosave ? translate('autosave_on') : translate('autosave_off')}
          </Button>
        ) : null}
        <BugReporter
          show={this.state.showBugUi}
          data={{
            userData: this.props.userData,
            lang: getActiveLocale(),
          }}
          onHide={() => this.setState({ showBugUi: false })}
        />
      </Segment>
    );
  }
}

export default Builder;
