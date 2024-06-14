import React, { Component } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';

import { translate } from 'i18n/locale';

const SortableItem = SortableElement(({ value }) => (
  <Card bg="secondary" text="white" style={{ width: '200%', margin: '1px' }} className="text-center p-2">{value}</Card>
));

const SortableList = SortableContainer(({ cvOrder }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
      <ul className="Base-orderlist">
        {cvOrder.map((value, index) => (
          <SortableItem key={`item-${value}`} index={index} value={translate(value)} />
        ))}
      </ul>
  </div>
));

class CvOrder extends Component {
  render() {
    return (
      <SortableList
        cvOrder={this.props.cvOrder}
        onSortEnd={this.props.setOrder}
        useWindowAsScrollContainer
      />
    );
  }
}

CvOrder.propTypes = {
  cvOrder: PropTypes.array.isRequired,
  setOrder: PropTypes.func.isRequired,
};

export default CvOrder;
