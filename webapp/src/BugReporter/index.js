import React, { useState } from 'react';
import {
  Button, Form, Modal, OverlayTrigger, Row, Tooltip,
} from 'react-bootstrap';
import { toast } from 'react-toastify';

import gravitaesql from 'utils/gravitaesql';
import { translate } from 'i18n/locale';
import { BugReporterField } from './BugReporterField';
import { BugReporterCheckbox } from './BugReporterCheckbox';

const styles = {
  footerStyle: { paddingBottom: 0, paddingTop: 10, paddingLeft: 0 },
  footerRowStyle: { width: '100%', alignItems: 'center', margin: 10 },
};

export const BugReporter = (props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [sendState, setSendState] = useState(true);

  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {translate('report_a_bug')}
          :
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <BugReporterField
            label={translate('title')}
            value={title}
            placeholder={translate('title')}
            setter={setTitle}
          />
          <OverlayTrigger overlay={
            <Tooltip>{translate('optional')}</Tooltip>
          }
          >
            <BugReporterField
              label={translate('description')}
              value={description}
              long
              setter={setDescription}
            />
          </OverlayTrigger>
          <OverlayTrigger overlay={
            <Tooltip>{translate('optional')}</Tooltip>
          }
          >
            <BugReporterField
              label={translate('email')}
              value={email}
              setter={setEmail}
            />
          </OverlayTrigger>
        </Form>
      </Modal.Body>
      <Modal.Footer style={styles.footerStyle}>
        <Row style={styles.footerRowStyle}>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            onClick={() => {
              if (!title) {
                toast.error(translate('missing_title'));
                return;
              }
              gravitaesql(email, `
                mutation CreateBugReport($title: String!, $email: String, $description: String, $data: String) {
                  createBugReport(title: $title, email: $email, description: $description, data: $data)
                }
              `, {
                title,
                email,
                description,
                data: sendState ? JSON.stringify(props.data) : null,
              });
              setTitle('');
              setDescription('');
              setEmail('');
              props.onHide();
            }}
            size="sm"
          >
            {translate('send')}
          </Button>
          <BugReporterCheckbox
            sm="auto"
            style={{ marginLeft: 10, marginBottom: 0 }}
            label={translate('use_personal_data')}
            value={sendState}
            setter={setSendState}
          />
        </Row>
      </Modal.Footer>
    </Modal>
  );
};

export default BugReporter;
