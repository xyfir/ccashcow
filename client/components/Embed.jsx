import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';

// Constants
import STATUS from 'constants/status';

class Embed extends React.Component {

  constructor(props) {
    super(props);

    this.state = { payment: null };
  }

  componentWillMount() {
    const match = location.search.match(/payment_id=(\d+)/);

    request.get(`/api/payments/${+match[1]}`).end((err, res) => {
      if (err) return this._communicate(STATUS.ERROR, err);
      this.setState({ payment: res.body });
    });
  }

  /**
   * @param {number} status
   * @param {object} data
   */
  _communicate(status, data) {
    console.log('_communicate()', status, data);
    window.parent.postMessage({ status, data }, '*');
  }

  render() {
    const {payment} = this.state;

    if (!payment) return null;

    return (
      <div className='embed-entry'>
      </div>
    )
  }

}

render(<Embed />, document.getElementById('content'));