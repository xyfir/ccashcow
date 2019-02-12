import AdminPanel from 'admyn/web';
import { render } from 'react-dom';
import React from 'react';

render(
  <AdminPanel
    title='xyPayments Admin'
    api='/admyn-bmWjQ5O3q9RCoP60YPb1Xu8mCsUVTCv5pHbtVC13dPDN3Fhp2w8l/'
  />,
  document.getElementById('content')
);